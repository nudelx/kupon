-- Kupon schema bootstrap for Supabase
--
-- Run this script in the Supabase SQL editor (or via Supabase CLI) to create the
-- tables, storage bucket, and row-level security policies expected by the app.

-- Extensions -----------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- Tables ---------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  join_code text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (group_id, user_id)
);

create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  code_text text,
  image_url text,
  expiration_date date,
  is_used boolean not null default false,
  owner_id uuid not null references auth.users (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null,
  share_slug text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  used_at timestamptz
);

-- Legacy compatibility: rename coupons.user_id -> owner_id if needed
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'coupons'
      and column_name = 'owner_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'coupons'
      and column_name = 'user_id'
  ) then
    execute 'alter table public.coupons rename column user_id to owner_id';
  end if;
end;
$$;

-- Ensure group_id column exists on coupons (legacy compatibility)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'coupons'
      and column_name = 'group_id'
  ) then
    alter table public.coupons add column group_id uuid references public.groups (id) on delete set null;
  end if;
end;
$$;

-- Trigger helpers ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

drop trigger if exists set_coupons_updated_at on public.coupons;
create trigger set_coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

-- Row Level Security ---------------------------------------------------------
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.coupons enable row level security;

-- Groups policies (drop/recreate for idempotency and updates)
drop policy if exists "Groups visible to members" on public.groups;
drop policy if exists "Create groups you own" on public.groups;
drop policy if exists "Owners manage their groups" on public.groups;
drop policy if exists "Owners can delete groups" on public.groups;

create policy "Groups visible to members"
  on public.groups for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
    )
  );

create policy "Create groups you own"
  on public.groups for insert
  with check (owner_id = auth.uid());

create policy "Owners manage their groups"
  on public.groups for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can delete groups"
  on public.groups for delete
  using (owner_id = auth.uid());

-- Allow authenticated users to join groups via join code through a secure RPC
drop function if exists public.join_group_with_code(text);

create or replace function public.join_group_with_code(join_code_input text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group public.groups;
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  select *
    into target_group
    from public.groups
   where join_code = join_code_input
   limit 1;

  if target_group.id is null then
    raise exception 'Invalid join code' using errcode = 'P0002';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (target_group.id, current_user_id, 'member')
  on conflict (group_id, user_id) do nothing;

  return target_group;
end;
$$;

grant execute on function public.join_group_with_code(text) to authenticated;

-- Group members policies
drop policy if exists "Read only your memberships" on public.group_members;
drop policy if exists "Join groups yourself" on public.group_members;
drop policy if exists "Update your membership role" on public.group_members;
drop policy if exists "Leave groups yourself" on public.group_members;

create policy "Read only your memberships"
  on public.group_members for select
  using (user_id = auth.uid());

create policy "Join groups yourself"
  on public.group_members for insert
  with check (user_id = auth.uid());

create policy "Update your membership role"
  on public.group_members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Leave groups yourself"
  on public.group_members for delete
  using (user_id = auth.uid());

-- Coupons policies
drop policy if exists "View coupons you own or share" on public.coupons;
drop policy if exists "Create coupons you own" on public.coupons;
drop policy if exists "Update coupons you control" on public.coupons;
drop policy if exists "Delete coupons you control" on public.coupons;

create policy "View coupons you own or share"
  on public.coupons for select
  using (
    (owner_id = auth.uid() and group_id is null)
    or (
      group_id is not null
      and exists (
        select 1 from public.group_members gm
        where gm.group_id = coupons.group_id
          and gm.user_id = auth.uid()
      )
    )
  );

create policy "Create coupons you own"
  on public.coupons for insert
  with check (
    owner_id = auth.uid()
    and (
      group_id is null
      or exists (
        select 1 from public.group_members gm
        where gm.group_id = coupons.group_id
          and gm.user_id = auth.uid()
      )
    )
  );

create policy "Update coupons you control"
  on public.coupons for update
  using (
    owner_id = auth.uid()
    and (
      group_id is null
      or exists (
        select 1 from public.group_members gm
        where gm.group_id = coupons.group_id
          and gm.user_id = auth.uid()
      )
    )
  )
  with check (
    owner_id = auth.uid()
    and (
      group_id is null
      or exists (
        select 1 from public.group_members gm
        where gm.group_id = coupons.group_id
          and gm.user_id = auth.uid()
      )
    )
  );

create policy "Delete coupons you control"
  on public.coupons for delete
  using (
    owner_id = auth.uid()
    and (
      group_id is null
      or exists (
        select 1 from public.group_members gm
        where gm.group_id = coupons.group_id
          and gm.user_id = auth.uid()
      )
    )
  );

-- Storage bucket -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('coupon-images', 'coupon-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access" on storage.objects;
drop policy if exists "Authenticated uploads" on storage.objects;
drop policy if exists "Owners manage their uploads" on storage.objects;
drop policy if exists "Owners can remove their uploads" on storage.objects;

create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'coupon-images');

create policy "Authenticated uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'coupon-images'
    and auth.role() = 'authenticated'
  );

create policy "Owners manage their uploads"
  on storage.objects for update using (
    bucket_id = 'coupon-images' and auth.uid() = owner
  ) with check (
    bucket_id = 'coupon-images' and auth.uid() = owner
  );

create policy "Owners can remove their uploads"
  on storage.objects for delete
  using (bucket_id = 'coupon-images' and auth.uid() = owner);

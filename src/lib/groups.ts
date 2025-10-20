import { supabase } from '@/lib/supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';
import { createJoinCode } from '@/utils/id';
import type { GroupRecord } from '@/types/group';

export const fetchGroupsForUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(
      `
      id,
      name,
      owner_id,
      join_code,
      created_at,
      members:group_members(user_id)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  type RawGroupRow = GroupRecord & { members: Array<{ user_id: string }> };
  const rows = ((data ?? []) as unknown) as RawGroupRow[];

  return rows
    .filter((group) => group.owner_id === userId || group.members.some((member) => member.user_id === userId))
    .map(({ id, name, owner_id, join_code, created_at }) => ({
      id,
      name,
      owner_id,
      join_code,
      created_at
    }));
};

export const createGroup = async ({ name, ownerId }: { name: string; ownerId: string }) => {
  const joinCode = createJoinCode();
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, owner_id: ownerId, join_code: joinCode })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { error: membershipError } = await supabase
    .from('group_members')
    .insert({ group_id: data.id, user_id: ownerId, role: 'admin' });

  if (membershipError) {
    throw membershipError;
  }

  return data as GroupRecord;
};

export const joinGroupWithCode = async ({ code, userId }: { code: string; userId: string }) => {
  if (!userId) {
    throw new Error('You must be signed in to join a group.');
  }

  const { data, error } = await supabase.rpc('join_group_with_code', { join_code_input: code });

  if (error) {
    const postgrestError = error as PostgrestError | null;
    if (postgrestError?.code === 'P0002') {
      throw new Error('We could not find a group with that join code.');
    }
    if (postgrestError?.code === 'P0001') {
      throw new Error('You must be signed in to join a group.');
    }
    throw error;
  }

  if (!data) {
    throw new Error('Unable to join group with the provided code.');
  }

  return data as GroupRecord;
};

export const leaveGroup = async ({ groupId, userId }: { groupId: string; userId: string }) => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};

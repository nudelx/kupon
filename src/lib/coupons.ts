import { supabase } from '@/lib/supabaseClient';
import { createShareSlug } from '@/utils/id';
import type { CouponFilters, CouponPayload, CouponRecord } from '@/types/coupon';

export const fetchCoupons = async ({ ownerId, groupId, groupIds = [] }: CouponFilters) => {
  let query = supabase
    .from('coupons')
    .select('*')
    .order('is_used', { ascending: true })
    .order('expiration_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (groupId) {
    query = query.eq('group_id', groupId);
  } else {
    const sanitizedGroupIds = groupIds.filter((value) => Boolean(value));

    if (sanitizedGroupIds.length) {
      const orFilters = [`owner_id.eq.${ownerId}`, `group_id.in.(${sanitizedGroupIds.join(',')})`];
      query = query.or(orFilters.join(','));
    } else {
      query = query.eq('owner_id', ownerId);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CouponRecord[];
};

export type CouponWithGroup = CouponRecord & {
  group?: { name: string } | null;
};

export const fetchCouponBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*, group:groups(name)')
    .eq('share_slug', slug)
    .single();

  if (error) {
    throw error;
  }

  return data as CouponWithGroup;
};

export const createCoupon = async (payload: CouponPayload & { owner_id: string }) => {
  const shareSlug = createShareSlug();
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      ...payload,
      owner_id: payload.owner_id,
      share_slug: shareSlug,
      is_used: false
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as CouponRecord;
};

export const updateCoupon = async (id: string, payload: CouponPayload) => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ ...payload })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as CouponRecord;
};

export const deleteCoupon = async (id: string) => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) {
    throw error;
  }
};

export const toggleCouponUsage = async ({ id, isUsed }: { id: string; isUsed: boolean }) => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ is_used: isUsed, used_at: isUsed ? new Date().toISOString() : null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as CouponRecord;
};

export const ensureShareSlug = async (id: string) => {
  const slug = createShareSlug();
  const { data, error } = await supabase
    .from('coupons')
    .update({ share_slug: slug })
    .eq('id', id)
    .select('share_slug')
    .single();

  if (error) {
    throw error;
  }

  return data?.share_slug as string;
};

export const subscribeToCouponChanges = (filters: CouponFilters, onChange: () => void) => {
  const channels: ReturnType<typeof supabase.channel>[] = [];

  const handleOn = (channel: ReturnType<typeof supabase.channel>, filter: string) => {
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coupons',
          filter
        },
        () => {
          onChange();
        }
      )
      .subscribe();
  };

  if (filters.groupId) {
    const channel = supabase.channel(`coupons-group-${filters.groupId}`);
    handleOn(channel, `group_id=eq.${filters.groupId}`);
    channels.push(channel);
  } else {
    const personalChannel = supabase.channel(`coupons-personal-${filters.ownerId}`);
    handleOn(personalChannel, `owner_id=eq.${filters.ownerId}`);
    channels.push(personalChannel);

    const uniqueGroupIds = Array.from(new Set((filters.groupIds ?? []).filter(Boolean)));
    uniqueGroupIds.forEach((groupId) => {
      const channel = supabase.channel(`coupons-group-${groupId}`);
      handleOn(channel, `group_id=eq.${groupId}`);
      channels.push(channel);
    });
  }

  return () => {
    channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
  };
};

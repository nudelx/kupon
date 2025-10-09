import { supabase } from '@/lib/supabaseClient';
import { createShareSlug } from '@/utils/id';
import type { CouponFilters, CouponPayload, CouponRecord } from './types';

export const fetchCoupons = async ({ ownerId, groupId }: CouponFilters) => {
  let query = supabase
    .from('coupons')
    .select('*')
    .order('is_used', { ascending: true })
    .order('expiration_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (groupId) {
    query = query.eq('group_id', groupId);
  } else {
    query = query.eq('owner_id', ownerId).is('group_id', null);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CouponRecord[];
};

export const fetchCouponBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('share_slug', slug)
    .single();

  if (error) {
    throw error;
  }

  return data as CouponRecord;
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
  const channel = supabase.channel(`coupons-${filters.groupId ?? 'personal'}`);

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'coupons',
        filter: filters.groupId ? `group_id=eq.${filters.groupId}` : `owner_id=eq.${filters.ownerId}`
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

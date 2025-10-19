import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  createCoupon,
  deleteCoupon,
  ensureShareSlug,
  fetchCoupons,
  subscribeToCouponChanges,
  toggleCouponUsage,
  updateCoupon
} from '@/lib/coupons';
import type { CouponFilters, CouponPayload } from '@/types/coupon';

const buildFilters = ({
  ownerId,
  groupId,
  groupIds
}: {
  ownerId: string;
  groupId?: string | null;
  groupIds?: string[];
}): CouponFilters => ({
  ownerId,
  groupId: groupId ?? null,
  groupIds
});

const normalizeGroupIds = (groupIds: string[]): string[] => {
  return Array.from(new Set(groupIds.filter(Boolean))).sort();
};

export const useCouponList = (groupId?: string | null, groupIds: string[] = []) => {
  const { user, isSignedIn } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const normalizedGroupIds = useMemo(() => normalizeGroupIds(groupIds), [groupIds]);
  const filters = useMemo(
    () => buildFilters({ ownerId: userId, groupId, groupIds: normalizedGroupIds }),
    [groupId, normalizedGroupIds, userId]
  );

  const query = useQuery({
    queryKey: ['coupons', filters],
    queryFn: () => fetchCoupons(filters),
    enabled: isSignedIn && Boolean(userId)
  });

  useEffect(() => {
    if (!isSignedIn || !userId) {
      return;
    }

    const unsubscribe = subscribeToCouponChanges(filters, () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', filters] }).catch(console.error);
    });

    return () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', filters] }).catch(console.error);
      unsubscribe();
    };
  }, [filters, isSignedIn, queryClient, userId]);

  return query;
};

export const useCreateCoupon = (groupId?: string | null, groupIds: string[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const normalizedGroupIds = useMemo(() => normalizeGroupIds(groupIds), [groupIds]);
  const ownerId = user?.id ?? '';
  const filters = useMemo(
    () => buildFilters({ ownerId, groupId, groupIds: normalizedGroupIds }),
    [groupId, normalizedGroupIds, ownerId]
  );

  return useMutation({
    mutationFn: (payload: CouponPayload) => {
      if (!user) {
        throw new Error('You must be signed in to add coupons.');
      }

      return createCoupon({ ...payload, owner_id: user.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons', filters] });
    }
  });
};

export const useUpdateCoupon = (groupId?: string | null, groupIds: string[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const normalizedGroupIds = useMemo(() => normalizeGroupIds(groupIds), [groupIds]);
  const ownerId = user?.id ?? '';
  const filters = useMemo(
    () => buildFilters({ ownerId, groupId, groupIds: normalizedGroupIds }),
    [groupId, normalizedGroupIds, ownerId]
  );

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CouponPayload }) => updateCoupon(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons', filters] });
    }
  });
};

export const useDeleteCoupon = (groupId?: string | null, groupIds: string[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const normalizedGroupIds = useMemo(() => normalizeGroupIds(groupIds), [groupIds]);
  const ownerId = user?.id ?? '';
  const filters = useMemo(
    () => buildFilters({ ownerId, groupId, groupIds: normalizedGroupIds }),
    [groupId, normalizedGroupIds, ownerId]
  );

  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons', filters] });
    }
  });
};

export const useToggleCouponUsage = (groupId?: string | null, groupIds: string[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const normalizedGroupIds = useMemo(() => normalizeGroupIds(groupIds), [groupIds]);
  const ownerId = user?.id ?? '';
  const filters = useMemo(
    () => buildFilters({ ownerId, groupId, groupIds: normalizedGroupIds }),
    [groupId, normalizedGroupIds, ownerId]
  );

  return useMutation({
    mutationFn: ({ id, isUsed }: { id: string; isUsed: boolean }) => toggleCouponUsage({ id, isUsed }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons', filters] });
    }
  });
};

export const useEnsureShareLink = () => {
  return useMutation({
    mutationFn: (couponId: string) => ensureShareSlug(couponId)
  });
};

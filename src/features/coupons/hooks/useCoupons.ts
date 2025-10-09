import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import {
  createCoupon,
  deleteCoupon,
  ensureShareSlug,
  fetchCoupons,
  subscribeToCouponChanges,
  toggleCouponUsage,
  updateCoupon
} from '../api';
import type { CouponPayload } from '../types';

export const useCouponList = (groupId?: string | null) => {
  const { user, isSignedIn } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const filters = useMemo(() => ({ ownerId: userId, groupId: groupId ?? null }), [groupId, userId]);

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

export const useCreateCoupon = (groupId?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const filters = { ownerId: user?.id ?? '', groupId: groupId ?? null };

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

export const useUpdateCoupon = (groupId?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const filters = { ownerId: user?.id ?? '', groupId: groupId ?? null };

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CouponPayload }) => updateCoupon(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons', filters] });
    }
  });
};

export const useDeleteCoupon = (groupId?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const filters = { ownerId: user?.id ?? '', groupId: groupId ?? null };

  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupons', filters] });
    }
  });
};

export const useToggleCouponUsage = (groupId?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const filters = { ownerId: user?.id ?? '', groupId: groupId ?? null };

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

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCreateGroup, useGroups, useJoinGroup } from '@/features/groups/hooks/useGroups';
import { CouponModal } from '@/components/CouponModal';
import { CouponList } from '@/features/coupons/components/CouponList';
import { useCouponList, useCreateCoupon, useDeleteCoupon, useEnsureShareLink, useToggleCouponUsage, useUpdateCoupon } from '@/features/coupons/hooks/useCoupons';
import type { CouponPayload, CouponRecord } from '@/features/coupons/types';
import { useWeeklyReminder } from '@/hooks/useWeeklyReminder';

export const DashboardPage = () => {
  const { groupId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const joinCode = searchParams.get('join');
  const { data: groups = [], isLoading: isLoadingGroups } = useGroups();
  const joinGroupMutation = useJoinGroup();
  const createGroupMutation = useCreateGroup();
  const { data: coupons = [], isLoading: isLoadingCoupons } = useCouponList(groupId);
  const createCouponMutation = useCreateCoupon(groupId);
  const updateCouponMutation = useUpdateCoupon(groupId);
  const deleteCouponMutation = useDeleteCoupon(groupId);
  const toggleCouponMutation = useToggleCouponUsage(groupId);
  const ensureShareLinkMutation = useEnsureShareLink();
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reminder = useWeeklyReminder(coupons);
  const activeGroup = useMemo(() => groups.find((group) => group.id === groupId) ?? null, [groupId, groups]);

  useEffect(() => {
    if (joinCode) {
      joinGroupMutation.mutate(joinCode, {
        onSettled: () => {
          const next = new URLSearchParams(searchParams);
          next.delete('join');
          setSearchParams(next, { replace: true });
        }
      });
    }
  }, [joinCode, joinGroupMutation, searchParams, setSearchParams]);

  const handleCreate = async (payload: CouponPayload) => {
    await createCouponMutation.mutateAsync(payload);
  };

  const handleUpdate = async (payload: CouponPayload) => {
    if (!editingCoupon) {
      return;
    }
    await updateCouponMutation.mutateAsync({ id: editingCoupon.id, payload });
    setEditingCoupon(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (coupon: CouponRecord) => {
    if (window.confirm(`Remove ${coupon.title}?`)) {
      await deleteCouponMutation.mutateAsync(coupon.id);
    }
  };

  const handleToggleUsed = async (coupon: CouponRecord) => {
    await toggleCouponMutation.mutateAsync({ id: coupon.id, isUsed: !coupon.is_used });
  };

  const handleShareLink = async (coupon: CouponRecord) => {
    const slug = coupon.share_slug
      ? coupon.share_slug
      : await ensureShareLinkMutation.mutateAsync(coupon.id);
    return `${window.location.origin}/share/${slug}`;
  };

  const handleEditCoupon = (coupon: CouponRecord) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const onSubmit = editingCoupon ? handleUpdate : handleCreate;
  const isSaving = editingCoupon ? updateCouponMutation.isPending : createCouponMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-warm mb-2">
              {isLoadingGroups ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Loading...</span>
                </div>
              ) : (
                activeGroup ? activeGroup.name : 'Personal coupons'
              )}
            </h1>
            <p className="text-warm-muted text-sm sm:text-base leading-relaxed">
              {activeGroup
                ? 'Coupons shared with this group update instantly for every member.'
                : 'Keep your personal coupons handy or assign them to a group for sharing.'}
            </p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="btn-friendly btn-mobile gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Coupon
          </button>
        </div>
      </section>

      {/* Expiration Reminder */}
      {reminder.shouldRemind ? (
        <div role="alert" className="alert alert-warning mb-6 shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <strong className="font-semibold">Coupons expiring soon:</strong>
            <div className="mt-1 text-sm">
              {reminder.soonExpiring.map((coupon) => coupon.title).join(', ')}
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-ghost" 
            onClick={reminder.acknowledge}
          >
            Got it
          </button>
        </div>
      ) : null}

      {/* Coupon List */}
      <div className="w-full">
        {isLoadingCoupons ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <CouponList
            coupons={coupons}
            onEdit={handleEditCoupon}
            onDelete={handleDelete}
            onToggleUsed={handleToggleUsed}
            onShare={handleShareLink}
          />
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={handleOpenModal}
        className="fab btn btn-primary btn-circle btn-lg sm:hidden"
        aria-label="Add new coupon"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Coupon Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        groups={groups}
        defaultGroupId={groupId ?? null}
        initialCoupon={editingCoupon}
        onSubmit={onSubmit}
        isSaving={isSaving}
      />
    </div>
  );
};

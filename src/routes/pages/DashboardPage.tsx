import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCreateGroup, useGroups, useJoinGroup } from '@/features/groups/hooks/useGroups';
import { CouponComposer } from '@/features/coupons/components/CouponComposer';
import { CouponList } from '@/features/coupons/components/CouponList';
import { useCouponList, useCreateCoupon, useDeleteCoupon, useEnsureShareLink, useToggleCouponUsage, useUpdateCoupon } from '@/features/coupons/hooks/useCoupons';
import type { CouponPayload, CouponRecord } from '@/features/coupons/types';
import { useWeeklyReminder } from '@/hooks/useWeeklyReminder';

export const DashboardPage = () => {
  const { groupId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const joinCode = searchParams.get('join');
  const { data: groups = [] } = useGroups();
  const joinGroupMutation = useJoinGroup();
  const createGroupMutation = useCreateGroup();
  const { data: coupons = [], isLoading: isLoadingCoupons } = useCouponList(groupId);
  const createCouponMutation = useCreateCoupon(groupId);
  const updateCouponMutation = useUpdateCoupon(groupId);
  const deleteCouponMutation = useDeleteCoupon(groupId);
  const toggleCouponMutation = useToggleCouponUsage(groupId);
  const ensureShareLinkMutation = useEnsureShareLink();
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
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

  const onSubmit = editingCoupon ? handleUpdate : handleCreate;
  const isSaving = editingCoupon ? updateCouponMutation.isPending : createCouponMutation.isPending;

  return (
    <div className="container mx-auto p-4">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{activeGroup ? activeGroup.name : 'Personal coupons'}</h1>
          <p className="text-base-content/70">
            {activeGroup
              ? 'Coupons shared with this group update instantly for every member.'
              : 'Keep your personal coupons handy or assign them to a group for sharing.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const name = prompt('Name your new group');
            if (name) {
              createGroupMutation.mutate(name, {
                onSuccess: (group) => {
                  alert(`Group "${group.name}" created. Share code: ${group.join_code}`);
                },
                onError: (error) => {
                  alert(error instanceof Error ? error.message : 'Unable to create group');
                }
              });
            }
          }}
          className="btn btn-primary"
        >
          New group
        </button>
      </section>

      {reminder.shouldRemind ? (
        <div role="alert" className="alert alert-warning mb-4">
          <div>
            <strong>Coupons expiring soon:</strong>{' '}
            {reminder.soonExpiring.map((coupon) => coupon.title).join(', ')}
          </div>
          <button type="button" className="btn btn-sm" onClick={reminder.acknowledge}>
            Got it
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CouponComposer
            groups={groups}
            defaultGroupId={groupId ?? null}
            initialCoupon={editingCoupon}
            onSubmit={onSubmit}
            onCancelEdit={() => setEditingCoupon(null)}
            isSaving={isSaving}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Coupons</h2>
              {isLoadingCoupons ? <span className="loading loading-spinner"></span> : null}
              <CouponList
                coupons={coupons}
                onEdit={setEditingCoupon}
                onDelete={handleDelete}
                onToggleUsed={handleToggleUsed}
                onShare={handleShareLink}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

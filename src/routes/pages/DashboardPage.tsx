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
    <div className="dashboard">
      <section className="page-heading">
        <div>
          <h1>{activeGroup ? activeGroup.name : 'Personal coupons'}</h1>
          <p>
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
          className="ghost"
        >
          New group
        </button>
      </section>

      {reminder.shouldRemind ? (
        <section className="banner warning">
          <div>
            <strong>Coupons expiring soon:</strong>{' '}
            {reminder.soonExpiring.map((coupon) => coupon.title).join(', ')}
          </div>
          <button type="button" className="ghost" onClick={reminder.acknowledge}>
            Got it
          </button>
        </section>
      ) : null}

      <div className="dashboard-grid">
        <CouponComposer
          groups={groups}
          defaultGroupId={groupId ?? null}
          initialCoupon={editingCoupon}
          onSubmit={onSubmit}
          onCancelEdit={() => setEditingCoupon(null)}
          isSaving={isSaving}
        />
        <section className="card">
          <header className="card__header">
            <h2>Coupons</h2>
            {isLoadingCoupons ? <span className="muted">Loading…</span> : null}
          </header>
          <CouponList
            coupons={coupons}
            onEdit={setEditingCoupon}
            onDelete={handleDelete}
            onToggleUsed={handleToggleUsed}
            onShare={handleShareLink}
          />
        </section>
      </div>
    </div>
  );
};

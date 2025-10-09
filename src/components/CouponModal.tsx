import { useState, useEffect } from 'react';
import { Modal, ModalBody } from '@/components/ui';
import { CouponForm } from '@/components/coupons/CouponForm';
import type { GroupRecord } from '@/features/groups/api';
import type { CouponPayload, CouponRecord } from '@/features/coupons/types';

export type CouponModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupRecord[];
  defaultGroupId?: string | null;
  initialCoupon?: CouponRecord | null;
  onSubmit: (payload: CouponPayload) => Promise<void>;
  isSaving: boolean;
};

export const CouponModal = ({
  isOpen,
  onClose,
  groups,
  defaultGroupId,
  initialCoupon,
  onSubmit,
  isSaving,
}: CouponModalProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'personal'>('personal');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultGroupId) {
      setSelectedGroupId(defaultGroupId);
    }
  }, [defaultGroupId]);

  useEffect(() => {
    if (initialCoupon?.group_id) {
      setSelectedGroupId(initialCoupon.group_id);
    }
  }, [initialCoupon]);

  const handleSubmit = async (data: {
    title: string;
    description: string;
    codeText: string;
    imageUrl: string;
    expirationDate: string;
  }) => {
    setError(null);
    
    try {
      const payload: CouponPayload = {
        title: data.title,
        description: data.description || null,
        code_text: data.codeText || null,
        image_url: data.imageUrl || null,
        expiration_date: data.expirationDate || null,
        group_id: selectedGroupId === 'personal' ? null : selectedGroupId,
      };
      
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save coupon');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCoupon ? 'Edit Coupon' : 'Add New Coupon'}
      size="lg"
    >
      <ModalBody>
        <div className="space-y-4">
          {/* Group Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Group</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value as string | 'personal')}
            >
              <option value="personal">Personal</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Coupon Form */}
          <CouponForm
            coupon={initialCoupon}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isSaving}
            error={error}
          />
        </div>
      </ModalBody>
    </Modal>
  );
};
import type { CouponRecord } from '../types';
import { CouponCard } from '@/components/coupons/CouponCard';
import { EmptyCouponList } from '@/components/coupons/EmptyCouponList';

export type CouponListProps = {
  coupons: CouponRecord[];
  onEdit: (coupon: CouponRecord) => void;
  onDelete: (coupon: CouponRecord) => void;
  onToggleUsed: (coupon: CouponRecord) => void;
  onShare: (coupon: CouponRecord) => Promise<string>;
};

export const CouponList = ({ coupons, onEdit, onDelete, onToggleUsed, onShare }: CouponListProps) => {
  if (!coupons.length) {
    return <EmptyCouponList />;
  }

  return (
    <div className="grid-mobile">
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleUsed={onToggleUsed}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

import CouponCard, { type Coupon } from './CouponCard';

export default function CouponList({ coupons }: { coupons: Coupon[] }) {
  if (!coupons || coupons.length === 0) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500">You have no coupons yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}

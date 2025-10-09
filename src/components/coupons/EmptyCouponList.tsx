export const EmptyCouponList = () => {
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <svg className="w-16 h-16 mx-auto mb-4 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-xl font-semibold text-base-content mb-2">No coupons yet</h2>
        <p className="text-base-content/70 text-sm leading-relaxed">
          Add your first coupon or claim a group code to see shared deals.
        </p>
      </div>
    </div>
  );
};

import { format, isBefore, isWithinInterval, parseISO } from 'date-fns';
import type { CouponRecord } from '../types';

export type CouponListProps = {
  coupons: CouponRecord[];
  onEdit: (coupon: CouponRecord) => void;
  onDelete: (coupon: CouponRecord) => void;
  onToggleUsed: (coupon: CouponRecord) => void;
  onShare: (coupon: CouponRecord) => Promise<string>;
};

const resolveExpirationLabel = (expirationDate: string | null) => {
  if (!expirationDate) {
    return { label: 'No expiration date', className: 'badge-neutral' };
  }

  const date = parseISO(expirationDate);
  const now = new Date();

  if (isBefore(date, now)) {
    return { label: `Expired ${format(date, 'MMM d, yyyy')}`, className: 'badge-error' };
  }

  if (
    isWithinInterval(date, {
      start: now,
      end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    })
  ) {
    return { label: `Expires soon (${format(date, 'MMM d')})`, className: 'badge-warning' };
  }

  return { label: `Expires ${format(date, 'MMM d, yyyy')}`, className: 'badge-success' };
};

export const CouponList = ({ coupons, onEdit, onDelete, onToggleUsed, onShare }: CouponListProps) => {
  if (!coupons.length) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">No coupons yet</h2>
        <p className="text-base-content/70">Add your first coupon or claim a group code to see shared deals.</p>
      </div>
    );
  }

  const handleShare = async (coupon: CouponRecord) => {
    const url = await onShare(coupon);
    try {
      if (navigator.share) {
        await navigator.share({ title: coupon.title, text: coupon.description ?? undefined, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Link copied! Share it with your group.');
      } else {
        window.prompt('Copy this link to share', url);
      }
    } catch (error) {
      console.error('Failed to share coupon', error);
      window.prompt('Copy this link to share', url);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coupons.map((coupon) => {
        const expiration = resolveExpirationLabel(coupon.expiration_date);
        return (
          <div key={coupon.id} className={`card bg-base-200 shadow-xl ${coupon.is_used ? 'opacity-50' : ''}`}>
            {coupon.image_url ? (
              <figure><img src={coupon.image_url} alt={coupon.title} /></figure>
            ) : null}
            <div className="card-body">
              <h2 className="card-title">
                {coupon.title}
                <div className={`badge ${expiration.className}`}>{expiration.label}</div>
              </h2>
              {coupon.description ? <p>{coupon.description}</p> : null}
              {coupon.code_text ? (
                <div className="mockup-code">
                  <pre><code>{coupon.code_text}</code></pre>
                </div>
              ) : null}
              <div className="card-actions justify-end">
                <button type="button" onClick={() => onToggleUsed(coupon)} className="btn btn-ghost btn-sm">
                  {coupon.is_used ? 'Mark unused' : 'Mark used'}
                </button>
                <button type="button" onClick={() => onEdit(coupon)} className="btn btn-ghost btn-sm">
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(coupon)} className="btn btn-ghost btn-sm text-error">
                  Remove
                </button>
                <button type="button" onClick={() => handleShare(coupon)} className="btn btn-ghost btn-sm">
                  Share link
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

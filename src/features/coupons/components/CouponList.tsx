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
    return { label: 'No expiration date', tone: 'muted' as const };
  }

  const date = parseISO(expirationDate);
  const now = new Date();

  if (isBefore(date, now)) {
    return { label: `Expired ${format(date, 'MMM d, yyyy')}`, tone: 'danger' as const };
  }

  if (
    isWithinInterval(date, {
      start: now,
      end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    })
  ) {
    return { label: `Expires soon (${format(date, 'MMM d')})`, tone: 'warning' as const };
  }

  return { label: `Expires ${format(date, 'MMM d, yyyy')}`, tone: 'success' as const };
};

export const CouponList = ({ coupons, onEdit, onDelete, onToggleUsed, onShare }: CouponListProps) => {
  if (!coupons.length) {
    return (
      <div className="empty-state">
        <h2>No coupons yet</h2>
        <p>Add your first coupon or claim a group code to see shared deals.</p>
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
    <div className="coupon-grid">
      {coupons.map((coupon) => {
        const expiration = resolveExpirationLabel(coupon.expiration_date);
        return (
          <article key={coupon.id} className={coupon.is_used ? 'coupon-card used' : 'coupon-card'}>
            {coupon.image_url ? (
              <img src={coupon.image_url} alt={coupon.title} className="coupon-card__image" />
            ) : null}
            <div className="coupon-card__content">
              <header>
                <h3>{coupon.title}</h3>
                <span className={`badge ${expiration.tone}`}>{expiration.label}</span>
              </header>
              {coupon.description ? <p>{coupon.description}</p> : null}
              {coupon.code_text ? (
                <code className="coupon-code" aria-label="Coupon code">
                  {coupon.code_text}
                </code>
              ) : null}
              <footer className="coupon-card__actions">
                <button type="button" onClick={() => onToggleUsed(coupon)} className="ghost">
                  {coupon.is_used ? 'Mark unused' : 'Mark used'}
                </button>
                <button type="button" onClick={() => onEdit(coupon)} className="ghost">
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(coupon)} className="ghost danger">
                  Remove
                </button>
                <button type="button" onClick={() => handleShare(coupon)} className="ghost">
                  Share link
                </button>
              </footer>
            </div>
          </article>
        );
      })}
    </div>
  );
};

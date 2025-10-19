import { format, isBefore, isWithinInterval, parseISO } from 'date-fns';
import { useState } from 'react';
import type { CouponRecord } from '@/types/coupon';
import { ImagePreview } from '@/components/ui';

export type CouponListProps = {
  coupons: CouponRecord[];
  onEdit: (coupon: CouponRecord) => void;
  onDelete: (coupon: CouponRecord) => void;
  onToggleUsed: (coupon: CouponRecord) => void;
  onShare: (coupon: CouponRecord) => Promise<string>;
  groupNames?: Record<string, string>;
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

export const CouponList = ({ coupons, onEdit, onDelete, onToggleUsed, onShare, groupNames }: CouponListProps) => {
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);

  const handleImageClick = (imageUrl: string, title: string) => {
    setPreviewImage({ url: imageUrl, alt: title });
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (!coupons.length) {
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
  }

  const handleShare = async (coupon: CouponRecord) => {
    const url = await onShare(coupon);
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    } catch (error) {
      console.error('Failed to copy link', error);
      alert('Failed to copy link');
    }
  };

  return (
    <>
      <div className="grid-mobile">
        {coupons.map((coupon) => {
          const expiration = resolveExpirationLabel(coupon.expiration_date);
          const groupLabel = coupon.group_id ? groupNames?.[coupon.group_id] : null;
          return (
            <div
              key={coupon.id}
              className={`card-friendly hover:shadow-soft-lg transition-shadow duration-200 ${coupon.is_used ? 'opacity-60' : ''}`}
            >
              {coupon.image_url ? (
                <figure className="relative">
                  <img
                    src={coupon.image_url}
                    alt={coupon.title}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={() => handleImageClick(coupon.image_url!, coupon.title)}
                  />
                  {coupon.is_used && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">USED</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </figure>
              ) : null}

              <div className="card-body card-mobile">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="card-title text-lg font-semibold text-base-content line-clamp-2 flex-1">{coupon.title}</h2>
                    {groupLabel ? <span className="badge badge-info badge-sm flex-shrink-0">{groupLabel}</span> : null}
                  </div>
                  <div className={`badge ${expiration.className} mt-2`}>{expiration.label}</div>
                </div>

                {coupon.description ? (
                  <p className="text-base-content/80 text-sm mb-4 line-clamp-3">{coupon.description}</p>
                ) : null}

                {coupon.code_text ? (
                  <div className="relative mb-4">
                    <div className="mockup-code text-sm">
                      <pre className="p-2">
                        <code className="text-primary font-mono">{coupon.code_text}</code>
                      </pre>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm absolute top-1 right-1 touch-target"
                      onClick={() => navigator.clipboard.writeText(coupon.code_text!)}
                      aria-label="Copy code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                ) : null}

                <div className="card-actions flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleUsed(coupon)}
                      className={`btn btn-outline btn-xs sm:btn-sm ${coupon.is_used ? 'btn-warning' : 'btn-success'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {coupon.is_used ? 'Mark unused' : 'Mark used'}
                    </button>
                  </div>

                  <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end row with space">
                    <button
                      type="button"
                      onClick={() => onDelete(coupon)}
                      className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error hover:text-error-content"
                      aria-label="Delete coupon"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2 sm:ml-2">
                      <button
                        type="button"
                        onClick={() => onEdit(coupon)}
                        className="btn btn-ghost btn-xs sm:btn-sm"
                        aria-label="Edit coupon"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(coupon)}
                        className="btn btn-ghost btn-xs sm:btn-sm"
                        aria-label="Share coupon"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewImage ? (
        <ImagePreview isOpen={!!previewImage} onClose={closePreview} imageUrl={previewImage.url} alt={previewImage.alt} />
      ) : null}
    </>
  );
};

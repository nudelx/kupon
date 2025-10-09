import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCouponBySlug } from '@/features/coupons/api';
import { format, parseISO } from 'date-fns';

export const SharedCouponPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { data: coupon, isLoading, isError } = useQuery({
    queryKey: ['shared-coupon', slug],
    queryFn: () => fetchCouponBySlug(slug as string),
    enabled: Boolean(slug)
  });

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <span className="loading loading-lg"></span>
            <p>Loading coupon…</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Coupon not found</h1>
            <p className="py-6">This share link might be expired or the coupon was removed.</p>
            <button type="button" onClick={goHome} className="btn btn-primary">
              Go to app
            </button>
          </div>
        </div>
      </div>
    );
  }

  const expiration = coupon.expiration_date
    ? format(parseISO(coupon.expiration_date), 'PPP')
    : 'No expiration date';

  const shareLink = `${window.location.origin}/share/${coupon.share_slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: coupon.title,
        text: coupon.description ?? 'Shared via Kupon',
        url: shareLink
      });
    } else {
      await navigator.clipboard.writeText(shareLink);
      alert('Copied share link to clipboard.');
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="card w-full max-w-lg shadow-2xl bg-base-100">
          <div className="card-body">
            <div className="card-title">
              <h1>{coupon.title}</h1>
              <div className="badge badge-secondary">Shared with you</div>
            </div>
            {coupon.image_url ? (
              <figure className="my-4"><img src={coupon.image_url} alt={coupon.title} className="rounded-xl" /></figure>
            ) : null}
            {coupon.description ? <p>{coupon.description}</p> : null}
            {coupon.code_text ? <div className="mockup-code my-4"><pre><code>{coupon.code_text}</code></pre></div> : null}
            <p className="text-sm text-base-content/70">Expiration: {expiration}</p>
            <div className="card-actions justify-end mt-4">
              <button type="button" className="btn btn-outline" onClick={handleShare}>
                Share onwards
              </button>
              <button type="button" className="btn btn-primary" onClick={goHome}>
                Open Kupon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

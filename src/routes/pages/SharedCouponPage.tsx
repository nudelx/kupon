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
      <div className="centered">
        <p>Loading coupon…</p>
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="centered">
        <section className="card">
          <h2>Coupon not found</h2>
          <p>This share link might be expired or the coupon was removed.</p>
          <button type="button" onClick={goHome} className="ghost">
            Go to app
          </button>
        </section>
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
    <div className="shared-coupon">
      <section className="card">
        <header className="card__header">
          <h1>{coupon.title}</h1>
          <span className="badge">Shared with you</span>
        </header>
        {coupon.image_url ? (
          <img src={coupon.image_url} alt={coupon.title} className="shared-coupon__image" />
        ) : null}
        {coupon.description ? <p>{coupon.description}</p> : null}
        {coupon.code_text ? <code className="coupon-code">{coupon.code_text}</code> : null}
        <p className="muted">Expiration: {expiration}</p>
        <footer className="shared-coupon__actions">
          <button type="button" className="ghost" onClick={handleShare}>
            Share onwards
          </button>
          <button type="button" className="ghost" onClick={goHome}>
            Open Kupon
          </button>
        </footer>
      </section>
    </div>
  );
};

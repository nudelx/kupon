import { FormEvent, useState } from 'react';
import { useAuth } from './useAuth';

type SignInPanelProps = {
  hasRequestedLink: boolean;
  onRequestComplete: () => void;
};

export const SignInPanel = ({ hasRequestedLink, onRequestComplete }: SignInPanelProps) => {
  const { signInWithOtp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError('Enter your email to receive a sign-in link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithOtp({ email });
      onRequestComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleRedirecting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      setIsGoogleRedirecting(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-panel__brand">
        <span className="auth-panel__logo" aria-hidden="true">
          🎟️
        </span>
        <div>
          <h1>Welcome back</h1>
          <p className="auth-panel__subtitle">Keep every family coupon in one live, shareable place.</p>
        </div>
      </div>

      <div className="auth-panel__body">
        <button
          type="button"
          className="oauth-button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleRedirecting}
        >
          <span className="oauth-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.64 9.2045C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.8486H13.8436C13.635 11.9736 13.005 12.9236 12.0541 13.5581V15.8209H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z"
                fill="#4285F4"
              />
              <path
                d="M9 18C11.43 18 13.4673 17.1945 14.9564 15.8209L12.0541 13.5581C11.2486 14.0981 10.2118 14.4209 9 14.4209C6.6555 14.4209 4.67182 12.8381 3.96455 10.71H0.957275V13.0481C2.43818 15.9836 5.48182 18 9 18Z"
                fill="#34A853"
              />
              <path
                d="M3.96455 10.71C3.78455 10.17 3.68182 9.59364 3.68182 9C3.68182 8.40636 3.78455 7.83 3.96455 7.29V4.95182H0.957275C0.347727 6.17182 0 7.54773 0 9C0 10.4523 0.347727 11.8282 0.957275 13.0481L3.96455 10.71Z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.57909C10.32 3.57909 11.5082 4.03364 12.4459 4.92727L15.0218 2.35136C13.4627 0.891818 11.4255 0 9 0C5.48182 0 2.43818 2.01636 0.957275 4.95182L3.96455 7.29C4.67182 5.16182 6.6555 3.57909 9 3.57909Z"
                fill="#EA4335"
              />
            </svg>
          </span>
          {isGoogleRedirecting ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="divider">
          <span>Prefer email?</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending link…' : 'Send me a magic link'}
          </button>
          {error ? <p className="form-error">{error}</p> : null}
          {hasRequestedLink ? (
            <p className="form-helper">
              Magic link sent! Check your inbox and open it on any device to jump back into Kupon.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
};

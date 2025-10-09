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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Welcome back!</h1>
          <p className="py-6">Keep every family coupon in one live, shareable place.</p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleRedirecting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.902,35.126,48,30.028,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path>
              </svg>
              {isGoogleRedirecting ? 'Redirecting…' : 'Continue with Google'}
            </button>
            <div className="divider">OR</div>
            <form onSubmit={handleSubmit}>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Email</span>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending link…' : 'Send me a magic link'}
                </button>
              </div>
              {error ? <div role="alert" className="alert alert-error mt-4"><p>{error}</p></div> : null}
              {hasRequestedLink ? (
                <div role="alert" className="alert alert-success mt-4">
                  <p>Magic link sent! Check your inbox and open it on any device to jump back into Kupon.</p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

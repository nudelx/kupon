import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SignInPanel } from '@/components/auth/SignInPanel';

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { isLoading, isSignedIn } = useAuth();
  const [hasRequestedLink, setHasRequestedLink] = useState(false);

  if (isLoading) {
    return (
      <div className="centered">
        <p>Loading session…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignInPanel hasRequestedLink={hasRequestedLink} onRequestComplete={() => setHasRequestedLink(true)} />;
  }

  return <>{children}</>;
};

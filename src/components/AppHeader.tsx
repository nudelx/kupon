import { useAuth } from '@/features/auth/useAuth';

export const AppHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Swallow error for now; can enhance with toast system later.
      console.error('Sign-out failed', error);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-logo">🎟️</span>
        <div>
          <h1>Kupon</h1>
          <p>Keep track of every family deal.</p>
        </div>
      </div>
      <div className="app-header__actions">
        <span className="app-header__user">{user?.email}</span>
        <button type="button" onClick={handleSignOut} className="ghost">
          Sign out
        </button>
      </div>
    </header>
  );
};

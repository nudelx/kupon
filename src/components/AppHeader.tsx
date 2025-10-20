import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import packageJson from '../../package.json';

type UserWithAvatar = {
  email: string;
  avatar_url?: string;
};

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Swallow error for now; can enhance with toast system later.
      console.error('Sign-out failed', error);
    }
  };

  return (
    <div className="navbar header-friendly">
      <div className="flex-1">
        <label htmlFor="my-drawer-2" className="btn btn-ghost btn-square lg:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <a className="btn btn-ghost text-xl font-bold text-primary hover:text-primary flex items-center justify-start">
          Kupon
          <span className="text-xs text-gray-500 ml-2">v{packageJson.version}</span>
        </a>
      </div>
      <div className="flex-none gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle touch-target"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
        
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar touch-target">
              <div className="w-8 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                <img alt={user.email} src={(user as UserWithAvatar).avatar_url ?? `https://ui-avatars.com/api/?name=${user.email}&background=random`} />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-soft-lg menu menu-sm dropdown-content bg-base-100 rounded-lg w-52 border border-base-300">
              <li>
                <a className="justify-between text-base-content">
                  Profile
                  <span className="badge badge-primary">New</span>
                </a>
              </li>
              <li><a className="text-base-content">Settings</a></li>
              <li><a onClick={handleSignOut} className="text-error hover:text-error">Logout</a></li>
            </ul>
          </div>
        ) : (
          <div className="skeleton w-10 h-10 rounded-full"/>
        )}
      </div>
    </div>
  );
};

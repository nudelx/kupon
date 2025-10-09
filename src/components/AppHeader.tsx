import { useAuth } from '@/features/auth/useAuth';

type UserWithAvatar = {
  email: string;
  avatar_url?: string;
};

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
    <div className="navbar header-friendly">
      <div className="flex-1">
        <label htmlFor="my-drawer-2" className="btn btn-ghost btn-square lg:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <a className="btn btn-ghost text-xl font-bold text-blue-600 hover:text-blue-700">Kupon</a>
      </div>
      <div className="flex-none gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar touch-target">
              <div className="w-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-white">
                <img alt={user.email} src={(user as UserWithAvatar).avatar_url ?? `https://ui-avatars.com/api/?name=${user.email}&background=random`} />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-soft-lg menu menu-sm dropdown-content bg-white rounded-lg w-52 border border-gray-200">
              <li>
                <a className="justify-between text-warm">
                  Profile
                  <span className="badge bg-blue-100 text-blue-700">New</span>
                </a>
              </li>
              <li><a className="text-warm">Settings</a></li>
              <li><a onClick={handleSignOut} className="text-red-600 hover:text-red-700">Logout</a></li>
            </ul>
          </div>
        ) : (
          <div className="skeleton w-10 h-10 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

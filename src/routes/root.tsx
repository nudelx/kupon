import { Outlet } from 'react-router-dom';
import { AuthGate } from '@/features/auth/AuthGate';
import { AppHeader } from '@/components/AppHeader';
import { GroupSidebar } from '@/features/groups/components/GroupSidebar';

export const RootLayout = () => {
  return (
    <AuthGate>
      <div className="app-shell">
        <AppHeader />
        <div className="app-shell__body">
          <GroupSidebar />
          <main className="app-shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGate>
  );
};

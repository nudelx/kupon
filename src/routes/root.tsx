import { Outlet } from 'react-router-dom';
import { AuthGate } from '@/features/auth/AuthGate';
import { AppHeader } from '@/components/AppHeader';
import { GroupSidebar } from '@/features/groups/components/GroupSidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const RootLayout = () => {
  return (
    <ThemeProvider>
      <AuthGate>
        <div className="text-base-content min-h-screen">
          <AppHeader />
          <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <div className="section-mobile">
                <Outlet />
              </div>
            </div>
            <div className="drawer-side">
              <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
              <GroupSidebar />
            </div>
          </div>
        </div>
      </AuthGate>
    </ThemeProvider>
  );
};

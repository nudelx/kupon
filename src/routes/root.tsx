import { Outlet } from 'react-router-dom';
import { AuthGate } from '@/components/auth/AuthGate';
import { AppHeader } from '@/components/AppHeader';
import { GroupSidebar } from '@/components/groups/GroupSidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const RootLayout = () => {
  return (
    <ThemeProvider>
      <AuthGate>
        <div className="text-base-content min-h-screen overflow-x-hidden">
          <AppHeader />
          <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content overflow-x-hidden">
              <div className="section-mobile min-h-screen">
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

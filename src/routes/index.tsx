import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './root';
import { DashboardPage } from './pages/DashboardPage';
import { SharedCouponPage } from './pages/SharedCouponPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ROUTES } from './paths';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: ROUTES.GROUPS,
        element: <DashboardPage />
      },
      {
        path: ROUTES.SHARE,
        element: <SharedCouponPage />
      }
    ]
  }
]);

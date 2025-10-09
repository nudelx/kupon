import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './root';
import { DashboardPage } from './pages/DashboardPage';
import { SharedCouponPage } from './pages/SharedCouponPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'groups/:groupId',
        element: <DashboardPage />
      }
    ]
  },
  {
    path: '/share/:slug',
    element: <SharedCouponPage />
  }
]);

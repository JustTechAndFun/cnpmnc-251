import { RouterProvider, createBrowserRouter } from 'react-router';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';
import { AuthCallbackPage } from '../pages/AuthCallback';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Create router outside component - router should be stable and not recreated
// All routes are defined here, access control is handled by ProtectedRoute component
const router = createBrowserRouter([
    // Public routes - accessible to everyone
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/authenticate',
        element: <AuthCallbackPage />
    },
    {
        path: '/dashboard',
        element: <HomePage />
    },
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />
    },
    // Role-based routes - access control handled by ProtectedRoute in each route definition
    ...adminRoutes,
    ...teacherRoutes,
    ...studentRoutes,
    // 404 catch-all
    {
        path: '*',
        element: <NotFoundPage />
    }
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};

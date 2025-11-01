import { RouterProvider, createBrowserRouter } from 'react-router';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';
import { AuthCallbackPage } from '../pages/AuthCallback';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRouter = () => {
    // Create router inside component to ensure AuthProvider is available
    const router = createBrowserRouter([
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
            path: '/profile',
            element: <ProfilePage />
        },
        {
            path: '/unauthorized',
            element: <UnauthorizedPage />
        },
        // Admin routes
        ...adminRoutes,
        // Teacher routes
        ...teacherRoutes,
        // Student routes
        ...studentRoutes,
        // 404 catch-all
        {
            path: '*',
            element: <NotFoundPage />
        }
    ]);

    return <RouterProvider router={router} />;
};

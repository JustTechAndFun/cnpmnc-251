import { RouterProvider, createBrowserRouter } from 'react-router';
import { useMemo } from 'react';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';
import { AuthCallbackPage } from '../pages/AuthCallback';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

export const AppRouter = () => {
    const auth = useAuth();
    const user = auth?.user ?? null;

    // Chỉ load routes của role hiện tại
    const roleBasedRoutes = useMemo(() => {
        if (!user) return [];

        switch (user.role) {
            case Role.ADMIN:
                // Admin có thể truy cập tất cả routes
                return [...adminRoutes, ...teacherRoutes, ...studentRoutes];
            case Role.TEACHER:
                // Teacher chỉ truy cập teacher routes
                return teacherRoutes;
            case Role.STUDENT:
                // Student chỉ truy cập student routes
                return studentRoutes;
            default:
                return [];
        }
    }, [user]);

    // Create router inside component to ensure AuthProvider is available
    const router = useMemo(() => createBrowserRouter([
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
        // Role-based routes - chỉ load routes của role hiện tại
        ...roleBasedRoutes,
        // 404 catch-all
        {
            path: '*',
            element: <NotFoundPage />
        }
    ]), [roleBasedRoutes]);

    return <RouterProvider router={router} />;
};

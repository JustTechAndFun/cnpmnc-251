import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';

// Public pages
const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-6">Welcome</h1>
                <p className="text-gray-600 text-center mb-8">Sign in to access your account</p>
                <button
                    onClick={login}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

const HomePage = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
        case Role.ADMIN:
            return <Navigate to="/admin" replace />;
        case Role.TEACHER:
            return <Navigate to="/teacher" replace />;
        case Role.STUDENT:
            return <Navigate to="/student" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

const UnauthorizedPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <a href="/" className="text-blue-600 hover:underline">Go back to home</a>
        </div>
    </div>
);

const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Page not found</p>
            <a href="/" className="text-blue-600 hover:underline">Go back to home</a>
        </div>
    </div>
);

// Create router with all routes
export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/dashboard',
        element: <HomePage />
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

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};

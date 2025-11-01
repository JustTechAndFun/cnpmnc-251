import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { useState } from 'react';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';
import { AuthCallbackPage } from '../pages/AuthCallback';
import '../styles/auth.css';

// Public pages
const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        login();
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Hệ Thống Quản Lý Bài Thi</h1>
                    <p className="auth-subtitle">Chào mừng đến với cổng thông tin học tập</p>
                </div>

                <div className="auth-form">
                    <div className="form-group">
                        <input type="text" placeholder="Tài khoản" className="auth-input" />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Mật khẩu" className="auth-input" />
                    </div>

                    <button 
                        onClick={handleLogin} 
                        className={`google-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        <div className="loading-spinner"></div>
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Đăng nhập bằng Google</span>
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Bằng cách đăng nhập, bạn đồng ý với{' '}
                        <a href="#" className="auth-link">Điều khoản dịch vụ</a>
                        {' '}và{' '}
                        <a href="#" className="auth-link">Chính sách bảo mật</a>
                    </p>
                </div>
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
    <div className="error-container">
        <div className="error-card">
            <h1 className="error-title">Unauthorized</h1>
            <p className="error-message">You don't have permission to access this page.</p>
            <a href="/" className="back-link">Go back to home</a>
        </div>
    </div>
);

const NotFoundPage = () => (
    <div className="error-container">
        <div className="error-card">
            <h1 className="error-404">404</h1>
            <p className="error-message">Page not found</p>
            <a href="/" className="back-link">Go back to home</a>
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

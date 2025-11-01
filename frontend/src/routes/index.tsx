import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { useState } from 'react';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';
import { AuthCallbackPage } from '../pages/AuthCallback';

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
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-200 via-blue-300 to-blue-400 p-5 relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTI0IDJDMTUuMiAyIDggOS4yIDggMThjMCAzLjEuOSA2IDIuNCA4LjRMMiAzNXYyN2gyN2w4LjYtOC40YzIuNCAxLjUgNS4zIDIuNCA4LjQgMi40IDguOCAwIDE2LTcuMiAxNi0xNiAwLTMuMS0uOS02LTIuNC04LjRMNjAgMjNoLTRsLTItMiAyLTJoNGwtOC40LTguNEM1My4xIDguOSA1MC4yIDggNDcuMSA4Yy0zLjEgMC02IC45LTguNCAyLjRMMjcgMkgyNHptMCA0aDEuNkwzNSAxNS40Yy0xLjUgMi40LTIuNCA1LjMtMi40IDguNCAwIDMuMS45IDYgMi40IDguNEwyNS42IDQySDI0Yy02LjYgMC0xMi01LjQtMTItMTJzNS40LTEyIDEyLTEyem0yMy4xIDZjLjcgMCAxLjMuMSAxLjkuMkwzOS42IDIxLjZjLS4xLS42LS4yLTEuMi0uMi0xLjkgMC02LjYgNS40LTEyIDEyLTEyek0zOS40IDI1LjZMNDkgMzUuMmMtLjEuNi0uMiAxLjItLjIgMS45IDAgNi42LTUuNCAxMi0xMiAxMi0uNyAwLTEuMy0uMS0xLjktLjJMMjUuNCAzOS40Yy4xLS42LjItMS4yLjItMS45IDAtNi42IDUuNC0xMiAxMi0xMiAuNyAwIDEuMy4xIDEuOS4yek02IDM3LjZMMTUuNCA0N2MtMS41IDIuNC0yLjQgNS4zLTIuNCA4LjR2MS42SDZWMzcuNnptMTEuOSAxMS44Yy4xLjYuMiAxLjIuMiAxLjl2MS42aC0xLjZjLS43IDAtMS4zLS4xLTEuOS0uMmwzLjMtMy4zeiIvPjwvc3ZnPg==')] animate-[float_20s_infinite_linear]" />
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-[420px] bg-white/95 p-10 rounded-2xl shadow-2xl relative z-10 border border-white/20 backdrop-blur-md">
                {/* Decorative element */}
                <div className="absolute -top-[10%] -right-[15%] w-[150px] h-[150px] opacity-10 animate-[spin_30s_linear_infinite]">
                    <svg viewBox="0 0 64 64" fill="#4285f4">
                        <path d="M8 8v48h48V8H8zm4 4h40v40H12V12zm8 8v24h24V20H20zm4 4h16v16H24V24z" />
                    </svg>
                </div>

                {/* Header */}
                <div className="text-center mb-9">
                    <h1 className="text-[#202124] text-[28px] font-bold mb-3 tracking-tight">
                        Hệ Thống Quản Lý Bài Thi
                    </h1>
                    <p className="text-[#5f6368] text-base leading-relaxed">
                        Chào mừng đến với cổng thông tin học tập
                    </p>
                </div>

                {/* Form */}
                <div className="mb-5 w-[85%] mx-auto flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Tài khoản"
                            className="w-full px-4 py-3 border border-[#dadce0] rounded-lg text-base text-[#202124] transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#4285F4] focus:shadow-[0_0_0_2px_rgba(66,133,244,0.2)]"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full px-4 py-3 border border-[#dadce0] rounded-lg text-base text-[#202124] transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#4285F4] focus:shadow-[0_0_0_2px_rgba(66,133,244,0.2)]"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        className={`w-full py-3.5 px-6 flex items-center justify-center gap-3 bg-white border border-[#dadce0] rounded-lg text-[#202124] text-base font-medium cursor-pointer transition-all duration-300 relative overflow-hidden
                            ${isLoading ? 'opacity-70 cursor-wait' : 'hover:shadow-[0_2px_8px_rgba(66,133,244,0.2)] hover:border-transparent'}
                            before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[120%] before:h-[120%] before:bg-[radial-gradient(circle,rgba(66,133,244,0.1)_0%,transparent_70%)] before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 before:transition-transform before:duration-500
                            hover:before:scale-100`}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <div className="w-5 h-5 border-2 border-[#e5e7eb] border-t-[#4285F4] rounded-full animate-spin" />
                        )}
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Đăng nhập bằng Google</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-[#5f6368] text-sm">
                    <p>
                        Bằng cách đăng nhập, bạn đồng ý với{' '}
                        <a href="#" className="text-[#4285F4] no-underline transition-colors duration-200 hover:text-[#3367D6] hover:underline">
                            Điều khoản dịch vụ
                        </a>
                        {' '}và{' '}
                        <a href="#" className="text-[#4285F4] no-underline transition-colors duration-200 hover:text-[#3367D6] hover:underline">
                            Chính sách bảo mật
                        </a>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
        <div className="bg-white p-10 rounded-xl shadow-md max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-3">Unauthorized</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <a href="/" className="text-blue-600 no-underline hover:underline">Go back to home</a>
        </div>
    </div>
);

const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
        <div className="bg-white p-10 rounded-xl shadow-md max-w-md w-full text-center">
            <h1 className="text-6xl font-bold text-gray-300 mb-3">404</h1>
            <p className="text-gray-600 mb-6">Page not found</p>
            <a href="/" className="text-blue-600 no-underline hover:underline">Go back to home</a>
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

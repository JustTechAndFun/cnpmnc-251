import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { useState } from 'react';
import { adminRoutes } from './admin.routes';
import { teacherRoutes } from './teacher.routes';
import { studentRoutes } from './student.routes';
import { AuthCallbackPage } from '../pages/AuthCallback';
import { Card, Input, Button, Typography, Space, Flex, Result } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
        <Flex
            justify="center"
            align="center"
            className="min-h-screen bg-linear-to-br from-blue-200 via-blue-300 to-blue-400 p-5 relative overflow-hidden"
        >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTI0IDJDMTUuMiAyIDggOS4yIDggMThjMCAzLjEuOSA2IDIuNCA4LjRMMiAzNXYyN2gyN2w4LjYtOC40YzIuNCAxLjUgNS4zIDIuNCA4LjQgMi40IDguOCAwIDE2LTcuMiAxNi0xNiAwLTMuMS0uOS02LTIuNC04LjRMNjAgMjNoLTRsLTItMiAyLTJoNGwtOC40LTguNEM1My4xIDguOSA1MC4yIDggNDcuMSA4Yy0zLjEgMC02IC45LTguNCAyLjRMMjcgMkgyNHptMCA0aDEuNkwzNSAxNS40Yy0xLjUgMi40LTIuNCA1LjMtMi40IDguNCAwIDMuMS45IDYgMi40IDguNEwyNS42IDQySDI0Yy02LjYgMC0xMi01LjQtMTItMTJzNS40LTEyIDEyLTEyem0yMy4xIDZjLjcgMCAxLjMuMSAxLjkuMkwzOS42IDIxLjZjLS4xLS42LS4yLTEuMi0uMi0xLjkgMC02LjYgNS40LTEyIDEyLTEyek0zOS40IDI1LjZMNDkgMzUuMmMtLjEuNi0uMiAxLjItLjIgMS45IDAgNi42LTUuNCAxMi0xMiAxMi0uNyAwLTEuMy0uMS0xLjktLjJMMjUuNCAzOS40Yy4xLS42LjItMS4yLjItMS45IDAtNi42IDUuNC0xMiAxMi0xMiAuNyAwIDEuMy4xIDEuOS4yek02IDM3LjZMMTUuNCA0N2MtMS41IDIuNC0yLjQgNS4zLTIuNCA4LjR2MS42SDZWMzcuNnptMTEuOSAxMS44Yy4xLjYuMiAxLjIuMiAxLjl2MS42aC0xLjZjLS43IDAtMS4zLS4xLTEuOS0uMmwzLjMtMy4zeiIvPjwvc3ZnPg==')] animate-[float_20s_infinite_linear]" />
            </div>

            {/* Auth Card */}
            <Card
                className="w-full max-w-[420px] relative z-10 backdrop-blur-md shadow-2xl bg-white/95 border border-white/20 rounded-2xl"
                classNames={{
                    body: 'p-10'
                }}
            >
                {/* Decorative element */}
                <div className="absolute -top-[10%] -right-[15%] w-36 h-36 opacity-10 animate-[spin_30s_linear_infinite]">
                    <svg viewBox="0 0 64 64" fill="#4285f4">
                        <path d="M8 8v48h48V8H8zm4 4h40v40H12V12zm8 8v24h24V20H20zm4 4h16v16H24V24z" />
                    </svg>
                </div>

                {/* Header */}
                <Space direction="vertical" size="small" className="w-full mb-9" align="center">
                    <Title level={2} className="m-0! text-gray-800! text-[28px]! font-bold!">
                        Hệ Thống Quản Lý Bài Thi
                    </Title>
                    <Text type="secondary" className="text-base">
                        Chào mừng đến với cổng thông tin học tập
                    </Text>
                </Space>

                {/* Form */}
                <Space direction="vertical" size="large" className="w-full mb-6">
                    <Input
                        size="large"
                        placeholder="Tài khoản"
                        className="h-12!"
                    />
                    <Input.Password
                        size="large"
                        placeholder="Mật khẩu"
                        className="h-12!"
                    />

                    <Button
                        size="large"
                        block
                        icon={<GoogleOutlined />}
                        onClick={handleLogin}
                        loading={isLoading}
                        className="h-12! flex! items-center! justify-center!"
                    >
                        Đăng nhập bằng Google
                    </Button>
                </Space>

                {/* Footer */}
                <Paragraph className="m-0! text-center text-gray-500 text-sm">
                    Bằng cách đăng nhập, bạn đồng ý với{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-600 hover:underline">
                        Điều khoản dịch vụ
                    </a>
                    {' '}và{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-600 hover:underline">
                        Chính sách bảo mật
                    </a>
                </Paragraph>
            </Card>
        </Flex>
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
    <Flex justify="center" align="center" className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-5">
        <Result
            status="403"
            title={<span className="text-gray-800">Unauthorized</span>}
            subTitle={<span className="text-gray-600">You don't have permission to access this page.</span>}
            extra={
                <Button type="primary" size="large" href="/" className="h-10! px-8!">
                    Go back to home
                </Button>
            }
        />
    </Flex>
);

const NotFoundPage = () => (
    <Flex justify="center" align="center" className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-5">
        <Result
            status="404"
            title={<span className="text-gray-800">404</span>}
            subTitle={<span className="text-gray-600">Page not found</span>}
            extra={
                <Button type="primary" size="large" href="/" className="h-10! px-8!">
                    Go back to home
                </Button>
            }
        />
    </Flex>
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

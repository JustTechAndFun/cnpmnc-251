import { useState } from 'react';
import { Navigate } from 'react-router';
import { Card, Button, Typography } from 'antd';
import { GoogleOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const isDevMode = import.meta.env.DEV;

export const LoginPage = () => {
    const auth = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Safe access to auth values
    const login = auth?.login;
    const isAuthenticated = auth?.isAuthenticated ?? false;

    // Only redirect if authenticated in production mode
    // In dev mode, allow showing login page even if authenticated (for testing different roles)
    if (isAuthenticated && !isDevMode) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = () => {
        if (login) {
            setIsLoading(true);
            login();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Login Card */}
            <Card
                className="w-full max-w-md mx-4 shadow-2xl border-0 backdrop-blur-lg bg-white/90"
                bordered={false}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                        <UserOutlined className="text-3xl text-white" />
                    </div>
                    <Title level={2} className="mb-2">Chào mừng trở lại</Title>
                    <Text type="secondary">Đăng nhập bằng email trường để truy cập hệ thống</Text>
                </div>

                <Button
                    type="primary"
                    size="large"
                    icon={<GoogleOutlined />}
                    onClick={handleLogin}
                    disabled={isLoading || !login}
                    loading={isLoading}
                    block
                    className="h-12 text-base font-medium mb-6 bg-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
                >
                    {isLoading ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}
                </Button>

                <Text className="text-xs text-gray-500 text-center block">
                    Bằng cách đăng nhập, bạn đồng ý với các điều khoản sử dụng
                </Text>

            </Card>

            <style>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

import { useNavigate, useLocation, Outlet } from 'react-router';
import { Layout, Menu, Avatar, Button, Spin, Typography } from 'antd';
import { DashboardOutlined, BookOutlined, FileTextOutlined, LineChartOutlined, ProfileOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Sider, Content } = Layout;
const { Text } = Typography;

export const StudentLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const user = auth?.user ?? null;
    const logout = auth?.logout;
    const isLoggingOut = auth?.isLoggingOut ?? false;

    const menuItems = [
        {
            key: '/student',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/student/courses',
            icon: <BookOutlined />,
            label: 'Khóa học',
        },
        {
            key: '/student/assignments',
            icon: <FileTextOutlined />,
            label: 'Bài tập',
        },
        {
            key: '/student/grades',
            icon: <LineChartOutlined />,
            label: 'Điểm số',
        },
        {
            key: '/profile',
            icon: <ProfileOutlined />,
            label: 'Thông tin cá nhân',
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const selectedKeys = [location.pathname];

    return (
        <Layout className="min-h-screen bg-gray-50">
            {/* Logout Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
                        <Spin size="large" className="mb-4" />
                        <p className="text-gray-700 font-medium">Đang đăng xuất...</p>
                    </div>
                </div>
            )}

            <Sider
                width={280}
                className="fixed left-0 top-0 h-screen bg-white shadow-lg"
                theme="light"
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white">
                        <BookOutlined className="text-xl" />
                    </div>
                    <Text strong className="text-lg bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        Học sinh
                    </Text>
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="border-r-0 pt-4"
                />

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar 
                            src={user?.picture} 
                            size={48}
                            className="bg-gradient-to-br from-green-500 to-green-700"
                        >
                            {user?.name?.[0] || user?.email[0]?.toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <Text strong className="block text-sm truncate">
                                {user?.name || 'Học sinh'}
                            </Text>
                            <Text className="text-xs text-gray-500 truncate block">
                                {user?.email}
                            </Text>
                        </div>
                    </div>
                    <Button
                        type="default"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => logout?.()}
                        disabled={!logout || isLoggingOut}
                        block
                        className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                        Đăng xuất
                    </Button>
                </div>
            </Sider>

            {/* Main Content */}
            <Layout>
                <Content className="min-h-screen">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

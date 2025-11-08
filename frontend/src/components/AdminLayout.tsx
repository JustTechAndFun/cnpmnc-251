import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { Layout, Menu, Avatar, Button, Spin, Typography, Drawer } from 'antd';
import { DashboardOutlined, UserOutlined, LogoutOutlined, MenuOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Sider, Content } = Layout;
const { Text } = Typography;

export const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const user = auth?.user ?? null;
    const logout = auth?.logout;
    const isLoggingOut = auth?.isLoggingOut ?? false;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: '/admin/teachers',
            icon: <TeamOutlined />,
            label: 'Quản lý Giáo viên',
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const selectedKeys = [location.pathname];
    if (location.pathname.startsWith('/admin/users/')) {
        selectedKeys[0] = '/admin/users';
    }
    if (location.pathname.startsWith('/admin/teachers/')) {
        selectedKeys[0] = '/admin/teachers';
    }

    return (
        <Layout className="min-h-screen bg-gray-50 flex">
            {/* Logout Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
                        <Spin size="large" className="mb-4" />
                        <p className="text-gray-700 font-medium">Đang đăng xuất...</p>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <Sider
                width={280}
                className="bg-white shadow-lg flex-shrink-0 hidden lg:flex fixed left-0 top-0 h-screen z-30"
                theme="light"
                style={{ display: 'flex', flexDirection: 'column', position: 'sticky' }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-6 border-b border-gray-200 flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
                            <DashboardOutlined className="text-xl" />
                        </div>
                        <Text strong className="text-lg bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Admin Panel
                        </Text>
                    </div>

                    {/* Menu */}
                    <div className="flex-1 overflow-y-auto">
                        <Menu
                            mode="inline"
                            selectedKeys={selectedKeys}
                            items={menuItems}
                            onClick={handleMenuClick}
                            className="border-r-0 pt-4"
                        />
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar
                                src={user?.picture}
                                size={48}
                                className="bg-gradient-to-br from-purple-500 to-purple-700"
                            >
                                {user?.name?.[0] || user?.email[0]?.toUpperCase()}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <Text strong className="block text-sm truncate">
                                    {user?.name || 'Admin'}
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
                </div>
            </Sider>

            {/* Main Content */}
            <Layout className="flex-1">
                <Content className="min-h-screen">
                    {/* Mobile Top Bar */}
                    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                        <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} />
                        <Text strong className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Admin Panel
                        </Text>
                    </div>
                    <Outlet />
                </Content>
            </Layout>

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                closable
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                width={280}
                styles={{ body: { padding: 0 } }}
            >
                <div className="h-full flex flex-col bg-white">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
                            <DashboardOutlined className="text-xl" />
                        </div>
                        <Text strong className="text-lg bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Admin Panel
                        </Text>
                    </div>

                    {/* Menu */}
                    <Menu
                        mode="inline"
                        selectedKeys={selectedKeys}
                        items={menuItems}
                        onClick={({ key }) => {
                            setMobileMenuOpen(false);
                            handleMenuClick({ key });
                        }}
                        className="border-r-0 pt-4 flex-1"
                    />

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar
                                src={user?.picture}
                                size={48}
                                className="bg-gradient-to-br from-purple-500 to-purple-700"
                            >
                                {user?.name?.[0] || user?.email[0]?.toUpperCase()}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <Text strong className="block text-sm truncate">
                                    {user?.name || 'Admin'}
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
                            onClick={() => { setMobileMenuOpen(false); logout?.(); }}
                            disabled={!logout || isLoggingOut}
                            block
                            className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </Drawer>
        </Layout>
    );
};


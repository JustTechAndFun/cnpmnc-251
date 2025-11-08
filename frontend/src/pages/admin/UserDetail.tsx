import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router';
import axios from 'axios';
import { Card, Descriptions, Avatar, Tag, Typography, Spin, Button, Space, Result } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Role } from '../../types';
import type { User, ApiResponse } from '../../types';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const UserDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (id) {
            fetchUserDetail(id);
        }
    }, [id]);

    const fetchUserDetail = async (userId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            // Since backend doesn't have /api/admin/users/{id}, we fetch all users and filter
            const response = await axios.get<ApiResponse<User[]>>(
                `${API_BASE_URL}/api/admin/users`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );

            if (!response.data.error && response.data.data) {
                const foundUser = response.data.data.find(u => u.id === userId);
                if (foundUser) {
                    setUser(foundUser);
                } else {
                    setNotFound(true);
                }
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error('Failed to fetch user detail', error);
            setErrorMessage('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
            setErrorModalVisible(true);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role: Role) => {
        switch (role) {
            case Role.ADMIN:
                return 'purple';
            case Role.TEACHER:
                return 'blue';
            case Role.STUDENT:
                return 'green';
            default:
                return 'default';
        }
    };

    const getRoleLabel = (role: Role) => {
        switch (role) {
            case Role.ADMIN:
                return 'Quản trị viên';
            case Role.TEACHER:
                return 'Giảng viên';
            case Role.STUDENT:
                return 'Sinh viên';
            default:
                return role;
        }
    };

    if (!id) {
        return <Navigate to="/admin/users" replace />;
    }

    if (notFound) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <Result
                    status="404"
                    title="Không tìm thấy người dùng"
                    subTitle="Người dùng với ID này không tồn tại trong hệ thống."
                    extra={
                        <Button type="primary" onClick={() => navigate('/admin/users')}>
                            Quay lại danh sách
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/users')}
                    className="mb-4"
                >
                    Quay lại
                </Button>
                <Title level={2}>Chi tiết người dùng</Title>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải thông tin người dùng...</Text>
                </div>
            ) : (
                user ? (
                    <Space direction="vertical" size="large" className="w-full">
                        <Card className="shadow-sm">
                            <div className="flex items-center gap-6">
                                <Avatar
                                    src={user.picture}
                                    size={80}
                                    icon={<UserOutlined />}
                                    className="bg-linear-to-br from-purple-500 to-indigo-600"
                                >
                                    {user.name?.[0] || user.email[0]?.toUpperCase()}
                                </Avatar>
                                <div className="flex-1">
                                    <Title level={3} className="mb-2">{user.name || 'Chưa có tên'}</Title>
                                    <Text type="secondary" className="block mb-3">{user.email}</Text>
                                    <Space>
                                        <Tag color={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Tag>
                                        <Tag color={user.activate ? 'success' : 'error'}>
                                            {user.activate ? 'Hoạt động' : 'Không hoạt động'}
                                        </Tag>
                                    </Space>
                                </div>
                            </div>
                        </Card>

                        <Card title="Thông tin cơ bản" className="shadow-sm">
                            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                                <Descriptions.Item label="ID người dùng">{user.id}</Descriptions.Item>
                                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                                <Descriptions.Item label="Họ và tên">{user.name || 'Chưa có tên'}</Descriptions.Item>
                                <Descriptions.Item label="Vai trò">
                                    <Tag color={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={user.activate ? 'success' : 'error'}>
                                        {user.activate ? 'Hoạt động' : 'Không hoạt động'}
                                    </Tag>
                                </Descriptions.Item>
                                {user.picture && (
                                    <Descriptions.Item label="Ảnh đại diện" span={2}>
                                        <Avatar src={user.picture} size={64} />
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Space>
                ) : (
                    <Card className="shadow-sm">
                        <Text type="secondary">Không thể tải thông tin người dùng</Text>
                    </Card>
                )
            )}

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </div>
    );
};

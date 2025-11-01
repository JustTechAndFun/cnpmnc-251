import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Table, Input, Select, Card, Tag, Avatar, Typography, Space, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Role } from '../../types';
import type { User, ApiResponse } from '../../types';

const { Title, Text } = Typography;
const { Search } = Input;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get<ApiResponse<User[]>>(
                `${API_BASE_URL}/admin/users`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );

            if (!response.data.error && response.data.data) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            // Mock data for demo
            setUsers([
                {
                    id: '1',
                    email: 'admin@example.com',
                    name: 'Nguyễn Văn Admin',
                    role: Role.ADMIN,
                    activate: true
                },
                {
                    id: '2',
                    email: 'teacher1@example.com',
                    name: 'Trần Thị Giáo',
                    role: Role.TEACHER,
                    activate: true
                },
                {
                    id: '3',
                    email: 'student1@example.com',
                    name: 'Lê Văn Sinh',
                    role: Role.STUDENT,
                    activate: true
                },
                {
                    id: '4',
                    email: 'student2@example.com',
                    name: 'Phạm Thị Học',
                    role: Role.STUDENT,
                    activate: false
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

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

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            render: (_: unknown, record: User) => (
                <Space>
                    <Avatar src={record.picture} icon={<UserOutlined />}>
                        {record.name?.[0] || record.email[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div className="font-medium">{record.name || 'Chưa có tên'}</div>
                        <Text type="secondary" className="text-xs">ID: {record.id}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            key: 'role',
            render: (_: unknown, record: User) => (
                <Tag color={getRoleColor(record.role)}>{getRoleLabel(record.role)}</Tag>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: unknown, record: User) => (
                <Tag color={record.activate ? 'success' : 'error'}>
                    {record.activate ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: unknown, record: User) => (
                <Button 
                    type="link" 
                    onClick={() => navigate(`/admin/users/${record.id}`)}
                    className="p-0"
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <Title level={2} className="mb-2">Quản lý người dùng</Title>
                    <Text type="secondary">Danh sách tất cả người dùng trong hệ thống</Text>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{filteredUsers.length}</div>
                    <Text type="secondary" className="text-sm">người dùng</Text>
                </div>
            </div>

            <Card className="mb-6 shadow-sm">
                <Space direction="vertical" size="middle" className="w-full">
                    <Search
                        placeholder="Tìm kiếm theo email hoặc tên..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                        size="large"
                    />
                    <div className="flex items-center gap-4">
                        <Text className="font-medium">Lọc theo vai trò:</Text>
                        <Select
                            value={filterRole}
                            onChange={(value) => setFilterRole(value)}
                            style={{ width: 200 }}
                            size="large"
                        >
                            <Select.Option value="ALL">Tất cả</Select.Option>
                            <Select.Option value={Role.ADMIN}>Quản trị viên</Select.Option>
                            <Select.Option value={Role.TEACHER}>Giảng viên</Select.Option>
                            <Select.Option value={Role.STUDENT}>Sinh viên</Select.Option>
                        </Select>
                    </div>
                </Space>
            </Card>

            <Card className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                    }}
                    locale={{
                        emptyText: (
                            <div className="py-12 text-center">
                                <UserOutlined className="text-5xl text-gray-300 mb-4" />
                                <Text type="secondary">Không tìm thấy người dùng nào</Text>
                            </div>
                        ),
                    }}
                />
            </Card>
        </div>
    );
};

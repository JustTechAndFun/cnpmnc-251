import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Table, Input, Select, Card, Tag, Avatar, Typography, Space, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Role } from '../../types';
import type { User } from '../../types';
import { adminApi } from '../../apis';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;
const { Search } = Input;

export const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchMail, setSearchMail] = useState('');
    const [filterActivate, setFilterActivate] = useState<boolean | null>(null);
    const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const debounceTimer = useRef<number | null>(null);

    useEffect(() => {
        fetchUsers('', null);
    }, []);

    useEffect(() => {
        // Debounce the API call
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchUsers(searchMail, filterActivate);
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchMail, filterActivate]);

    const fetchUsers = async (mail: string, activate: boolean | null) => {
        setLoading(true);
        try {
            const response = await adminApi.getAllUsers(
                mail && mail.trim() ? mail.trim() : undefined,
                activate !== null ? activate : undefined
            );

            if (!response.error && response.data) {
                // Map UserDto to User type
                const mappedUsers: User[] = response.data.map(user => ({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                    role: user.role as Role,
                    activate: user.activate
                }));
                setUsers(mappedUsers);
            } else {
                setErrorMessage(response.message || 'Không thể tải danh sách người dùng');
                setErrorModalVisible(true);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            setErrorMessage('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
            setErrorModalVisible(true);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Client-side role filter (since backend doesn't filter by role)
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesRole;
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

    const handleMailSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchMail(e.target.value);
    };

    const handleActivateFilterChange = (value: string) => {
        if (value === 'ALL') {
            setFilterActivate(null);
        } else {
            setFilterActivate(value === 'true');
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
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
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
                        placeholder="Tìm kiếm theo email..."
                        prefix={<SearchOutlined />}
                        value={searchMail}
                        onChange={handleMailSearchChange}
                        className="w-full"
                        size="large"
                        allowClear
                    />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Text className="font-medium">Trạng thái:</Text>
                            <Select
                                value={filterActivate === null ? 'ALL' : String(filterActivate)}
                                onChange={handleActivateFilterChange}
                                className="w-full sm:w-[180px]"
                                size="large"
                            >
                                <Select.Option value="ALL">Tất cả</Select.Option>
                                <Select.Option value="true">Hoạt động</Select.Option>
                                <Select.Option value="false">Không hoạt động</Select.Option>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Text className="font-medium">Vai trò:</Text>
                            <Select
                                value={filterRole}
                                onChange={(value) => setFilterRole(value)}
                                className="w-full sm:w-[180px]"
                                size="large"
                            >
                                <Select.Option value="ALL">Tất cả</Select.Option>
                                <Select.Option value={Role.ADMIN}>Quản trị viên</Select.Option>
                                <Select.Option value={Role.TEACHER}>Giảng viên</Select.Option>
                                <Select.Option value={Role.STUDENT}>Sinh viên</Select.Option>
                            </Select>
                        </div>
                    </div>
                </Space>
            </Card>

            <Card className="shadow-sm">
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={filteredUsers}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 'max-content' }}
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
                </div>
            </Card>

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </div>
    );
};

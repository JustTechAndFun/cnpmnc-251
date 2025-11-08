import { useEffect, useState } from 'react';
import { Card, Statistic, List, Avatar, Spin, Typography, Tag } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { adminApi } from '../../apis';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;

interface DashboardStats {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    activeUsers: number;
}

export const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getAllUsers();
            
            if (!response.error && response.data) {
                const users = response.data;
                const totalUsers = users.length;
                const totalTeachers = users.filter(u => u.role === 'TEACHER').length;
                const totalStudents = users.filter(u => u.role === 'STUDENT').length;
                const activeUsers = users.filter(u => u.activate).length;
                
                setStats({
                    totalUsers,
                    totalTeachers,
                    totalStudents: totalStudents,
                    activeUsers
                });
            } else {
                setErrorMessage(response.message || 'Không thể tải thống kê dashboard');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            setErrorMessage('Không thể tải thống kê dashboard. Vui lòng thử lại sau.');
            setErrorModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Tổng số người dùng',
            value: stats.totalUsers,
            prefix: <UserOutlined className="text-blue-500" />,
            suffix: <Tag color="blue">+12%</Tag>,
        },
        {
            title: 'Giảng viên',
            value: stats.totalTeachers,
            prefix: <TeamOutlined className="text-purple-500" />,
            suffix: <Tag color="purple">+5%</Tag>,
        },
        {
            title: 'Sinh viên',
            value: stats.totalStudents,
            prefix: <BookOutlined className="text-green-500" />,
            suffix: <Tag color="green">+8%</Tag>,
        },
        {
            title: 'Người dùng hoạt động',
            value: stats.activeUsers,
            prefix: <CheckCircleOutlined className="text-orange-500" />,
            suffix: <Tag color="orange">+15%</Tag>,
        }
    ];

    const activities = [
        {
            icon: '📝',
            title: 'Người dùng mới đã đăng ký',
            time: '2 phút trước',
        },
        {
            icon: '✅',
            title: '5 giảng viên đã được kích hoạt',
            time: '1 giờ trước',
        },
        {
            icon: '🔔',
            title: 'Hệ thống đã được cập nhật',
            time: '3 giờ trước',
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Dashboard
                </Title>
                <Text className="text-gray-600">Tổng quan hệ thống</Text>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải dữ liệu...</Text>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((card) => (
                            <Card key={card.title} className="hover:shadow-lg transition-shadow">
                                <Statistic
                                    title={card.title}
                                    value={card.value}
                                    prefix={card.prefix}
                                    suffix={card.suffix}
                                />
                            </Card>
                        ))}
                    </div>

                    <Card title="Hoạt động gần đây" className="shadow-sm">
                        <List
                            dataSource={activities}
                            renderItem={(item) => (
                                <List.Item className="hover:bg-gray-50 rounded-lg px-4 py-3 transition-colors">
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<span>{item.icon}</span>} className="bg-gray-100" />}
                                        title={<Text strong>{item.title}</Text>}
                                        description={<Text type="secondary" className="text-xs">{item.time}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </>
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


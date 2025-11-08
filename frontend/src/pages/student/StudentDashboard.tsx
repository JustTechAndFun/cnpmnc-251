import { useEffect, useState } from 'react';
import { Card, Statistic, List, Avatar, Spin, Typography, Tag, Alert, Button, Space, Empty } from 'antd';
import { BookOutlined, FileTextOutlined, CheckCircleOutlined, StarOutlined, ReloadOutlined } from '@ant-design/icons';
import { studentApi } from '../../apis';

const { Title, Text } = Typography;

interface StudentStats {
    enrolledCourses: number;
    activeAssignments: number;
    completedAssignments: number;
    averageGrade: number;
}

export const StudentDashboard = () => {
    const [stats, setStats] = useState<StudentStats>({
        enrolledCourses: 0,
        activeAssignments: 0,
        completedAssignments: 0,
        averageGrade: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch enrolled classes to get course count
            const classesResponse = await studentApi.getMyClasses();

            if (!classesResponse.error && classesResponse.data) {
                setStats(prev => ({
                    ...prev,
                    enrolledCourses: classesResponse.data.length
                }));
            } else {
                throw new Error(classesResponse.message || 'Không thể tải dữ liệu');
            }

            // TODO: Implement other stats when backend APIs are available
            // - activeAssignments from /api/student/assignments?status=active
            // - completedAssignments from /api/student/assignments?status=completed
            // - averageGrade from /api/student/grades

        } catch (err: any) {
            console.error('Failed to fetch dashboard stats:', err);
            setError(err.message || 'Không thể tải thống kê dashboard');
            setStats({
                enrolledCourses: 0,
                activeAssignments: 0,
                completedAssignments: 0,
                averageGrade: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Khóa học đã đăng ký',
            value: stats.enrolledCourses,
            prefix: <BookOutlined className="text-green-500" />,
            suffix: <Tag color="green">+2</Tag>,
        },
        {
            title: 'Bài tập đang làm',
            value: stats.activeAssignments,
            prefix: <FileTextOutlined className="text-blue-500" />,
            suffix: <Tag color="blue">+3</Tag>,
        },
        {
            title: 'Bài tập đã hoàn thành',
            value: stats.completedAssignments,
            prefix: <CheckCircleOutlined className="text-purple-500" />,
            suffix: <Tag color="purple">+5</Tag>,
        },
        {
            title: 'Điểm trung bình',
            value: stats.averageGrade.toFixed(1),
            prefix: <StarOutlined className="text-orange-500" />,
            suffix: <Tag color="orange">+0.2</Tag>,
        }
    ];

    const activities = [
        {
            icon: '📝',
            title: 'Đã nộp bài tập mới',
            time: '10 phút trước',
        },
        {
            icon: '✅',
            title: 'Nhận được điểm số cho bài tập',
            time: '2 giờ trước',
        },
        {
            icon: '📚',
            title: 'Đã tham gia khóa học mới',
            time: '1 ngày trước',
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    Dashboard
                </Title>
                <Text className="text-gray-600">Tổng quan học tập</Text>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải dữ liệu...</Text>
                </div>
            ) : error ? (
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" type="primary" onClick={fetchDashboardStats} icon={<ReloadOutlined />}>
                            Thử lại
                        </Button>
                    }
                />
            ) : stats.enrolledCourses === 0 ? (
                <Empty
                    description="Bạn chưa đăng ký lớp học nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => window.location.href = '/student/courses'}>
                        Xem các lớp học
                    </Button>
                </Empty>
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
        </div>
    );
};

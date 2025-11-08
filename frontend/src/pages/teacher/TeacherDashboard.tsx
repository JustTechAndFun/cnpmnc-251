import { useEffect, useState } from 'react';
import { Card, Statistic, List, Spin, Typography } from 'antd';
import {
    BookOutlined,
    FileTextOutlined,
    TeamOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { ErrorModal } from '../../components/ErrorModal';
import { teacherApi } from '../../apis';

const { Title, Text } = Typography;

interface TeacherStats {
    totalClasses: number;
    totalAssignments: number;
    pendingGrading: number;
    totalStudents: number;
}

export const TeacherDashboard = () => {
    const [stats, setStats] = useState<TeacherStats>({
        totalClasses: 0,
        totalAssignments: 0,
        pendingGrading: 0,
        totalStudents: 0
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
            // Calculate stats from APIs
            const classesResponse = await teacherApi.getMyClasses();

            let totalClasses = 0;
            let totalStudents = 0;
            let totalTests = 0;

            // Calculate from classes
            if (!classesResponse.error && classesResponse.data) {
                totalClasses = classesResponse.data.length;
                totalStudents = classesResponse.data.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);

                // Fetch tests for each class
                const testsPromises = classesResponse.data.map(cls =>
                    teacherApi.getTestsInClass(cls.id).catch(() => ({ error: true, data: [], message: '' }))
                );
                const testsResults = await Promise.all(testsPromises);

                testsResults.forEach(result => {
                    if (!result.error && result.data) {
                        totalTests += result.data.length;
                    }
                });
            }

            setStats({
                totalClasses,
                totalAssignments: totalTests,
                pendingGrading: 0, // Can be calculated from test results in the future
                totalStudents
            });
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
            title: 'Lớp học',
            value: stats.totalClasses,
            prefix: <BookOutlined className="text-purple-500" />,
        },
        {
            title: 'Bài tập',
            value: stats.totalAssignments,
            prefix: <FileTextOutlined className="text-blue-500" />,
        },
        {
            title: 'Chờ chấm điểm',
            value: stats.pendingGrading,
            prefix: <ClockCircleOutlined className="text-orange-500" />,
        },
        {
            title: 'Tổng học sinh',
            value: stats.totalStudents,
            prefix: <TeamOutlined className="text-green-500" />,
        }
    ];

    const activities = [
        {
            icon: '📝',
            title: 'Học sinh mới nộp bài tập',
            time: '5 phút trước',
        },
        {
            icon: '✅',
            title: 'Đã chấm điểm 10 bài tập',
            time: '1 giờ trước',
        },
        {
            icon: '📚',
            title: 'Lớp học mới đã được tạo',
            time: '2 giờ trước',
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Dashboard
                </Title>
                <Text className="text-gray-600">Tổng quan công việc</Text>
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
                                        avatar={<span className="text-2xl">{item.icon}</span>}
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

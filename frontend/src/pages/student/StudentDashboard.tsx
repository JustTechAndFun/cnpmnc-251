import { useEffect, useState } from 'react';
import { Card, Statistic, Spin, Typography, Alert, Button, Empty } from 'antd';
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
            // Fetch data from APIs - use Promise.allSettled to handle partial failures
            const [classesResponse, testsResponse, gradesResponse] = await Promise.allSettled([
                studentApi.getMyClasses(),
                studentApi.getAllStudentTests(),
                studentApi.getMyGrades()
            ]);

            let enrolledCourses = 0;
            let activeAssignments = 0;
            let completedAssignments = 0;
            let averageGrade = 0;

            // Calculate from classes
            if (classesResponse.status === 'fulfilled' && !classesResponse.value.error && classesResponse.value.data) {
                enrolledCourses = classesResponse.value.data.length;
            }

            // Calculate from tests
            if (testsResponse.status === 'fulfilled' && !testsResponse.value.error && testsResponse.value.data) {
                activeAssignments = testsResponse.value.data.length;
            } else if (testsResponse.status === 'rejected' || (testsResponse.status === 'fulfilled' && testsResponse.value.error)) {
                // Fallback: if getAllStudentTests doesn't exist or fails, try to get tests from classes
                if (classesResponse.status === 'fulfilled' && !classesResponse.value.error && classesResponse.value.data) {
                    try {
                        const testPromises = classesResponse.value.data.map(cls =>
                            studentApi.getTestsInClass(cls.id).catch(() => ({ error: true, data: [] }))
                        );
                        const testResults = await Promise.allSettled(testPromises);
                        let totalTests = 0;
                        for (const result of testResults) {
                            if (result.status === 'fulfilled' && !result.value.error && result.value.data) {
                                totalTests += result.value.data.length;
                            }
                        }
                        activeAssignments = totalTests;
                    } catch (err) {
                        console.warn('Failed to fetch tests from classes', err);
                    }
                }
            }

            // Calculate from grades
            if (gradesResponse.status === 'fulfilled' && !gradesResponse.value.error && gradesResponse.value.data) {
                const grades = gradesResponse.value.data;
                completedAssignments = grades.length;

                if (grades.length > 0) {
                    const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);
                    averageGrade = totalScore / grades.length;
                }
            }

            setStats({
                enrolledCourses,
                activeAssignments,
                completedAssignments,
                averageGrade
            });
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            setError('Không thể tải thống kê dashboard. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Khóa học đã đăng ký',
            value: stats.enrolledCourses,
            prefix: <BookOutlined className="text-green-500" />,
        },
        {
            title: 'Bài tập đang làm',
            value: stats.activeAssignments,
            prefix: <FileTextOutlined className="text-blue-500" />,
        },
        {
            title: 'Bài tập đã hoàn thành',
            value: stats.completedAssignments,
            prefix: <CheckCircleOutlined className="text-purple-500" />,
        },
        {
            title: 'Điểm trung bình',
            value: stats.averageGrade > 0 ? stats.averageGrade.toFixed(1) : '0.0',
            prefix: <StarOutlined className="text-orange-500" />,
        }
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
            )}
        </div>
    );
};

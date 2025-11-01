import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Statistic, List, Avatar, Spin, Typography, Tag } from 'antd';
import { BookOutlined, FileTextOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { StudentLayout } from '../../components/StudentLayout';
import type { ApiResponse } from '../../types';

const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get<ApiResponse<StudentStats>>(
                `${API_BASE_URL}/student/stats`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );

            if (!response.data.error && response.data.data) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            // Mock data for demo
            setStats({
                enrolledCourses: 5,
                activeAssignments: 8,
                completedAssignments: 12,
                averageGrade: 8.5
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
        <StudentLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <Title level={2} className="mb-2 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        Dashboard
                    </Title>
                    <Text className="text-gray-600">Tổng quan học tập</Text>
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
            </div>
        </StudentLayout>
    );
};

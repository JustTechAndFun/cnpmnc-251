import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Statistic, List, Avatar, Spin, Typography, Tag } from 'antd';
import { BookOutlined, FileTextOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import type { ApiResponse } from '../../types';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get<ApiResponse<TeacherStats>>(
                `${API_BASE_URL}/api/teacher/stats`,
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
            setStats({
                totalClasses: 8,
                totalAssignments: 24,
                pendingGrading: 12,
                totalStudents: 156
            });
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
            suffix: <Tag color="purple">+2</Tag>,
        },
        {
            title: 'Bài tập',
            value: stats.totalAssignments,
            prefix: <FileTextOutlined className="text-blue-500" />,
            suffix: <Tag color="blue">+5</Tag>,
        },
        {
            title: 'Chờ chấm điểm',
            value: stats.pendingGrading,
            prefix: <ClockCircleOutlined className="text-orange-500" />,
            suffix: <Tag color="orange">-3</Tag>,
        },
        {
            title: 'Tổng học sinh',
            value: stats.totalStudents,
            prefix: <TeamOutlined className="text-green-500" />,
            suffix: <Tag color="green">+12</Tag>,
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

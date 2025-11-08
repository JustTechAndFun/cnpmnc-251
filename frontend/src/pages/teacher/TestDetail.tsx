import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { Card, Typography, Button, Spin, Descriptions, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { teacherApi } from '../../apis';

const { Title, Text } = Typography;

interface TestDetail {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    duration: number;
    status: 'Upcoming' | 'In Progress' | 'Completed';
    classId?: string;
    className?: string;
}

export const TestDetail = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { testId } = useParams<{ testId: string }>();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<TestDetail | null>(null);

    // Only TEACHER role can access
    if (!auth || !auth.user || auth.user.role !== Role.TEACHER) {
        return <Navigate to="/unauthorized" replace />;
    }

    useEffect(() => {
        if (testId) {
            fetchTestDetail();
        }
    }, [testId]);

    const fetchTestDetail = async () => {
        setLoading(true);
        try {
            // Note: The API requires both classId and testId
            // For now, we'll need to get classId from somewhere (route params, state, etc.)
            // This is a temporary workaround
            const classId = '1'; // TODO: Get this from route or context
            const response = await teacherApi.getTestDetail(classId, testId!);

            if (!response.error && response.data) {
                const testData = response.data;
                setTest({
                    id: testData.id,
                    title: testData.name,
                    description: testData.description,
                    createdAt: testData.createdAt,
                    duration: testData.duration,
                    status: 'Completed', // Default status
                    classId: testData.classId
                });
            }
        } catch (error) {
            console.error('Failed to fetch test detail, using mock data', error);
            // Mock data fallback
            setTest({
                id: testId || '1',
                title: 'Kiểm tra giữa kỳ',
                description: 'Bài kiểm tra về các kỹ thuật phát triển phần mềm',
                createdAt: '2025-01-15',
                duration: 90,
                status: 'Completed',
                className: 'Công nghệ phần mềm nâng cao'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            'Completed': 'blue',
            'In Progress': 'orange',
            'Upcoming': 'purple',
        };
        return colorMap[status] || 'default';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="mb-4"
            >
                Quay lại
            </Button>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải thông tin bài kiểm tra...</Text>
                </div>
            ) : test ? (
                <Card className="shadow-sm">
                    <Title level={2} className="mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        {test.title}
                    </Title>

                    <Descriptions bordered column={1} className="mt-6">
                        <Descriptions.Item label="Mô tả">
                            {test.description || 'Chưa có mô tả'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lớp học">
                            {test.className || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {test.createdAt}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian làm bài">
                            {test.duration} phút
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(test.status)}>
                                {test.status}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="mt-6">
                        <Text type="secondary">
                            Tính năng xem chi tiết bài kiểm tra đang được phát triển.
                            Tại đây bạn có thể xem danh sách câu hỏi, kết quả của sinh viên, và các thông tin khác.
                        </Text>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="text-center py-12">
                        <Title level={4} type="secondary">Không tìm thấy bài kiểm tra</Title>
                        <Text className="text-gray-500">Bài kiểm tra với ID {testId} không tồn tại</Text>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default TestDetail;


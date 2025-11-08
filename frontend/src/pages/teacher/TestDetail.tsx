import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { Card, Typography, Button, Spin, Descriptions, Tag, Empty, Table } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { TestDetail as TestDetailType } from '../../apis/teacherApi';

const { Title, Text } = Typography;

interface Question {
    id: string;
    content: string;
    questionType: string;
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    order: number;
}

export const TestDetail = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { testId } = useParams<{ testId: string }>();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<TestDetailType | null>(null);

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
            // For now, we'll try to fetch from the tests list endpoint
            // since we don't have classId in the route
            const classesResponse = await teacherApi.getMyClasses();
            
            if (!classesResponse.error && classesResponse.data && classesResponse.data.length > 0) {
                // Try to fetch test from each class
                for (const classItem of classesResponse.data) {
                    try {
                        const response = await teacherApi.getTestDetail(classItem.id, testId!);
                        if (!response.error && response.data) {
                            setTest(response.data);
                            break;
                        }
                    } catch (error) {
                        // Continue to next class
                        continue;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch test detail', error);
        } finally {
            setLoading(false);
        }
    };

    const getQuestionTypeLabel = (type: string): string => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return 'Trắc nghiệm';
            case 'TRUE_FALSE': return 'Đúng/Sai';
            case 'SHORT_ANSWER': return 'Tự luận ngắn';
            default: return type;
        }
    };

    const questionsColumns = [
        {
            title: 'STT',
            key: 'order',
            render: (_: any, __: Question, index: number) => index + 1,
            width: 60,
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            render: (content: string) => <Text>{content}</Text>,
        },
        {
            title: 'Loại',
            dataIndex: 'questionType',
            key: 'questionType',
            render: (type: string) => <Tag color="blue">{getQuestionTypeLabel(type)}</Tag>,
            width: 130,
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            key: 'points',
            render: (points: number) => <Tag color="orange">{points}</Tag>,
            width: 80,
            align: 'center' as const,
        },
    ];

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
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <Title level={2} className="mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            {test.name}
                        </Title>

                        <Descriptions bordered column={2} className="mt-6">
                            <Descriptions.Item label="Mô tả" span={2}>
                                {test.description || 'Chưa có mô tả'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian làm bài">
                                {test.duration} phút
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã truy cập">
                                {test.passcode ? (
                                    <Text copyable={{ text: test.passcode }}>{test.passcode}</Text>
                                ) : (
                                    <Text type="secondary">Không có</Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(test.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {new Date(test.updatedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số câu hỏi" span={2}>
                                <Tag color="green">{test.questions?.length || 0} câu</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Questions Section */}
                    <Card 
                        title={
                            <div className="flex items-center gap-2">
                                <FileTextOutlined />
                                <Text strong>Danh sách câu hỏi</Text>
                            </div>
                        }
                        className="shadow-sm"
                    >
                        {test.questions && test.questions.length > 0 ? (
                            <Table
                                columns={questionsColumns}
                                dataSource={test.questions.sort((a, b) => a.order - b.order)}
                                rowKey="id"
                                pagination={false}
                                expandable={{
                                    expandedRowRender: (record: Question) => (
                                        <div className="p-4 bg-gray-50">
                                            {record.options && record.options.length > 0 && (
                                                <div className="mb-3">
                                                    <Text strong className="block mb-2">Các lựa chọn:</Text>
                                                    <ul className="list-disc pl-6">
                                                        {record.options.map((option, idx) => (
                                                            <li key={idx}>{option}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div>
                                                <Text strong>Đáp án đúng: </Text>
                                                <Text type="success">
                                                    {Array.isArray(record.correctAnswer)
                                                        ? record.correctAnswer.join(', ')
                                                        : record.correctAnswer}
                                                </Text>
                                            </div>
                                        </div>
                                    ),
                                }}
                            />
                        ) : (
                            <Empty
                                description="Bài kiểm tra chưa có câu hỏi nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>

                    {/* Student Results Section - Placeholder */}
                    <Card 
                        title={
                            <div className="flex items-center gap-2">
                                <ClockCircleOutlined />
                                <Text strong>Kết quả sinh viên</Text>
                            </div>
                        }
                        className="shadow-sm"
                    >
                        <Empty
                            description="Tính năng xem kết quả sinh viên đang được phát triển"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                </div>
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


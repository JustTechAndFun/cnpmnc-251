import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    Card,
    Typography,
    Spin,
    Empty,
    Button,
    Space,
    Tag,
    Descriptions,
    Alert,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    ArrowLeftOutlined,
    BookOutlined,
    FileTextOutlined,
    TeamOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    KeyOutlined
} from '@ant-design/icons';
import { studentApi } from '../../apis';
import type { ClassDto, TestDTO } from '../../apis/studentApi';

const { Title, Text } = Typography;

export const CourseDetail = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState<ClassDto | null>(null);
    const [tests, setTests] = useState<TestDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (classId) {
            fetchCourseDetail();
        }
    }, [classId]);

    const fetchCourseDetail = async () => {
        if (!classId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch class info from the list (since there's no single class endpoint for students)
            const classesResponse = await studentApi.getMyClasses();
            if (!classesResponse.error && classesResponse.data) {
                const foundClass = classesResponse.data.find(c => c.id === classId);
                if (foundClass) {
                    setClassInfo(foundClass);
                } else {
                    setError('Không tìm thấy lớp học');
                }
            }

            // Fetch tests in this class
            const testsResponse = await studentApi.getTestsInClass(classId);
            if (!testsResponse.error && testsResponse.data) {
                setTests(testsResponse.data);
            } else {
                console.warn('Failed to load tests:', testsResponse.message);
                setTests([]);
            }
        } catch (err: any) {
            console.error('Failed to load course detail:', err);
            setError('Không thể tải thông tin lớp học');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId: string) => {
        navigate(`/student/exams/${testId}`);
    };

    const getTestStatusTag = () => {
        // You can add more logic here based on test status if available
        return <Tag color="blue">Có sẵn</Tag>;
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải thông tin lớp học...</Text>
                </div>
            </div>
        );
    }

    if (error || !classInfo) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/student/courses')}
                    className="mb-4"
                >
                    Quay lại
                </Button>
                <Alert
                    message="Lỗi"
                    description={error || 'Không tìm thấy lớp học'}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/student/courses')}
                className="mb-4"
            >
                Quay lại danh sách lớp học
            </Button>

            {/* Class Information Card */}
            <Card className="shadow-sm mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <Title level={2} className="mb-2 bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                            {classInfo.className}
                        </Title>
                        <Space size="middle" wrap>
                            <Tag color="green" className="text-base px-3 py-1">
                                {classInfo.classCode}
                            </Tag>
                        </Space>
                    </div>
                    <BookOutlined className="text-5xl text-green-500" />
                </div>

                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label={<><TeamOutlined className="mr-2" />Giảng viên</>}>
                        <Text strong>{classInfo.teacherName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><CalendarOutlined className="mr-2" />Học kỳ</>}>
                        {classInfo.semester} - Năm {classInfo.year}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Tổng số bài kiểm tra"
                            value={tests.length}
                            prefix={<FileTextOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Bài kiểm tra khả dụng"
                            value={tests.length}
                            prefix={<ClockCircleOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Bài đã hoàn thành"
                            value={0}
                            prefix={<BookOutlined className="text-purple-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tests List */}
            <Card className="shadow-sm">
                <Title level={3} className="mb-4">
                    <FileTextOutlined className="mr-2 text-green-600" />
                    Danh sách bài kiểm tra
                </Title>

                {tests.length === 0 ? (
                    <Empty
                        description="Chưa có bài kiểm tra nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Space direction="vertical" size="middle" className="w-full">
                        {tests.map((test) => (
                            <Card
                                key={test.id}
                                className="hover:shadow-md transition-shadow border border-gray-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Title level={4} className="mb-0">
                                                {test.title}
                                            </Title>
                                            {getTestStatusTag()}
                                        </div>

                                        {test.description && (
                                            <Text type="secondary" className="block mb-3">
                                                {test.description}
                                            </Text>
                                        )}

                                        <Space size="large" wrap>
                                            <Space>
                                                <ClockCircleOutlined className="text-gray-500" />
                                                <Text type="secondary">
                                                    Thời gian: {test.duration} phút
                                                </Text>
                                            </Space>
                                            {test.passcode && (
                                                <Space>
                                                    <KeyOutlined className="text-gray-500" />
                                                    <Text type="secondary">
                                                        Yêu cầu mã truy cập
                                                    </Text>
                                                </Space>
                                            )}
                                            <Space>
                                                <CalendarOutlined className="text-gray-500" />
                                                <Text type="secondary">
                                                    Tạo ngày: {test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}
                                                </Text>
                                            </Space>
                                        </Space>
                                    </div>

                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => handleStartTest(test.id)}
                                        className="ml-4"
                                    >
                                        Làm bài thi
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </Space>
                )}
            </Card>
        </div>
    );
};

export default CourseDetail;

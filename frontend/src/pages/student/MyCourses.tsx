import { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, Row, Col, Tag, Button, Space, Alert } from 'antd';
import { BookOutlined, TeamOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { studentApi } from '../../apis';
import type { ClassDto } from '../../apis/studentApi';

const { Title, Text } = Typography;

export const MyCourses = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentApi.getMyClasses();
            if (!response.error && response.data) {
                setClasses(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách lớp học');
            }
        } catch (error) {
            console.error('Failed to fetch classes', error);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleViewClass = (classId: string) => {
        navigate(`/student/courses/${classId}`);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    Lớp học của tôi
                </Title>
                <Text type="secondary">Danh sách các lớp học bạn đã đăng ký</Text>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải dữ liệu...</Text>
                </div>
            ) : error ? (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={fetchMyClasses} icon={<ReloadOutlined />}>
                            Thử lại
                        </Button>
                    }
                />
            ) : classes.length === 0 ? (
                <Card className="shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Space direction="vertical" size="small">
                                <Text type="secondary">Bạn chưa đăng ký lớp học nào</Text>
                                <Text type="secondary" className="text-sm">
                                    Liên hệ với giảng viên để được thêm vào lớp
                                </Text>
                            </Space>
                        }
                    />
                </Card>
            ) : (
                <Row gutter={[16, 16]}>
                    {classes.map((classItem) => (
                        <Col xs={24} sm={12} lg={8} key={classItem.id}>
                            <Card
                                hoverable
                                className="shadow-sm hover:shadow-lg transition-shadow h-full"
                                onClick={() => handleViewClass(classItem.id)}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <Title level={4} className="mb-2 text-green-700">
                                                {classItem.className}
                                            </Title>
                                            <Tag color="green" className="mb-2">
                                                {classItem.classCode}
                                            </Tag>
                                        </div>
                                        <BookOutlined className="text-3xl text-green-500" />
                                    </div>

                                    <Space direction="vertical" size="small" className="w-full">
                                        <div className="flex items-center text-gray-600">
                                            <TeamOutlined className="mr-2" />
                                            <Text type="secondary">
                                                GV: {classItem.teacherName}
                                            </Text>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <CalendarOutlined className="mr-2" />
                                            <Text type="secondary">
                                                {classItem.semester} - Năm {classItem.year}
                                            </Text>
                                        </div>
                                    </Space>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Button type="primary" block onClick={() => handleViewClass(classItem.id)}>
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};


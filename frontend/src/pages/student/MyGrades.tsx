import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Spin, Empty, Select, Space, Statistic, Row, Col, Alert, Button } from 'antd';
import { LineChartOutlined, TrophyOutlined, BookOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

interface GradeRecord {
    id: string;
    className: string;
    testName: string;
    score: number;
    maxScore: number;
    percentage: number;
    submittedAt: string;
    gradedAt: string;
    status: 'graded' | 'pending' | 'missing';
}

interface GradeStats {
    totalTests: number;
    averageScore: number;
    highestScore: number;
    completedTests: number;
}

export const MyGrades = () => {
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [stats, setStats] = useState<GradeStats>({
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        completedTests: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string>('all');

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        setLoading(true);
        setError(null);
        try {
            // TODO: Implement actual API call when backend endpoint is ready
            // const response = await studentApi.getMyGrades();

            // Mock data for demonstration
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockGrades: GradeRecord[] = [
                {
                    id: '1',
                    className: 'Lập trình hướng đối tượng',
                    testName: 'Kiểm tra giữa kỳ',
                    score: 8.5,
                    maxScore: 10,
                    percentage: 85,
                    submittedAt: '2024-11-01T10:30:00',
                    gradedAt: '2024-11-03T14:00:00',
                    status: 'graded'
                },
                {
                    id: '2',
                    className: 'Cấu trúc dữ liệu',
                    testName: 'Bài tập tuần 5',
                    score: 9.0,
                    maxScore: 10,
                    percentage: 90,
                    submittedAt: '2024-10-28T09:00:00',
                    gradedAt: '2024-10-30T16:00:00',
                    status: 'graded'
                },
                {
                    id: '3',
                    className: 'Lập trình hướng đối tượng',
                    testName: 'Bài tập tuần 8',
                    score: 7.5,
                    maxScore: 10,
                    percentage: 75,
                    submittedAt: '2024-11-05T11:00:00',
                    gradedAt: '2024-11-06T10:00:00',
                    status: 'graded'
                },
                {
                    id: '4',
                    className: 'Cơ sở dữ liệu',
                    testName: 'Kiểm tra lý thuyết',
                    score: 0,
                    maxScore: 10,
                    percentage: 0,
                    submittedAt: '2024-11-07T08:00:00',
                    gradedAt: '',
                    status: 'pending'
                }
            ];

            setGrades(mockGrades);

            // Calculate statistics
            const gradedTests = mockGrades.filter(g => g.status === 'graded');
            const totalScore = gradedTests.reduce((sum, g) => sum + g.score, 0);
            const avgScore = gradedTests.length > 0 ? totalScore / gradedTests.length : 0;
            const maxScore = gradedTests.length > 0 ? Math.max(...gradedTests.map(g => g.score)) : 0;

            setStats({
                totalTests: mockGrades.length,
                averageScore: avgScore,
                highestScore: maxScore,
                completedTests: gradedTests.length
            });

        } catch (error) {
            console.error('Failed to fetch grades', error);
            setError('Không thể tải dữ liệu điểm số');
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status: GradeRecord['status']) => {
        switch (status) {
            case 'graded':
                return <Tag color="success">Đã chấm điểm</Tag>;
            case 'pending':
                return <Tag color="warning">Đang chờ</Tag>;
            case 'missing':
                return <Tag color="error">Chưa nộp</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const columns: ColumnsType<GradeRecord> = [
        {
            title: 'Lớp học',
            dataIndex: 'className',
            key: 'className',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Bài kiểm tra',
            dataIndex: 'testName',
            key: 'testName',
        },
        {
            title: 'Điểm số',
            key: 'score',
            align: 'center',
            render: (_, record) => (
                record.status === 'graded' ? (
                    <Text strong className={getScoreColor(record.percentage)}>
                        {record.score}/{record.maxScore}
                    </Text>
                ) : (
                    <Text type="secondary">-</Text>
                )
            )
        },
        {
            title: 'Phần trăm',
            dataIndex: 'percentage',
            key: 'percentage',
            align: 'center',
            render: (percentage: number, record) => (
                record.status === 'graded' ? (
                    <Tag color={percentage >= 80 ? 'green' : percentage >= 60 ? 'blue' : percentage >= 40 ? 'orange' : 'red'}>
                        {percentage}%
                    </Tag>
                ) : (
                    <Text type="secondary">-</Text>
                )
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: GradeRecord['status']) => getStatusTag(status)
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
        },
        {
            title: 'Ngày chấm',
            dataIndex: 'gradedAt',
            key: 'gradedAt',
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
        }
    ];

    const filteredGrades = selectedClass === 'all'
        ? grades
        : grades.filter(g => g.className === selectedClass);

    const uniqueClasses = Array.from(new Set(grades.map(g => g.className)));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    Điểm số của tôi
                </Title>
                <Text type="secondary">Theo dõi kết quả học tập của bạn</Text>
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
                        <Button size="small" onClick={fetchGrades} icon={<ReloadOutlined />}>
                            Thử lại
                        </Button>
                    }
                />
            ) : (
                <>
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Tổng bài kiểm tra"
                                    value={stats.totalTests}
                                    prefix={<BookOutlined className="text-blue-500" />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Đã hoàn thành"
                                    value={stats.completedTests}
                                    prefix={<LineChartOutlined className="text-green-500" />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Điểm trung bình"
                                    value={stats.averageScore.toFixed(2)}
                                    suffix="/ 10"
                                    valueStyle={{ color: stats.averageScore >= 8 ? '#52c41a' : stats.averageScore >= 6 ? '#1890ff' : '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <Statistic
                                    title="Điểm cao nhất"
                                    value={stats.highestScore.toFixed(1)}
                                    prefix={<TrophyOutlined className="text-orange-500" />}
                                    suffix="/ 10"
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Filter and Table */}
                    <Card className="shadow-sm">
                        <Space direction="vertical" size="large" className="w-full">
                            <div className="flex justify-between items-center">
                                <Title level={4}>Danh sách điểm</Title>
                                <Select
                                    value={selectedClass}
                                    onChange={setSelectedClass}
                                    style={{ width: 250 }}
                                    placeholder="Chọn lớp học"
                                >
                                    <Option value="all">Tất cả lớp học</Option>
                                    {uniqueClasses.map(className => (
                                        <Option key={className} value={className}>
                                            {className}
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            {filteredGrades.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<Text type="secondary">Chưa có điểm số nào</Text>}
                                />
                            ) : (
                                <Table
                                    columns={columns}
                                    dataSource={filteredGrades}
                                    rowKey="id"
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Tổng số ${total} kết quả`
                                    }}
                                />
                            )}
                        </Space>
                    </Card>
                </>
            )}
        </div>
    );
};


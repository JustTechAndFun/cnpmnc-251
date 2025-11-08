import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Spin, Empty, Select, Space, Statistic, Row, Col, Alert, Button } from 'antd';
import { LineChartOutlined, TrophyOutlined, BookOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ErrorModal } from '../../components/ErrorModal';
import { studentApi } from '../../apis';

const { Title, Text } = Typography;
const { Option } = Select;

interface GradeRecord {
    submissionId: string;
    testId: string;
    testName: string;
    classId: string;
    className: string;
    score: number;
    maxScore: number;
    percentage: number;
    submittedAt: string;
    status: string;
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
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentApi.getMyGrades();

            if (!response.error && response.data) {
                setGrades(response.data);

                // Calculate statistics
                const totalScore = response.data.reduce((sum, g) => sum + g.score, 0);
                const avgScore = response.data.length > 0 ? totalScore / response.data.length : 0;
                const maxScore = response.data.length > 0 ? Math.max(...response.data.map(g => g.score)) : 0;

                setStats({
                    totalTests: response.data.length,
                    averageScore: avgScore,
                    highestScore: maxScore,
                    completedTests: response.data.length
                });
            } else {
                const errorMsg = response.message || 'Không thể tải dữ liệu điểm số';
                setError(errorMsg);
                setErrorMessage(errorMsg);
                setErrorModalVisible(true);
                setGrades([]);
            }
        } catch (error) {
            console.error('Failed to fetch grades', error);
            const errorMsg = 'Không thể tải dữ liệu điểm số. Vui lòng thử lại sau.';
            setError(errorMsg);
            setErrorMessage(errorMsg);
            setErrorModalVisible(true);
            setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status: string) => {
        if (status === 'COMPLETED') {
            return <Tag color="success">Đã hoàn thành</Tag>;
        } else if (status === 'IN_PROGRESS') {
            return <Tag color="warning">Đang làm</Tag>;
        } else if (status === 'NOT_STARTED') {
            return <Tag color="default">Chưa bắt đầu</Tag>;
        }
        return <Tag>{status}</Tag>;
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
                <Text strong className={getScoreColor(record.percentage)}>
                    {record.score.toFixed(1)}/{record.maxScore}
                </Text>
            )
        },
        {
            title: 'Phần trăm',
            dataIndex: 'percentage',
            key: 'percentage',
            align: 'center',
            render: (percentage: number) => (
                <Tag color={percentage >= 80 ? 'green' : percentage >= 60 ? 'blue' : percentage >= 40 ? 'orange' : 'red'}>
                    {percentage.toFixed(1)}%
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: string) => getStatusTag(status)
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
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
                <Title level={2} className="mb-2 bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
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
                                    rowKey="submissionId"
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

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </div>
    );
};


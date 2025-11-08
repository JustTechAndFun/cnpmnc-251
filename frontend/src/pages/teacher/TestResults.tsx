import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    Card,
    Table,
    Typography,
    Spin,
    Result,
    Button,
    Space,
    Tag,
    Statistic,
    Row,
    Col,
    Empty,
    Avatar
} from 'antd';
import {
    ArrowLeftOutlined,
    EyeOutlined,
    TrophyOutlined,
    RiseOutlined,
    FallOutlined,
    BarChartOutlined,
    UserOutlined
} from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { StudentSubmission, TestResultsResponse } from '../../types';
import type { ColumnsType, TableProps } from 'antd/es/table';

const { Title, Text } = Typography;

type SortOrder = 'ascend' | 'descend' | null;

export const TestResults = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<TestResultsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortedInfo, setSortedInfo] = useState<{
        order: SortOrder;
        columnKey: string | null;
    }>({
        order: null,
        columnKey: null
    });

    useEffect(() => {
        if (testId) {
            fetchTestInfo(testId);
        } else {
            setError('Test ID is missing');
            setLoading(false);
        }
    }, [testId]);

    const fetchTestInfo = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            
            // First, get test info to find classId
            // We need to fetch from all classes to find which class this test belongs to
            const classesResponse = await teacherApi.getMyClasses();
            
            if (!classesResponse.error && classesResponse.data) {
                const classes = classesResponse.data;
                let foundClassId: string | null = null;
                
                // Check each class for this test
                for (const cls of classes) {
                    const testsResponse = await teacherApi.getTestsInClass(cls.id);
                    if (!testsResponse.error && testsResponse.data) {
                        const testExists = testsResponse.data.find(t => t.id === id);
                        if (testExists) {
                            foundClassId = cls.id;
                            break;
                        }
                    }
                }
                
                if (foundClassId) {
                    fetchTestResults(foundClassId, id);
                } else {
                    setError('Test not found in any of your classes');
                    setLoading(false);
                }
            } else {
                setError('Failed to load classes');
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to fetch test info', err);
            setError('Failed to load test information. Please try again.');
            setLoading(false);
        }
    };

    const fetchTestResults = async (clsId: string, id: string) => {
        try {
            setError(null);
            const response = await teacherApi.getTestResults(clsId, id);

            if (!response.error && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to load test results');
            }
        } catch (err) {
            console.error('Failed to fetch test results', err);
            setError('Failed to load test results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange: TableProps<StudentSubmission>['onChange'] = (_pagination, _filters, sorter) => {
        if (Array.isArray(sorter)) {
            // Multiple sorters - not used in this case
            return;
        }

        const { order, columnKey } = sorter as { order: SortOrder; columnKey: string | null };
        setSortedInfo({
            order: order || null,
            columnKey: columnKey as string | null
        });
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Tag color="success">Hoàn thành</Tag>;
            case 'IN_PROGRESS':
                return <Tag color="processing">Đang làm</Tag>;
            case 'NOT_STARTED':
                return <Tag color="default">Chưa bắt đầu</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const formatCompletionTime = (minutes?: number): string => {
        if (!minutes) return 'N/A';
        if (minutes < 60) {
            return `${Math.round(minutes)} phút`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}phút`;
    };

    const columns: ColumnsType<StudentSubmission> = [
        {
            title: 'Học sinh',
            key: 'studentName',
            sorter: (a, b) => a.studentName.localeCompare(b.studentName),
            sortOrder: sortedInfo.columnKey === 'studentName' ? sortedInfo.order : null,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={undefined} />
                    <div>
                        <Text strong>{record.studentName}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">{record.studentEmail}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Điểm số',
            key: 'score',
            sorter: (a, b) => a.score - b.score,
            sortOrder: sortedInfo.columnKey === 'score' ? sortedInfo.order : null,
            render: (_, record) => {
                const percentage = record.maxScore > 0 ? (record.score / record.maxScore) * 100 : 0;
                return (
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ color: percentage >= 50 ? '#3f8600' : '#cf1322' }}>
                            {record.score} / {record.maxScore}
                        </Text>
                        <Text type="secondary" className="text-xs">
                            {percentage.toFixed(1)}%
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: 'Thời gian hoàn thành',
            key: 'completionTime',
            sorter: (a, b) => (a.completionTime || 0) - (b.completionTime || 0),
            sortOrder: sortedInfo.columnKey === 'completionTime' ? sortedInfo.order : null,
            render: (_, record) => (
                <Text>{formatCompletionTime(record.completionTime)}</Text>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => getStatusTag(record.status),
        },
        {
            title: 'Ngày nộp',
            key: 'submittedAt',
            sorter: (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
            sortOrder: sortedInfo.columnKey === 'submittedAt' ? sortedInfo.order : null,
            render: (_, record) => (
                <Text>{new Date(record.submittedAt).toLocaleString('vi-VN')}</Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/student/test-result/${record.submissionId}`)}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <Result
                    status="error"
                    title="Không thể tải kết quả"
                    subTitle={error || 'Test ID không hợp lệ hoặc không tồn tại.'}
                    extra={[
                        <Button type="primary" key="back" onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    ]}
                />
            </div>
        );
    }

    const { submissions, summary } = data;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    Quay lại
                </Button>
                <div>
                    <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Kết quả bài thi
                    </Title>
                    <Text type="secondary" className="text-lg">
                        {data.testName}
                    </Text>
                </div>
            </div>

            {/* Statistics */}
            <Card className="mb-6 shadow-sm">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Tổng số bài nộp"
                            value={summary.totalSubmissions}
                            prefix={<BarChartOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Điểm cao nhất"
                            value={summary.highestScore}
                            suffix={`/ ${summary.maxScore}`}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Điểm thấp nhất"
                            value={summary.lowestScore}
                            suffix={`/ ${summary.maxScore}`}
                            prefix={<FallOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Điểm trung bình"
                            value={summary.averageScore}
                            precision={1}
                            suffix={`/ ${summary.maxScore}`}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 16]} className="mt-4">
                    <Col xs={24} sm={12}>
                        <Statistic
                            title="Tỷ lệ hoàn thành"
                            value={summary.completionRate}
                            precision={1}
                            suffix="%"
                        />
                    </Col>
                </Row>
            </Card>

            {/* Results Table */}
            <Card className="shadow-sm">
                {submissions.length === 0 ? (
                    <Empty description="Chưa có học sinh nào nộp bài" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={submissions}
                        rowKey="submissionId"
                        onChange={handleTableChange}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} bài nộp`,
                        }}
                    />
                )}
            </Card>
        </div>
    );
};


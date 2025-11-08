import { useEffect, useState } from 'react';
import { Card, Typography, Table, Select, Space, Tag, Spin, Empty, Alert, Button, Input, message } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { ClassDto, TestDTO } from '../../apis/teacherApi';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentGrade {
    submissionId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    testId?: string;
    testName?: string;
    score: number;
    maxScore: number;
    submittedAt?: string;
    completionTime?: number;
    status: string;
}

export const GradeStudents = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [tests, setTests] = useState<TestDTO[]>([]);
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [gradesLoading, setGradesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudentsAndTests(selectedClassId);
        }
    }, [selectedClassId]);

    useEffect(() => {
        if (selectedClassId && selectedTestId) {
            fetchGrades(selectedClassId, selectedTestId);
        }
    }, [selectedClassId, selectedTestId]);

    const fetchClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await teacherApi.getMyClasses();
            if (!response.error && response.data) {
                setClasses(response.data);
                if (response.data.length > 0 && !selectedClassId) {
                    setSelectedClassId(response.data[0].id);
                }
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

    const fetchStudentsAndTests = async (classId: string) => {
        try {
            const testsResponse = await teacherApi.getTestsInClass(classId);

            if (!testsResponse.error && testsResponse.data) {
                setTests(testsResponse.data);
                if (testsResponse.data.length > 0 && !selectedTestId) {
                    setSelectedTestId(testsResponse.data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch tests', error);
        }
    };

    const fetchGrades = async (classId: string, testId: string) => {
        setGradesLoading(true);
        try {
            const response = await teacherApi.getTestResults(classId, testId);

            if (!response.error && response.data) {
                setGrades(response.data.submissions || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách điểm');
                setGrades([]);
            }
        } catch (error) {
            console.error('Failed to fetch grades', error);
            message.error('Không thể tải danh sách điểm');
            setGrades([]);
        } finally {
            setGradesLoading(false);
        }
    };

    const getStatusTag = (status: string) => {
        if (status === 'GRADED') {
            return <Tag color="success" icon={<CheckCircleOutlined />}>Đã chấm</Tag>;
        } else if (status === 'SUBMITTED') {
            return <Tag color="processing">Đã nộp</Tag>;
        }
        return <Tag color="default">{status}</Tag>;
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-blue-600';
        if (score >= 4) return 'text-orange-600';
        return 'text-red-600';
    };

    const columns: ColumnsType<StudentGrade> = [
        {
            title: 'Mã SV',
            dataIndex: 'studentId',
            key: 'studentId',
            width: 120,
            render: (id: string) => <Text code>{id}</Text>
        },
        {
            title: 'Họ và tên',
            dataIndex: 'studentName',
            key: 'studentName',
            render: (name: string) => <Text strong>{name}</Text>,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm kiếm sinh viên"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Tìm
                    </Button>
                </div>
            ),
            onFilter: (value, record) =>
                record.studentName.toLowerCase().includes(value.toString().toLowerCase())
        },
        {
            title: 'Email',
            dataIndex: 'studentEmail',
            key: 'studentEmail',
            ellipsis: true
        },
        {
            title: 'Điểm số',
            key: 'score',
            align: 'center',
            width: 120,
            render: (_, record) => (
                record.score !== undefined ? (
                    <Text strong className={getScoreColor(record.score)}>
                        {record.score.toFixed(1)}/{record.maxScore}
                    </Text>
                ) : (
                    <Text type="secondary">-</Text>
                )
            ),
            sorter: (a, b) => (a.score || 0) - (b.score || 0)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 130,
            render: (status: StudentGrade['status']) => getStatusTag(status),
            filters: [
                { text: 'Đã chấm', value: 'graded' },
                { text: 'Chờ chấm', value: 'submitted' },
                { text: 'Chưa nộp', value: 'not-submitted' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date?: string) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : <Text type="secondary">-</Text>,
            sorter: (a, b) => {
                if (!a.submittedAt) return 1;
                if (!b.submittedAt) return -1;
                return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
            }
        }
    ];

    const filteredGrades = grades;

    const stats = {
        total: grades.length,
        submitted: grades.length,
        avgScore: grades.length > 0 ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length : 0
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Chấm điểm sinh viên
                    </Title>
                    <Text type="secondary">Quản lý và chấm điểm bài kiểm tra</Text>
                </div>
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => selectedClassId && selectedTestId && fetchGrades(selectedClassId, selectedTestId)}
                    loading={gradesLoading}
                    disabled={!selectedClassId || !selectedTestId}
                >
                    Làm mới
                </Button>
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
                        <Button size="small" onClick={fetchClasses} icon={<ReloadOutlined />}>
                            Thử lại
                        </Button>
                    }
                />
            ) : classes.length === 0 ? (
                <Card className="shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Bạn chưa có lớp học nào"
                    />
                </Card>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Tổng số bài nộp</Text>
                            <Title level={3} className="mb-0">{stats.total}</Title>
                        </Card>
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Đã nộp</Text>
                            <Title level={3} className="mb-0 text-green-600">{stats.submitted}</Title>
                        </Card>
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Điểm TB</Text>
                            <Title level={3} className="mb-0 text-blue-600">
                                {stats.avgScore.toFixed(1)}
                            </Title>
                        </Card>
                    </div>

                    {/* Main Card */}
                    <Card className="shadow-sm">
                        <Space direction="vertical" size="large" className="w-full">
                            {/* Filters */}
                            <div className="flex gap-4">
                                <Space>
                                    <Text strong>Lớp học:</Text>
                                    <Select
                                        value={selectedClassId}
                                        onChange={setSelectedClassId}
                                        style={{ width: 250 }}
                                    >
                                        {classes.map(cls => (
                                            <Option key={cls.id} value={cls.id}>
                                                {cls.className} ({cls.classCode})
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>
                                <Space>
                                    <Text strong>Bài kiểm tra:</Text>
                                    <Select
                                        value={selectedTestId}
                                        onChange={setSelectedTestId}
                                        style={{ width: 300 }}
                                        disabled={tests.length === 0}
                                    >
                                        {tests.map(test => (
                                            <Option key={test.id} value={test.id}>
                                                {test.title}
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>
                            </div>

                            {/* Table */}
                            {!selectedClassId || !selectedTestId ? (
                                <Empty description="Vui lòng chọn lớp học và bài kiểm tra" />
                            ) : gradesLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Spin size="large" />
                                    <Text className="mt-4 text-gray-600">Đang tải danh sách điểm...</Text>
                                </div>
                            ) : grades.length === 0 ? (
                                <Empty description="Chưa có dữ liệu điểm" />
                            ) : (
                                <Table
                                    columns={columns}
                                    dataSource={filteredGrades}
                                    rowKey={(record) => `${record.studentId}-${record.testId}`}
                                    loading={gradesLoading}
                                    pagination={{
                                        pageSize: 15,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Tổng số ${total} sinh viên`
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

export default GradeStudents;
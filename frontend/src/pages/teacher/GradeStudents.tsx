import { useEffect, useState } from 'react';
import { Card, Typography, Table, Select, Space, Tag, Spin, Empty, Alert, Button, Input, Modal, Form, InputNumber, message } from 'antd';
import { SearchOutlined, ReloadOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { ClassDto, StudentDto, TestDTO } from '../../apis/teacherApi';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentGrade {
    studentId: string;
    studentName: string;
    studentEmail: string;
    testId: string;
    testName: string;
    score?: number;
    maxScore: number;
    submittedAt?: string;
    gradedAt?: string;
    status: 'submitted' | 'graded' | 'not-submitted';
}

export const GradeStudents = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [students, setStudents] = useState<StudentDto[]>([]);
    const [tests, setTests] = useState<TestDTO[]>([]);
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [gradesLoading, setGradesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gradeModalVisible, setGradeModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
    const [gradeForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

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
            const [studentsResponse, testsResponse] = await Promise.all([
                teacherApi.getClassStudents(classId),
                teacherApi.getTestsInClass(classId)
            ]);

            if (!studentsResponse.error && studentsResponse.data) {
                setStudents(studentsResponse.data);
            }

            if (!testsResponse.error && testsResponse.data) {
                setTests(testsResponse.data);
                if (testsResponse.data.length > 0 && !selectedTestId) {
                    setSelectedTestId(testsResponse.data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch students and tests', error);
        }
    };

    const fetchGrades = async (_classId: string, testId: string) => {
        setGradesLoading(true);
        try {
            // TODO: Implement actual API call when backend endpoint is ready
            // For now, generate mock data based on students and selected test
            await new Promise(resolve => setTimeout(resolve, 800));

            const selectedTest = tests.find(t => t.id === testId);
            if (!selectedTest) return;

            const mockGrades: StudentGrade[] = students.map((student) => {
                const isSubmitted = Math.random() > 0.2; // 80% submission rate
                const isGraded = isSubmitted && Math.random() > 0.3; // 70% of submitted are graded

                return {
                    studentId: student.id,
                    studentName: student.name || 'Chưa có tên',
                    studentEmail: student.email,
                    testId: testId,
                    testName: selectedTest.name,
                    score: isGraded ? parseFloat((Math.random() * 10).toFixed(1)) : undefined,
                    maxScore: 10,
                    submittedAt: isSubmitted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                    gradedAt: isGraded ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                    status: isGraded ? 'graded' : isSubmitted ? 'submitted' : 'not-submitted'
                };
            });

            setGrades(mockGrades);
        } catch (error) {
            console.error('Failed to fetch grades', error);
            message.error('Không thể tải danh sách điểm');
        } finally {
            setGradesLoading(false);
        }
    };

    const handleGradeStudent = (record: StudentGrade) => {
        setSelectedStudent(record);
        gradeForm.setFieldsValue({
            score: record.score || 0
        });
        setGradeModalVisible(true);
    };

    const handleSubmitGrade = async (_values: { score: number }) => {
        if (!selectedStudent) return;

        setSubmitting(true);
        try {
            // TODO: Implement actual API call when backend endpoint is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            message.success('Chấm điểm thành công');
            setGradeModalVisible(false);
            gradeForm.resetFields();

            // Refresh grades
            if (selectedClassId && selectedTestId) {
                fetchGrades(selectedClassId, selectedTestId);
            }
        } catch (error) {
            console.error('Failed to submit grade', error);
            message.error('Không thể lưu điểm');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusTag = (status: StudentGrade['status']) => {
        switch (status) {
            case 'graded':
                return <Tag color="success" icon={<CheckCircleOutlined />}>Đã chấm</Tag>;
            case 'submitted':
                return <Tag color="warning">Chờ chấm</Tag>;
            case 'not-submitted':
                return <Tag color="error">Chưa nộp</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
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
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <Button
                    type={record.status === 'graded' ? 'default' : 'primary'}
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleGradeStudent(record)}
                    disabled={record.status === 'not-submitted'}
                >
                    {record.status === 'graded' ? 'Sửa' : 'Chấm'}
                </Button>
            )
        }
    ];

    const filteredGrades = grades;

    const stats = {
        total: grades.length,
        graded: grades.filter(g => g.status === 'graded').length,
        pending: grades.filter(g => g.status === 'submitted').length,
        notSubmitted: grades.filter(g => g.status === 'not-submitted').length,
        avgScore: grades.filter(g => g.score !== undefined).reduce((sum, g) => sum + (g.score || 0), 0) /
            grades.filter(g => g.score !== undefined).length || 0
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Tổng số SV</Text>
                            <Title level={3} className="mb-0">{stats.total}</Title>
                        </Card>
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Đã chấm</Text>
                            <Title level={3} className="mb-0 text-green-600">{stats.graded}</Title>
                        </Card>
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Chờ chấm</Text>
                            <Title level={3} className="mb-0 text-orange-600">{stats.pending}</Title>
                        </Card>
                        <Card className="shadow-sm text-center">
                            <Text type="secondary">Chưa nộp</Text>
                            <Title level={3} className="mb-0 text-red-600">{stats.notSubmitted}</Title>
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
                                                {test.name}
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

            {/* Grade Modal */}
            <Modal
                title={`Chấm điểm - ${selectedStudent?.studentName}`}
                open={gradeModalVisible}
                onCancel={() => {
                    setGradeModalVisible(false);
                    gradeForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={gradeForm}
                    layout="vertical"
                    onFinish={handleSubmitGrade}
                >
                    <Space direction="vertical" size="small" className="w-full mb-4">
                        <Text type="secondary">Bài kiểm tra: {selectedStudent?.testName}</Text>
                        <Text type="secondary">Email: {selectedStudent?.studentEmail}</Text>
                        {selectedStudent?.submittedAt && (
                            <Text type="secondary">
                                Ngày nộp: {new Date(selectedStudent.submittedAt).toLocaleString('vi-VN')}
                            </Text>
                        )}
                    </Space>

                    <Form.Item
                        name="score"
                        label="Điểm số"
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm số' },
                            { type: 'number', min: 0, max: 10, message: 'Điểm số phải từ 0 đến 10' }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            max={10}
                            step={0.1}
                            precision={1}
                            style={{ width: '100%' }}
                            placeholder="Nhập điểm (0-10)"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={() => {
                                setGradeModalVisible(false);
                                gradeForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<CheckCircleOutlined />}
                            >
                                Lưu điểm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


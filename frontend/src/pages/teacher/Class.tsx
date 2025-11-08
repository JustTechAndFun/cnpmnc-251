import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Card,
    Table,
    Button,
    Typography,
    Tag,
    Spin,
    message,
    Modal,
    Input,
    Form,
    Statistic,
    Row,
    Col,
    Select
} from 'antd';
import type { Breakpoint } from 'antd';
import {
    PlusOutlined,
    FileAddOutlined,
    UserOutlined,
    BookOutlined,
    TeamOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { ClassDto } from '../../apis/teacherApi';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

export const ManageClasses = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [addStudentForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await teacherApi.getMyClasses();
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
        navigate(`/teacher/classes/${classId}`);
    };

    const handleAddStudent = (classId: string) => {
        setSelectedClassId(classId);
        setAddStudentModalVisible(true);
        addStudentForm.resetFields();
    };

    const handleAddStudentSubmit = async (values: { searchType: 'email' | 'studentId'; searchValue: string }) => {
        if (!selectedClassId) return;

        setSubmitting(true);
        try {
            const request = values.searchType === 'email'
                ? { email: values.searchValue }
                : { studentId: values.searchValue };

            const response = await teacherApi.addStudentToClass(selectedClassId, request);

            if (!response.error) {
                message.success('Thêm học sinh thành công');
                setAddStudentModalVisible(false);
                addStudentForm.resetFields();
                // Refresh class list to update student count
                fetchClasses();
            } else {
                message.error(response.message || 'Không thể thêm học sinh');
            }
        } catch (error) {
            console.error('Failed to add student', error);
            message.error('Không thể thêm học sinh vào lớp');
        } finally {
            setSubmitting(false);
        }
    };

    const columns: ColumnsType<ClassDto> = [
        {
            title: 'Tên lớp',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left' as const,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250,
            responsive: ['md' as Breakpoint],
        },
        {
            title: 'MSSV',
            dataIndex: 'studentId',
            key: 'studentId',
            width: 120,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status}
                </Tag>
            ),
        },
    ];

    const testColumns = [
        {
            title: 'Tên bài kiểm tra',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            fixed: 'left' as const,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            responsive: ['md' as Breakpoint],
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'duration',
            key: 'duration',
            width: 140,
            responsive: ['sm' as Breakpoint],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const colorMap: Record<string, string> = {
                    'Completed': 'blue',
                    'In Progress': 'orange',
                    'Upcoming': 'purple',
                };
                return (
                    <Tag color={colorMap[status] || 'default'}>
                        {status}
                    </Tag>
                );
            },
        },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải dữ liệu...</Text>
                </div>
            ) : (
                <>
                    {/* Class Information Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                    <Title level={2} className="mb-0 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent text-xl sm:text-2xl">
                                        {classInfo.name}
                                    </Title>
                                    {classes.length > 0 && (
                                        <Select
                                            value={classInfo.id}
                                            onChange={handleClassChange}
                                            className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[300px]"
                                            placeholder="Chọn lớp học"
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) => {
                                                const children = option?.children;
                                                const label = typeof children === 'string' ? children : String(children);
                                                return label.toLowerCase().includes(input.toLowerCase());
                                            }}
                                        >
                                            {classes.map(cls => (
                                                <Select.Option key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                                </div>
                                <Text className="text-gray-600 text-sm sm:text-base block mb-4">
                                    {classInfo.description}
                                </Text>
                                <Row gutter={[16, 16]} className="mt-4">
                                    <Col xs={24} sm={12}>
                                        <Card>
                                            <Statistic
                                                title="Tổng số sinh viên"
                                                value={classInfo.totalStudents}
                                                prefix={<TeamOutlined />}
                                                valueStyle={{ color: '#3f8600' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Card>
                                            <Statistic
                                                title="Tổng số bài kiểm tra"
                                                value={classInfo.totalTests}
                                                prefix={<FileTextOutlined />}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                            <div className="w-full lg:w-auto lg:ml-4">
                                <Button
                                    type="primary"
                                    icon={<FileAddOutlined />}
                                    size="large"
                                    onClick={handleCreateTest}
                                    className="bg-linear-to-r from-purple-600 to-purple-800 border-none w-full lg:w-auto"
                                >
                                    <span className="hidden sm:inline">Tạo bài kiểm tra mới</span>
                                    <span className="sm:hidden">Tạo bài kiểm tra</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <UserOutlined />
                                <span className="text-base sm:text-lg">Danh sách sinh viên</span>
                            </div>
                        }
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setAddStudentModalVisible(true)}
                                size="small"
                                className="w-full sm:w-auto"
                            >
                                <span className="hidden sm:inline">Thêm sinh viên</span>
                                <span className="sm:hidden">Thêm</span>
                            </Button>
                        }
                        className="mb-6 shadow-sm"
                        styles={{ body: { padding: '12px' } }}
                    >
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <Table
                                columns={studentColumns}
                                dataSource={students}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    responsive: true,
                                    simple: true,
                                }}
                                locale={{ emptyText: 'Chưa có sinh viên nào' }}
                                scroll={{ x: 600 }}
                                size="small"
                            />
                        </div>
                    </Card>

                    {/* Tests Table */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <BookOutlined />
                                <span className="text-base sm:text-lg">Danh sách bài kiểm tra</span>
                            </div>
                        }
                        className="shadow-sm"
                        styles={{ body: { padding: '12px' } }}
                    >
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <Table
                                columns={testColumns}
                                dataSource={tests}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    responsive: true,
                                    simple: true,
                                }}
                                onRow={(record) => ({
                                    onClick: () => handleTestClick(record.id),
                                    style: { cursor: 'pointer' },
                                })}
                                locale={{ emptyText: 'Chưa có bài kiểm tra nào' }}
                                scroll={{ x: 600 }}
                                size="small"
                            />
                        </div>
                    </Card>
                </>
            )}

            {/* Add Student Modal */}
            <Modal
                title="Thêm học sinh vào lớp"
                open={addStudentModalVisible}
                onCancel={() => {
                    setAddStudentModalVisible(false);
                    addStudentForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={addStudentForm}
                    layout="vertical"
                    onFinish={handleAddStudentSubmit}
                    initialValues={{ searchType: 'email' }}
                >
                    <Form.Item
                        name="searchType"
                        label="Tìm kiếm theo"
                        rules={[{ required: true, message: 'Vui lòng chọn loại tìm kiếm' }]}
                    >
                        <Select>
                            <Option value="email">Email</Option>
                            <Option value="studentId">Mã số sinh viên</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                            prevValues.searchType !== currentValues.searchType
                        }
                    >
                        {({ getFieldValue }) => {
                            const searchType = getFieldValue('searchType');
                            return (
                                <Form.Item
                                    name="searchValue"
                                    label={searchType === 'email' ? 'Email sinh viên' : 'Mã số sinh viên'}
                                    rules={[
                                        { required: true, message: `Vui lòng nhập ${searchType === 'email' ? 'email' : 'mã số sinh viên'}` },
                                        searchType === 'email'
                                            ? { type: 'email', message: 'Email không hợp lệ' }
                                            : {}
                                    ]}
                                >
                                    <Input
                                        placeholder={searchType === 'email' ? 'example@student.edu.vn' : 'SV123456'}
                                    />
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button
                                onClick={() => {
                                    setAddStudentModalVisible(false);
                                    addStudentForm.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<UserAddOutlined />}
                            >
                                Thêm sinh viên
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageClasses;
import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Spin, Empty, Alert, Modal, Form, Input, Select, message } from 'antd';
import { UserAddOutlined, ReloadOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
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
            render: (text: string) => <Text strong>{text}</Text>,
            sorter: (a, b) => (a.name || '').localeCompare(b.name || '')
        },
        {
            title: 'Mã lớp',
            dataIndex: 'classCode',
            key: 'classCode',
            render: (text: string) => <Tag color="purple">{text}</Tag>
        },
        {
            title: 'Học kỳ',
            dataIndex: 'semester',
            key: 'semester',
            sorter: (a, b) => (a.semester || '').localeCompare(b.semester || '')
        },
        {
            title: 'Năm học',
            dataIndex: 'year',
            key: 'year',
            align: 'center',
            sorter: (a, b) => (a.year || 0) - (b.year || 0)
        },
        {
            title: 'Số học sinh',
            dataIndex: 'studentCount',
            key: 'studentCount',
            align: 'center',
            render: (count?: number) => (
                <Space>
                    <TeamOutlined />
                    <Text>{count ?? 0}</Text>
                </Space>
            ),
            sorter: (a, b) => (a.studentCount || 0) - (b.studentCount || 0)
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewClass(record.id)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        icon={<UserAddOutlined />}
                        onClick={() => handleAddStudent(record.id)}
                    >
                        Thêm SV
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Quản lý lớp học
                    </Title>
                    <Text type="secondary">Danh sách các lớp học bạn đang giảng dạy</Text>
                </div>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/teacher/classes/create')}
                        size="large"
                    >
                        Tạo lớp học
                    </Button>
                    <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        onClick={fetchClasses}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            {loading && !classes.length ? (
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
                        description={
                            <Space direction="vertical" size="small">
                                <Text type="secondary">Bạn chưa có lớp học nào</Text>
                                <Text type="secondary" className="text-sm">
                                    Liên hệ với quản trị viên để được phân công lớp học
                                </Text>
                            </Space>
                        }
                    />
                </Card>
            ) : (
                <Card className="shadow-sm">
                    <Table
                        columns={columns}
                        dataSource={classes}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} lớp học`
                        }}
                    />
                </Card>
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
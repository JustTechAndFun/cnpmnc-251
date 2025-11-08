import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Space, Popconfirm, Tag, Spin, Empty, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, TeamOutlined, BookOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../../apis';
import type { ClassDto, CreateClassRequest, TeacherDto } from '../../apis/adminApi';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;
const { Option } = Select;

export const AdminClassList = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [teachers, setTeachers] = useState<TeacherDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classesResponse, teachersResponse] = await Promise.all([
                adminApi.getAllClasses(),
                adminApi.getAllTeachers()
            ]);

            if (!classesResponse.error && classesResponse.data) {
                setClasses(classesResponse.data);
            } else {
                message.error(classesResponse.message || 'Không thể tải danh sách lớp học');
            }

            if (!teachersResponse.error && teachersResponse.data) {
                setTeachers(teachersResponse.data.filter(t => t.activate));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            setErrorMessage('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            setErrorModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = () => {
        form.resetFields();
        setModalVisible(true);
    };

    const handleSubmitClass = async (values: CreateClassRequest) => {
        setSubmitting(true);
        try {
            const response = await adminApi.createClass(values);
            if (!response.error) {
                message.success('Tạo lớp học thành công!');
                setModalVisible(false);
                form.resetFields();
                fetchData();
            } else {
                message.error(response.message || 'Không thể tạo lớp học');
            }
        } catch (error) {
            console.error('Failed to create class', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClass = async (id: string, className: string) => {
        try {
            const response = await adminApi.deleteClass(id);
            if (!response.error) {
                message.success(`Đã xóa lớp "${className}" thành công!`);
                fetchData();
            } else {
                message.error(response.message || 'Không thể xóa lớp học');
            }
        } catch (error) {
            console.error('Failed to delete class', error);
            message.error('Không thể kết nối đến server');
        }
    };

    const columns: ColumnsType<ClassDto> = [
        {
            title: 'Mã lớp',
            dataIndex: 'classCode',
            key: 'classCode',
            width: 120,
            render: (code: string) => <Tag color="blue">{code}</Tag>
        },
        {
            title: 'Tên lớp',
            dataIndex: 'className',
            key: 'className',
            render: (name: string) => <Text strong>{name}</Text>
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacherName',
            key: 'teacherName',
            render: (name: string) => (
                <Space>
                    <TeamOutlined />
                    <Text>{name}</Text>
                </Space>
            )
        },
        {
            title: 'Học kỳ',
            dataIndex: 'semester',
            key: 'semester',
            width: 100,
            align: 'center'
        },
        {
            title: 'Năm học',
            dataIndex: 'year',
            key: 'year',
            width: 100,
            align: 'center'
        },
        {
            title: 'Số sinh viên',
            dataIndex: 'studentCount',
            key: 'studentCount',
            width: 120,
            align: 'center',
            render: (count: number) => (
                <Tag color="green" icon={<BookOutlined />}>
                    {count || 0}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title="Xóa lớp học"
                    description={`Bạn có chắc chắn muốn xóa lớp "${record.className}"?`}
                    onConfirm={() => handleDeleteClass(record.id, record.className)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger type="text" icon={<DeleteOutlined />}>
                        Xóa
                    </Button>
                </Popconfirm>
            )
        }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Quản lý Lớp học
                    </Title>
                    <Text type="secondary">Xem và quản lý tất cả lớp học trong hệ thống</Text>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchData}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateClass}
                        size="large"
                    >
                        Tạo lớp mới
                    </Button>
                </Space>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải dữ liệu...</Text>
                </div>
            ) : classes.length === 0 ? (
                <Card className="shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có lớp học nào trong hệ thống"
                    >
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClass}>
                            Tạo lớp học đầu tiên
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Card className="shadow-sm">
                    <Table
                        columns={columns}
                        dataSource={classes}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} lớp học`
                        }}
                    />
                </Card>
            )}

            {/* Create Class Modal */}
            <Modal
                title="Tạo lớp học mới"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitClass}
                    className="mt-4"
                >
                    <Form.Item
                        label="Tên lớp"
                        name="className"
                        rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
                    >
                        <Input placeholder="VD: Lập trình hướng đối tượng" />
                    </Form.Item>

                    <Form.Item
                        label="Mã lớp"
                        name="classCode"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã lớp' },
                            { pattern: /^\d{6}$/, message: 'Mã lớp phải gồm 6 chữ số' }
                        ]}
                    >
                        <Input placeholder="VD: 123456" maxLength={6} />
                    </Form.Item>

                    <Form.Item
                        label="Giáo viên"
                        name="teacherId"
                        rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
                    >
                        <Select placeholder="Chọn giáo viên">
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Học kỳ"
                        name="semester"
                        rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
                    >
                        <Select placeholder="Chọn học kỳ">
                            <Option value="1">Học kỳ 1</Option>
                            <Option value="2">Học kỳ 2</Option>
                            <Option value="3">Học kỳ hè</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Năm học"
                        name="year"
                        rules={[{ required: true, message: 'Vui lòng chọn năm học' }]}
                    >
                        <Select placeholder="Chọn năm học">
                            {years.map(year => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Tạo lớp học
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </div>
    );
};

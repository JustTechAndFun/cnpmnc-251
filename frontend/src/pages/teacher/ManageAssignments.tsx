import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Spin, Empty, Alert, Modal, Form, Input, Select, message, InputNumber } from 'antd';
import { FileTextOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { teacherApi } from '../../apis';
import type { ClassDto, TestDTO, AddTestRequestDTO } from '../../apis/teacherApi';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const ManageAssignments = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [tests, setTests] = useState<TestDTO[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [testsLoading, setTestsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addTestModalVisible, setAddTestModalVisible] = useState(false);
    const [addTestForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchTests(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await teacherApi.getMyClasses();
            if (!response.error && response.data) {
                setClasses(response.data);
                // Auto-select first class if available
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

    const fetchTests = async (classId: string) => {
        setTestsLoading(true);
        try {
            const response = await teacherApi.getTestsInClass(classId);
            if (!response.error && response.data) {
                setTests(response.data);
            } else {
                setTests([]);
                message.warning(response.message || 'Không thể tải danh sách bài kiểm tra');
            }
        } catch (error) {
            console.error('Failed to fetch tests', error);
            setTests([]);
        } finally {
            setTestsLoading(false);
        }
    };

    const handleClassChange = (classId: string) => {
        setSelectedClassId(classId);
    };

    const handleAddTest = () => {
        setAddTestModalVisible(true);
        addTestForm.resetFields();
    };

    const handleAddTestSubmit = async (values: AddTestRequestDTO) => {
        if (!selectedClassId) {
            message.error('Vui lòng chọn lớp học');
            return;
        }

        setSubmitting(true);
        try {
            const response = await teacherApi.addTestToClass(selectedClassId, values);

            if (!response.error) {
                message.success('Tạo bài kiểm tra thành công');
                setAddTestModalVisible(false);
                addTestForm.resetFields();
                // Refresh test list
                fetchTests(selectedClassId);
            } else {
                message.error(response.message || 'Không thể tạo bài kiểm tra');
            }
        } catch (error) {
            console.error('Failed to add test', error);
            message.error('Không thể tạo bài kiểm tra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewTest = (classId: string, testId: string) => {
        navigate(`/teacher/classes/${classId}/tests/${testId}`);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const columns: ColumnsType<TestDTO> = [
        {
            title: 'Tên bài kiểm tra',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
            width: '25%'
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text?: string) => text || <Text type="secondary">Không có mô tả</Text>
        },
        {
            title: 'Thời lượng',
            dataIndex: 'duration',
            key: 'duration',
            align: 'center',
            render: (duration: number) => <Tag color="blue">{duration} phút</Tag>
        },
        {
            title: 'Mã truy cập',
            dataIndex: 'passcode',
            key: 'passcode',
            align: 'center',
            render: (passcode?: string) => 
                passcode ? <Tag color="green">{passcode}</Tag> : <Text type="secondary">Không có</Text>
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTest(record.classId, record.id)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => message.info('Tính năng đang được phát triển')}
                    >
                        Sửa
                    </Button>
                </Space>
            )
        }
    ];

    const selectedClass = classes.find(c => c.id === selectedClassId);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Quản lý bài kiểm tra
                    </Title>
                    <Text type="secondary">Tạo và quản lý các bài kiểm tra cho lớp học</Text>
                </div>
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => selectedClassId && fetchTests(selectedClassId)}
                    loading={testsLoading}
                    disabled={!selectedClassId}
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
                    <Space direction="vertical" size="large" className="w-full">
                        {/* Class Selection and Add Test Button */}
                        <div className="flex justify-between items-center">
                            <Space>
                                <Text strong>Chọn lớp học:</Text>
                                <Select
                                    value={selectedClassId}
                                    onChange={handleClassChange}
                                    style={{ width: 300 }}
                                    placeholder="Chọn lớp học"
                                >
                                    {classes.map(cls => (
                                        <Option key={cls.id} value={cls.id}>
                                            {cls.className} ({cls.classCode})
                                        </Option>
                                    ))}
                                </Select>
                                {selectedClass && (
                                    <Tag color="purple">
                                        {selectedClass.semester} - {selectedClass.year}
                                    </Tag>
                                )}
                            </Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddTest}
                                disabled={!selectedClassId}
                            >
                                Tạo bài kiểm tra
                            </Button>
                        </div>

                        {/* Tests Table */}
                        {testsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Spin size="large" />
                                <Text className="mt-4 text-gray-600">Đang tải danh sách bài kiểm tra...</Text>
                            </div>
                        ) : tests.length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<Text type="secondary">Chưa có bài kiểm tra nào cho lớp này</Text>}
                            />
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={tests}
                                rowKey="id"
                                loading={testsLoading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Tổng số ${total} bài kiểm tra`
                                }}
                            />
                        )}
                    </Space>
                </Card>
            )}

            {/* Add Test Modal */}
            <Modal
                title="Tạo bài kiểm tra mới"
                open={addTestModalVisible}
                onCancel={() => {
                    setAddTestModalVisible(false);
                    addTestForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={addTestForm}
                    layout="vertical"
                    onFinish={handleAddTestSubmit}
                    initialValues={{ duration: 60 }}
                >
                    <Form.Item
                        name="name"
                        label="Tên bài kiểm tra"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên bài kiểm tra' },
                            { min: 3, message: 'Tên bài kiểm tra phải có ít nhất 3 ký tự' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: Kiểm tra giữa kỳ - Chương 1" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả nội dung, yêu cầu của bài kiểm tra..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Thời lượng (phút)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập thời lượng' },
                            { type: 'number', min: 1, message: 'Thời lượng phải lớn hơn 0' }
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={300}
                            style={{ width: '100%' }}
                            placeholder="60"
                        />
                    </Form.Item>

                    <Form.Item
                        name="passcode"
                        label="Mã truy cập (không bắt buộc)"
                        extra="Sinh viên cần mã này để tham gia bài kiểm tra"
                    >
                        <Input
                            placeholder="Ví dụ: ABC123"
                            maxLength={10}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button
                                onClick={() => {
                                    setAddTestModalVisible(false);
                                    addTestForm.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<PlusOutlined />}
                            >
                                Tạo bài kiểm tra
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


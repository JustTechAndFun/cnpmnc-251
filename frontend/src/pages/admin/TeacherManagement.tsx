import { useEffect, useState, useRef } from 'react';
import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Typography,
    Space,
    Tag,
    Avatar,
    Spin,
    Empty
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { Role } from '../../types';
import type { User } from '../../types';
import { adminApi } from '../../apis';
import { ErrorModal } from '../../components/ErrorModal';
import { SuccessModal } from '../../components/SuccessModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

export const TeacherManagement = () => {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchMail, setSearchMail] = useState('');
    const [filterActivate, setFilterActivate] = useState<boolean | null>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [form] = Form.useForm();
    const debounceTimer = useRef<number | null>(null);

    useEffect(() => {
        fetchTeachers('', null);
    }, []);

    useEffect(() => {
        // Debounce the API call
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchTeachers(searchMail, filterActivate);
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchMail, filterActivate]);

    const fetchTeachers = async (mail: string, activate: boolean | null) => {
        setLoading(true);
        try {
            const response = await adminApi.getAllTeachers(
                mail && mail.trim() ? mail.trim() : undefined,
                activate !== null ? activate : undefined
            );

            if (!response.error && response.data) {
                const mappedTeachers: User[] = response.data.map(teacher => ({
                    id: teacher.id,
                    email: teacher.email,
                    name: teacher.name,
                    picture: teacher.picture,
                    role: Role.TEACHER,
                    activate: teacher.activate
                }));
                setTeachers(mappedTeachers);
            } else {
                setErrorMessage(response.message || 'Không thể tải danh sách giáo viên');
                setErrorModalVisible(true);
                setTeachers([]);
            }
        } catch (error) {
            console.error('Failed to fetch teachers', error);
            setErrorMessage('Không thể tải danh sách giáo viên. Vui lòng thử lại sau.');
            setErrorModalVisible(true);
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async (values: {
        name: string;
        email: string;
        password: string;
        department?: string;
        activate?: boolean;
    }) => {
        try {
            const response = await adminApi.createTeacherAccount({
                name: values.name,
                email: values.email,
                department: values.department,
                activate: values.activate ?? true
            });

            if (!response.error && response.data) {
                setAddModalVisible(false);
                form.resetFields();
                setSuccessMessage('Thêm giáo viên thành công');
                setSuccessModalVisible(true);
                fetchTeachers(searchMail, filterActivate); // Refresh the list
            } else {
                setAddModalVisible(false);
                setErrorMessage(response.message || 'Không thể thêm giáo viên');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to create teacher', error);
            setAddModalVisible(false);
            setErrorMessage('Không thể thêm giáo viên. Vui lòng thử lại.');
            setErrorModalVisible(true);
        }
    };

    const handleDeleteClick = (teacher: User) => {
        setTeacherToDelete(teacher);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!teacherToDelete) return;

        try {
            const response = await adminApi.deleteTeacher(teacherToDelete.id);

            if (!response.error) {
                setDeleteModalVisible(false);
                setTeacherToDelete(null);
                setSuccessMessage('Xóa giáo viên thành công');
                setSuccessModalVisible(true);
                fetchTeachers(searchMail, filterActivate); // Refresh the list
            } else {
                setDeleteModalVisible(false);
                setErrorMessage(response.message || 'Không thể xóa giáo viên');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to delete teacher', error);
            setDeleteModalVisible(false);
            setErrorMessage('Không thể xóa giáo viên. Vui lòng thử lại.');
            setErrorModalVisible(true);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setTeacherToDelete(null);
    };

    const columns = [
        {
            title: 'Giáo viên',
            key: 'teacher',
            render: (_: unknown, record: User) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.picture} />
                    <div>
                        <Text strong>{record.name || 'N/A'}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">{record.email}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Trạng thái',
            key: 'activate',
            render: (_: unknown, record: User) => (
                <Tag color={record.activate ? 'success' : 'default'}>
                    {record.activate ? 'Kích hoạt' : 'Chưa kích hoạt'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: unknown, record: User) => (
                <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteClick(record)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Title level={2} className="mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Quản lý Giáo viên
                    </Title>
                    <Text type="secondary">Quản lý tài khoản giáo viên trong hệ thống</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setAddModalVisible(true)}
                >
                    Thêm Giáo viên
                </Button>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6 shadow-sm">
                <Space direction="vertical" size="middle" className="w-full">
                    <Space wrap className="w-full">
                        <Search
                            placeholder="Tìm kiếm theo email"
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchMail}
                            onChange={(e) => setSearchMail(e.target.value)}
                            className="flex-1 min-w-[200px]"
                        />
                        <Select
                            placeholder="Lọc theo trạng thái"
                            allowClear
                            size="large"
                            style={{ width: 200 }}
                            value={filterActivate}
                            onChange={(value) => setFilterActivate(value)}
                        >
                            <Option value={true}>Kích hoạt</Option>
                            <Option value={false}>Chưa kích hoạt</Option>
                        </Select>
                    </Space>
                </Space>
            </Card>

            <Card className="shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spin size="large" />
                    </div>
                ) : teachers.length === 0 ? (
                    <Empty description="Chưa có giáo viên nào" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={teachers}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} giáo viên`,
                        }}
                    />
                )}
            </Card>

            {/* Add Teacher Modal */}
            <Modal
                title="Thêm Giáo viên"
                open={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddTeacher}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên' },
                            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên giáo viên" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập email giáo viên" />
                    </Form.Item>

                    <Form.Item
                        label="Khoa/Bộ môn"
                        name="department"
                    >
                        <Input placeholder="Nhập khoa/bộ môn (tùy chọn)" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="activate"
                        initialValue={true}
                    >
                        <Select>
                            <Option value={true}>Kích hoạt</Option>
                            <Option value={false}>Chưa kích hoạt</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Thêm
                            </Button>
                            <Button onClick={() => {
                                setAddModalVisible(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Xóa giáo viên"
                open={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Space direction="vertical" size="middle" className="w-full">
                    <Text>
                        Bạn có chắc chắn muốn xóa giáo viên này?
                    </Text>
                    {teacherToDelete && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <Text strong className="block mb-1">
                                {teacherToDelete.name || 'N/A'}
                            </Text>
                            <Text type="secondary" className="text-sm">
                                {teacherToDelete.email}
                            </Text>
                        </div>
                    )}
                    <Text type="danger" className="text-sm">
                        Hành động này không thể hoàn tác.
                    </Text>
                </Space>
            </Modal>

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />

            {/* Success Modal */}
            <SuccessModal
                open={successModalVisible}
                message={successMessage}
                onClose={() => setSuccessModalVisible(false)}
            />
        </div>
    );
};


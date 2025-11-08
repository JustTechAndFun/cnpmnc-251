import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { Navigate } from 'react-router';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Button,
    Typography,
    message,
    DatePicker,
    Space,
    Row,
    Col,
    Divider
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    CalendarOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CreateTest = () => {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();
    const auth = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Only TEACHER role can access
    if (!auth || !auth.user || auth.user.role !== Role.TEACHER) {
        return <Navigate to="/unauthorized" replace />;
    }

    const handleSubmit = (values: {
        title: string;
        description?: string;
        duration: number;
        openTime?: any;
        closeTime?: any;
    }) => {
        if (!classId) {
            message.error('Không tìm thấy lớp học');
            return;
        }

        setLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            console.log('Form values:', {
                title: values.title,
                description: values.description,
                duration: values.duration,
                openTime: values.openTime ? values.openTime.toISOString() : undefined,
                closeTime: values.closeTime ? values.closeTime.toISOString() : undefined,
                classId: classId
            });
            
            message.success('Tạo bài kiểm tra thành công! (Demo)');
            setLoading(false);
            // Navigate back to class page
            navigate(`/teacher/classes/${classId}`);
        }, 1000);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/teacher/classes/${classId || ''}`)}
                    className="mb-4"
                    size="large"
                >
                    Quay lại
                </Button>
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    <Title level={2} className="mb-2" style={{ margin: 0 }}>
                        Tạo bài kiểm tra mới
                    </Title>
                </div>
                {classId && (
                    <Text className="text-gray-600 text-base">
                        Lớp học: <Text strong className="text-purple-600">Lớp học {classId}</Text>
                    </Text>
                )}
            </div>

            {/* Main Form Card */}
            <Card className="shadow-lg border-0">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        duration: 60
                    }}
                    size="large"
                >
                    {/* Test Title */}
                    <Form.Item
                        name="title"
                        label={
                            <Space>
                                <FileTextOutlined className="text-purple-600" />
                                <span className="font-semibold">Tên bài kiểm tra</span>
                            </Space>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên bài kiểm tra' },
                            { max: 100, message: 'Tên bài kiểm tra không được vượt quá 100 ký tự' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: Kiểm tra giữa kỳ - Lập trình Web"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    {/* Description */}
                    <Form.Item
                        name="description"
                        label={
                            <Space>
                                <InfoCircleOutlined className="text-purple-600" />
                                <span className="font-semibold">Mô tả</span>
                            </Space>
                        }
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả về bài kiểm tra (tùy chọn)"
                            showCount
                            maxLength={500}
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Divider />

                    {/* Duration */}
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="duration"
                                label={
                                    <Space>
                                        <ClockCircleOutlined className="text-purple-600" />
                                        <span className="font-semibold">Thời gian làm bài</span>
                                    </Space>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập thời gian làm bài' },
                                    { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0 phút' }
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={600}
                                    placeholder="60"
                                    style={{ width: '100%' }}
                                    addonAfter="phút"
                                    className="rounded-lg"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Time Settings */}
                    <div className="mb-4">
                        <Title level={4} className="mb-4">
                            <CalendarOutlined className="text-purple-600 mr-2" />
                            Thời gian kiểm tra (Tùy chọn)
                        </Title>
                        <Text type="secondary" className="text-sm">
                            Nếu không thiết lập, bài kiểm tra sẽ có thể truy cập ngay sau khi tạo
                        </Text>
                    </div>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="openTime"
                                label={
                                    <Space>
                                        <span className="font-semibold">Thời gian bắt đầu</span>
                                    </Space>
                                }
                                tooltip="Thời điểm học sinh có thể bắt đầu làm bài kiểm tra"
                            >
                                <DatePicker
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    placeholder="Chọn thời gian bắt đầu"
                                    style={{ width: '100%' }}
                                    className="rounded-lg"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="closeTime"
                                label={
                                    <Space>
                                        <span className="font-semibold">Thời gian kết thúc</span>
                                    </Space>
                                }
                                tooltip="Thời điểm học sinh không thể bắt đầu làm bài kiểm tra nữa"
                                dependencies={['openTime']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const openTime = getFieldValue('openTime');
                                            if (!value || !openTime) {
                                                return Promise.resolve();
                                            }
                                            if (dayjs(value).isBefore(dayjs(openTime))) {
                                                return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
                                            }
                                            return Promise.resolve();
                                        }
                                    })
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    placeholder="Chọn thời gian kết thúc"
                                    style={{ width: '100%' }}
                                    className="rounded-lg"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Action Buttons */}
                    <Form.Item className="mt-6 mb-0">
                        <Space size="large">
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                size="large"
                                loading={loading}
                                className="bg-gradient-to-r from-purple-600 to-purple-800 border-none hover:from-purple-700 hover:to-purple-900 rounded-lg px-8"
                            >
                                Tạo bài kiểm tra
                            </Button>
                            <Button
                                size="large"
                                onClick={() => navigate(`/teacher/classes/${classId || ''}`)}
                                disabled={loading}
                                className="rounded-lg"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
                <Space direction="vertical" size="small" className="w-full">
                    <div className="flex items-start gap-2">
                        <InfoCircleOutlined className="text-blue-600 mt-1" />
                        <div>
                            <Text strong className="text-blue-800 block mb-1">
                                Lưu ý quan trọng:
                            </Text>
                            <Text className="text-blue-700 text-sm block">
                                • Sau khi tạo bài kiểm tra, bạn có thể thêm câu hỏi vào bài kiểm tra từ trang chi tiết bài kiểm tra.
                            </Text>
                            <Text className="text-blue-700 text-sm block mt-1">
                                • Mã truy cập (passcode) sẽ được tự động tạo và hiển thị sau khi tạo bài kiểm tra thành công.
                            </Text>
                            <Text className="text-blue-700 text-sm block mt-1">
                                • Bài kiểm tra sẽ ở trạng thái DRAFT cho đến khi bạn sẵn sàng công bố.
                            </Text>
                        </div>
                    </div>
                </Space>
            </Card>
        </div>
    );
};


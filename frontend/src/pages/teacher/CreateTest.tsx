import { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, message, Select, InputNumber } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { teacherApi } from '../../apis';
import type { ClassDto } from '../../apis/teacherApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateTestRequest {
    name: string;
    description?: string;
    duration: number;
    passcode?: string;
    classId: string;
}

export const CreateTest = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoadingClasses(true);
        try {
            const response = await teacherApi.getMyClasses();
            if (!response.error && response.data) {
                setClasses(response.data);
            } else {
                message.error('Không thể tải danh sách lớp học');
            }
        } catch (error) {
            console.error('Failed to fetch classes', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleSubmit = async (values: CreateTestRequest) => {
        setLoading(true);
        try {
            const { classId, ...testData } = values;
            const response = await teacherApi.addTestToClass(classId, testData);

            if (!response.error) {
                message.success('Tạo bài kiểm tra thành công!');
                form.resetFields();
                // Navigate to test management after 1 second
                setTimeout(() => {
                    navigate('/teacher/tests');
                }, 1000);
            } else {
                message.error(response.message || 'Không thể tạo bài kiểm tra');
            }
        } catch (error) {
            console.error('Failed to create test', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const generatePasscode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let passcode = '';
        for (let i = 0; i < 6; i++) {
            passcode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        form.setFieldsValue({ passcode });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    <FileTextOutlined className="mr-2" />
                    Tạo bài kiểm tra mới
                </Title>
                <Text type="secondary">Điền thông tin để tạo bài kiểm tra mới cho lớp học</Text>
            </div>

            <Card className="shadow-lg">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        duration: 60
                    }}
                >
                    <Form.Item
                        label="Lớp học"
                        name="classId"
                        rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
                    >
                        <Select
                            size="large"
                            placeholder="Chọn lớp học"
                            loading={loadingClasses}
                            disabled={loadingClasses || classes.length === 0}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={classes.map(cls => ({
                                value: cls.id,
                                label: `${cls.name || cls.className} - ${cls.classCode}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tên bài kiểm tra"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên bài kiểm tra' },
                            { min: 5, message: 'Tên bài kiểm tra phải có ít nhất 5 ký tự' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: Kiểm tra giữa kỳ - Chương 1-3"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả nội dung, yêu cầu của bài kiểm tra"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian làm bài (phút)"
                        name="duration"
                        rules={[
                            { required: true, message: 'Vui lòng nhập thời gian làm bài' },
                            { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' }
                        ]}
                    >
                        <InputNumber
                            size="large"
                            min={1}
                            max={300}
                            placeholder="60"
                            className="w-full"
                            addonAfter="phút"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mã truy cập"
                        name="passcode"
                    >
                        <div className="flex gap-2">
                            <Input
                                placeholder="Mã truy cập (tùy chọn)"
                                size="large"
                                style={{ textTransform: 'uppercase' }}
                                onChange={(e) => {
                                    form.setFieldsValue({ passcode: e.target.value.toUpperCase() });
                                }}
                            />
                            <Button
                                size="large"
                                onClick={generatePasscode}
                                type="dashed"
                            >
                                Tạo ngẫu nhiên
                            </Button>
                        </div>
                        <Text type="secondary" className="text-xs">
                            Sinh viên sẽ cần mã này để truy cập bài kiểm tra
                        </Text>
                    </Form.Item>

                    <Form.Item className="mb-0 mt-6">
                        <div className="flex gap-3 justify-end">
                            <Button
                                size="large"
                                onClick={() => navigate('/teacher/tests')}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                icon={<PlusOutlined />}
                                disabled={classes.length === 0}
                            >
                                Tạo bài kiểm tra
                            </Button>
                        </div>
                    </Form.Item>
                </Form>

                {classes.length === 0 && !loadingClasses && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <Text type="warning">
                            Bạn chưa có lớp học nào. Vui lòng tạo lớp học trước khi tạo bài kiểm tra.
                        </Text>
                    </div>
                )}
            </Card>
        </div>
    );
};

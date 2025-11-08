import { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Select } from 'antd';
import { PlusOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import apiClient from '../../apis/axiosConfig';
import type { ApiResponse } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

interface CreateClassRequest {
    className: string;
    classCode: string;
    semester: string;
    year: number;
}

export const CreateClass = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const handleSubmit = async (values: CreateClassRequest) => {
        setLoading(true);
        try {
            const response = await apiClient.post<ApiResponse<any>>(
                '/api/classes',
                values
            );

            if (!response.data.error) {
                message.success('Tạo lớp học thành công!');
                form.resetFields();
                // Navigate to classes list after 1 second
                setTimeout(() => {
                    navigate('/teacher/classes');
                }, 1000);
            } else {
                message.error(response.data.message || 'Không thể tạo lớp học');
            }
        } catch (error) {
            console.error('Failed to create class', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    <BookOutlined className="mr-2" />
                    Tạo lớp học mới
                </Title>
                <Text type="secondary">Điền thông tin để tạo lớp học mới</Text>
            </div>

            <Card className="shadow-lg">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        year: currentYear,
                        semester: 'HK1'
                    }}
                >
                    <Form.Item
                        label="Tên lớp học"
                        name="className"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên lớp học' },
                            { min: 3, message: 'Tên lớp học phải có ít nhất 3 ký tự' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: Công nghệ phần mềm nâng cao"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mã lớp học"
                        name="classCode"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã lớp học' },
                            { pattern: /^[A-Z0-9_-]+$/, message: 'Mã lớp học chỉ chứa chữ in hoa, số, gạch dưới và gạch ngang' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: CSE301_L01"
                            size="large"
                            style={{ textTransform: 'uppercase' }}
                            onChange={(e) => {
                                form.setFieldsValue({ classCode: e.target.value.toUpperCase() });
                            }}
                        />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Học kỳ"
                            name="semester"
                            rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
                        >
                            <Select size="large" placeholder="Chọn học kỳ">
                                <Option value="HK1">Học kỳ 1</Option>
                                <Option value="HK2">Học kỳ 2</Option>
                                <Option value="HK3">Học kỳ 3 (Hè)</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Năm học"
                            name="year"
                            rules={[{ required: true, message: 'Vui lòng chọn năm học' }]}
                        >
                            <Select size="large" placeholder="Chọn năm học">
                                {years.map(year => (
                                    <Option key={year} value={year}>
                                        {year} - {year + 1}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item className="mb-0 mt-6">
                        <div className="flex gap-3 justify-end">
                            <Button
                                size="large"
                                onClick={() => navigate('/teacher/classes')}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                icon={<PlusOutlined />}
                            >
                                Tạo lớp học
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateClass;

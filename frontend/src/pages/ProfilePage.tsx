import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Typography, Alert, Button, Space, Modal, Form, Input } from 'antd';
import { MailOutlined, BankOutlined, UserOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import type { Profile } from '../types';
import { profileApi } from '../apis';
import { ErrorModal } from '../components/ErrorModal';
import { SuccessModal } from '../components/SuccessModal';

const { Title, Text } = Typography;

export const ProfilePage = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await profileApi.getProfile();

            if (!response.error && response.data) {
                setProfile(response.data);
                setError(null);
            } else {
                const errorMsg = response.message || 'Không thể tải thông tin profile';
                setError(errorMsg);
                setErrorMessage(errorMsg);
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            const errorMsg = 'Không thể tải thông tin profile. Vui lòng thử lại sau.';
            setError(errorMsg);
            setErrorMessage(errorMsg);
            setErrorModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        form.setFieldsValue({
            studentId: profile?.studentId || ''
        });
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async (values: { studentId: string }) => {
        setSubmitting(true);
        try {
            const response = await profileApi.updateProfile(values);

            if (!response.error && response.data) {
                setSuccessMessage('Cập nhật profile thành công');
                setSuccessModalVisible(true);
                setProfile(response.data);
                setEditModalVisible(false);
                form.resetFields();
            } else {
                setErrorMessage(response.message || 'Không thể cập nhật profile');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to update profile', error);
            setErrorMessage('Không thể cập nhật profile');
            setErrorModalVisible(true);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa cập nhật';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">Thông tin cá nhân</Title>
                    <Text type="secondary">Xem và xác nhận thông tin tài khoản của bạn</Text>
                </div>
                {!loading && !error && profile && (
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditProfile}
                    >
                        Chỉnh sửa
                    </Button>
                )}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải thông tin...</Text>
                </div>
            )}

            {!loading && error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    icon={<ReloadOutlined />}
                    action={
                        <Button size="small" onClick={fetchProfile} icon={<ReloadOutlined />}>
                            Thử lại
                        </Button>
                    }
                    className="mb-6"
                />
            )}

            {!loading && !error && profile && (
                <Space direction="vertical" size="large" className="w-full">
                    {/* Email Card */}
                    <Card
                        title={
                            <Space>
                                <MailOutlined className="text-blue-500" />
                                <span>Email</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Text className="text-base">{profile.email}</Text>
                    </Card>

                    {/* School Card */}
                    <Card
                        title={
                            <Space>
                                <BankOutlined className="text-green-500" />
                                <span>Trường học</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Text className="text-base">{profile.school || 'Chưa cập nhật'}</Text>
                    </Card>

                    {/* Personal Information Card */}
                    <Card
                        title={
                            <Space>
                                <UserOutlined className="text-purple-500" />
                                <span>Thông tin cá nhân</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
                            <Descriptions.Item label="Mã số sinh viên" span={2}>
                                {profile.studentId || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Họ và tên" span={2}>
                                {profile.information?.name || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {profile.information?.gender || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {profile.information?.phone || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {formatDate(profile.information?.dob)}
                            </Descriptions.Item>
                            {profile.information?.address && (
                                <Descriptions.Item label="Địa chỉ" span={2}>
                                    {profile.information.address}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </Space>
            )}

            {/* Edit Profile Modal */}
            <Modal
                title="Chỉnh sửa profile"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                >
                    <Form.Item
                        name="studentId"
                        label="Mã số sinh viên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã số sinh viên' },
                            { pattern: /^[A-Z0-9]{6,10}$/, message: 'Mã số sinh viên phải từ 6-10 ký tự chữ in hoa và số' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: SV123456" maxLength={10} />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button
                                onClick={() => {
                                    setEditModalVisible(false);
                                    form.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<EditOutlined />}
                            >
                                Cập nhật
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
            {/* Success Modal */}
            <SuccessModal
                open={successModalVisible}
                message={successMessage}
                onClose={() => setSuccessModalVisible(false)}
            />
        </div>
    );
};

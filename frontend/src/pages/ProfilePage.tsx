import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Typography, Alert, Button, Space } from 'antd';
import { MailOutlined, BankOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Profile } from '../types';
import { profileApi } from '../apis';
import { ErrorModal } from '../components/ErrorModal';

const { Title, Text } = Typography;

export const ProfilePage = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
            <div className="mb-8">
                <Title level={2} className="mb-2">Thông tin cá nhân</Title>
                <Text type="secondary">Xem và xác nhận thông tin tài khoản của bạn</Text>
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
                        <Text className="text-base">{profile.school}</Text>
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
                            <Descriptions.Item label="Họ và tên" span={2}>
                                {profile.information.name || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {profile.information.gender || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {profile.information.phone || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {formatDate(profile.information.dob)}
                            </Descriptions.Item>
                            {profile.information.address && (
                                <Descriptions.Item label="Địa chỉ" span={2}>
                                    {profile.information.address}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </Space>
            )}

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </div>
    );
};

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Descriptions, Spin, Typography, Alert, Button, Space } from 'antd';
import { MailOutlined, BankOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import type { ApiResponse, Profile } from '../types';

const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ProfilePage = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get<ApiResponse<Profile>>(
                `${API_BASE_URL}/user/profile`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );

            if (!response.data.error && response.data.data) {
                setProfile(response.data.data);
            } else {
                setError(response.data.message || 'Không thể tải thông tin profile');
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            // Mock data for demo
            setProfile({
                email: 'admin@test.com',
                school: 'Trường Đại học BK',
                information: {
                    name: 'Nguyễn Văn Admin',
                    gender: 'Nam',
                    phone: '0123456789',
                    dob: '1990-01-15',
                    address: '123 Đường ABC, Quận 1, TP.HCM'
                }
            });
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
        </div>
    );
};

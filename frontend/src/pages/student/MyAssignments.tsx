import React, { useCallback, useState } from 'react';
import { Card, Typography, Modal, Input, message, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const MyAssignments: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // error message shown inside modal

    const openJoinModal = useCallback(() => {
        setCode('');
        setError('');
        setIsModalOpen(true);
    }, []);

    const handleJoin = useCallback(async () => {
        const trimmed = code?.trim();
        // validation: exactly 6 digits
        if (!/^\d{6}$/.test(trimmed || '')) {
            setError('Mã phải gồm 6 ký tự số');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/exams/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: trimmed }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const errMsg = (data && (data.message || data.error)) || `Lỗi: ${res.status}`;
                setError(errMsg);
                message.error(errMsg);
                return;
            }

            message.success(data?.message || 'Bạn đã tham gia bài kiểm tra thành công');
            setIsModalOpen(false);
            setError('');
        } catch (err) {
            const networkErr = 'Không thể kết nối tới server';
            setError(networkErr);
            message.error(networkErr);
        } finally {
            setLoading(false);
        }
    }, [code]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    Bài tập của tôi
                </Title>
            </div>

            <div className="mb-6 flex items-center justify-end">
                <div>
                    <button
                        type="button"
                        onClick={openJoinModal}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
                        aria-label="Tham gia bài kiểm tra"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.707-9.707a1 1 0 00-1.414-1.414L8 9.586V7a1 1 0 10-2 0v6a1 1 0 102 0v-2.586l2.293 2.293a1 1 0 001.414-1.414L9.414 10l2.293-2.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Tham gia bài kiểm tra</span>
                    </button>
                </div>
            </div>

            <Card className="shadow-sm">
                <div className="text-center py-12">
                    <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
                    <Title level={4} type="secondary">Tính năng đang được phát triển</Title>
                    <p className="text-gray-500">Trang bài tập sẽ sớm có mặt</p>
                </div>
            </Card>

            <Modal
                title="Nhập mã bài kiểm tra"
                open={isModalOpen}
                onOk={handleJoin}
                okText="Tham gia"
                confirmLoading={loading}
                onCancel={() => { setIsModalOpen(false); setError(''); }}
                okButtonProps={{ 'aria-label': 'Xác nhận tham gia' }}
                cancelButtonProps={{ 'aria-label': 'Hủy' }}
            >
                {error ? <Alert type="error" message={error} className="mb-4" /> : null}
                <Input
                    value={code}
                    onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
                    placeholder="Nhập mã bài kiểm tra"
                    onPressEnter={handleJoin}
                    aria-label="Mã bài kiểm tra"
                    disabled={loading}
                />
            </Modal>
        </div>
    );
};

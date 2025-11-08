import React, { useCallback, useState } from 'react';
import { Card, Typography, Modal, Input, message, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const MyAssignments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const openJoinModal = useCallback(() => {
    setCode('');
    setError('');
    setIsModalOpen(true);
  }, []);

  const handleJoin = useCallback(async () => {
    const trimmed = code?.trim();
    if (!/^\d{6}$/.test(trimmed)) {
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
        const errMsg = data?.message || data?.error || `Lỗi: ${res.status}`;
        setError(errMsg);
        message.error(errMsg);
        return;
      }

      message.success(data?.message || 'Tham gia thành công');
      setIsModalOpen(false);
      navigate(`/student/exams/${trimmed}`);
    } catch {
      const errMsg = 'Không thể kết nối tới server';
      setError(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [code, navigate]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Title level={2} className="mb-2 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Bài tập của tôi
        </Title>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={openJoinModal}
          className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-4 py-2 rounded-lg shadow-md"
        >
          Tham gia bài kiểm tra
        </button>
      </div>

      <Card className="shadow-sm text-center py-12">
        <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
        <Title level={4} type="secondary">Tính năng đang được phát triển</Title>
        <p className="text-gray-500">Trang bài tập sẽ sớm có mặt</p>
      </Card>

      <Modal
        title="Nhập mã bài kiểm tra"
        open={isModalOpen}
        onOk={handleJoin}
        okText="Tham gia"
        confirmLoading={loading}
        onCancel={() => { setIsModalOpen(false); setError(''); }}
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        <Input
          value={code}
          onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
          placeholder="Nhập mã bài kiểm tra"
          onPressEnter={handleJoin}
          disabled={loading}
        />
      </Modal>
    </div>
  );
};

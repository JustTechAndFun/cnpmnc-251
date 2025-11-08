import React, { useCallback, useState } from 'react';
import { Typography, Modal, Input, message, Alert } from 'antd';
import { useNavigate } from 'react-router';

const { Title } = Typography;

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
    if (!trimmed) {
      setError('Vui lòng nhập mã bài kiểm tra');
      return;
    }

    setError('');
    setLoading(true);

    // Navigate to exam page - will validate passcode there
    message.success('Đang chuyển đến bài kiểm tra...');
    setIsModalOpen(false);
    navigate(`/student/exams/${trimmed}`);
    setLoading(false);
  }, [code, navigate]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div>
        <Title level={2} className="mb-2 bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Bài tập của tôi
        </Title>
      </div>

      <div className="mb-6 flex items-center justify-end">
        <div>
          <button
            type="button"
            onClick={openJoinModal}
            className="inline-flex items-center gap-2 bg-linear-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Tham gia bài kiểm tra"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.707-9.707a1 1 0 00-1.414-1.414L8 9.586V7a1 1 0 10-2 0v6a1 1 0 102 0v-2.586l2.293 2.293a1 1 0 001.414-1.414L9.414 10l2.293-2.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Tham gia bài kiểm tra</span>
          </button>
        </div>
      </div>

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

import { Modal, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SuccessModalProps {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
}

export const SuccessModal = ({ open, title = 'Thành công', message, onClose }: SuccessModalProps) => {
    return (
        <Modal
            title={
                <span>
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    {title}
                </span>
            }
            open={open}
            onOk={onClose}
            onCancel={onClose}
            okText="Đóng"
            cancelButtonProps={{ style: { display: 'none' } }}
            width={500}
        >
            <Text>{message}</Text>
        </Modal>
    );
};


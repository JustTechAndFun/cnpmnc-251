import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ErrorModalProps {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
}

export const ErrorModal = ({ open, title = 'Lỗi', message, onClose }: ErrorModalProps) => {
    return (
        <Modal
            title={
                <span>
                    <ExclamationCircleOutlined className="text-red-500 mr-2" />
                    {title}
                </span>
            }
            open={open}
            onOk={onClose}
            onCancel={onClose}
            okText="Đóng"
            cancelButtonProps={{ style: { display: 'none' } }}
            width={500}
            zIndex={10000}
            styles={{ mask: { zIndex: 9999 } }}
        >
            <Text>{message}</Text>
        </Modal>
    );
};


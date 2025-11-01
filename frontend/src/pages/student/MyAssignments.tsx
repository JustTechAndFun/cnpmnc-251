import { Card, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { StudentLayout } from '../../components/StudentLayout';

const { Title } = Typography;

export const MyAssignments = () => {
    return (
        <StudentLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <Title level={2} className="mb-2 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        Bài tập của tôi
                    </Title>
                </div>

                <Card className="shadow-sm">
                    <div className="text-center py-12">
                        <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
                        <Title level={4} type="secondary">Tính năng đang được phát triển</Title>
                        <p className="text-gray-500">Trang bài tập sẽ sớm có mặt</p>
                    </div>
                </Card>
            </div>
        </StudentLayout>
    );
};


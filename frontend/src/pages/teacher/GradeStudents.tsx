import { Card, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const GradeStudents = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Title level={2} className="mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Chấm điểm
                </Title>
            </div>

            <Card className="shadow-sm">
                <div className="text-center py-12">
                    <LineChartOutlined className="text-5xl text-gray-300 mb-4" />
                    <Title level={4} type="secondary">Tính năng đang được phát triển</Title>
                    <p className="text-gray-500">Trang chấm điểm sẽ sớm có mặt</p>
                </div>
            </Card>
        </div>
    );
};


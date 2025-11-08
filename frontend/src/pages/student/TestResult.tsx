import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    Card,
    Typography,
    Spin,
    Result,
    Button,
    Space,
    Tag,
    Divider,
    Statistic,
    Row,
    Col,
    Alert
} from 'antd';
import {
    ArrowLeftOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { studentApi } from '../../apis';

const { Title, Text } = Typography;

interface QuestionResult {
    id: string;
    questionText: string;
    selectedAnswer: string | null;
    correctAnswer: string;
}

interface TestResultData {
    totalScore: number;
    correctCount: number;
    wrongCount: number;
    questions: QuestionResult[];
}

export const TestResult = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (submissionId) {
            fetchTestResult(submissionId);
        } else {
            setError('Submission ID is missing');
            setLoading(false);
        }
    }, [submissionId]);

    const fetchTestResult = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await studentApi.getTestResult(id);

            if (!response.error && response.data) {
                // Cast the response data to TestResultData
                setResult(response.data as any);
            } else {
                setError(response.message || 'Failed to load test result');
            }
        } catch (err) {
            console.error('Failed to fetch test result', err);
            setError('Failed to load test result. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isCorrectAnswer = (question: QuestionResult): boolean => {
        return question.selectedAnswer === question.correctAnswer;
    };

    const renderQuestionCard = (question: QuestionResult, index: number) => {
        const isCorrect = isCorrectAnswer(question);

        return (
            <Card
                key={question.id}
                className={`mb-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}
                style={{
                    borderWidth: 2,
                    borderColor: isCorrect ? '#10b981' : '#ef4444'
                }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Title level={4} className="mb-0">
                            Câu {index + 1}
                        </Title>
                        <Tag color={isCorrect ? 'success' : 'error'}>
                            {isCorrect ? (
                                <><CheckCircleOutlined /> Đúng</>
                            ) : (
                                <><CloseCircleOutlined /> Sai</>
                            )}
                        </Tag>
                    </div>
                </div>

                <Text className="text-base mb-4 block">{question.questionText}</Text>

                <div className="space-y-3 mb-4">
                    <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
                        <Text strong className="text-gray-600 block mb-2">
                            Đáp án của bạn:
                        </Text>
                        <Text className="text-gray-700">
                            {question.selectedAnswer || '(Không có đáp án)'}
                        </Text>
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}>
                        <Text strong className={isCorrect ? 'text-green-700' : 'text-blue-700'} style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Đáp án đúng:
                        </Text>
                        <Text className={isCorrect ? 'text-green-700' : 'text-blue-700'}>
                            {question.correctAnswer}
                        </Text>
                    </div>
                </div>

                {!question.selectedAnswer && (
                    <Alert
                        message="Bạn chưa trả lời câu hỏi này"
                        type="warning"
                        className="mt-2"
                    />
                )}
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <Result
                    status="error"
                    title="Không thể tải kết quả"
                    subTitle={error || 'Submission ID không hợp lệ hoặc không tồn tại.'}
                    extra={[
                        <Button type="primary" key="back" onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    ]}
                />
            </div>
        );
    }

    const totalQuestions = result.questions.length;
    const maxScore = totalQuestions; // Assuming 1 point per question
    const percentage = maxScore > 0 ? (result.totalScore / maxScore) * 100 : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Print styles */}
            <style>{`
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        .print-break {
                            page-break-after: always;
                        }
                    }
                `}</style>

            {/* Header */}
            <div className="mb-6 no-print">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    Quay lại
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={2} className="mb-2 bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                            Kết quả bài thi
                        </Title>
                        <Text type="secondary">
                            Bài thi #{submissionId}
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        size="large"
                    >
                        In kết quả
                    </Button>
                </div>
            </div>

            {/* Summary Statistics */}
            <Card className="mb-6 shadow-sm">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Tổng điểm"
                            value={result.totalScore}
                            suffix={`/ ${maxScore}`}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: percentage >= 50 ? '#3f8600' : '#cf1322' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Tỷ lệ đạt"
                            value={percentage}
                            precision={1}
                            suffix="%"
                            valueStyle={{ color: percentage >= 50 ? '#3f8600' : '#cf1322' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Câu đúng"
                            value={result.correctCount}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Câu sai"
                            value={result.wrongCount}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Test Info */}
            <Card className="mb-6 shadow-sm">
                <Space direction="vertical" size="small" className="w-full">
                    <div className="flex justify-between">
                        <Text strong>Tổng số câu hỏi:</Text>
                        <Text>{totalQuestions}</Text>
                    </div>
                </Space>
            </Card>

            <Divider>Chi tiết từng câu hỏi</Divider>

            {/* Questions Review */}
            <div>
                {result.questions.map((question, index) => renderQuestionCard(question, index))}
            </div>

            {/* Print Footer */}
            <div className="mt-8 text-center print-only">
                <Text type="secondary">
                    Kết quả được tạo vào {new Date().toLocaleString('vi-VN')}
                </Text>
            </div>
        </div>
    );
};


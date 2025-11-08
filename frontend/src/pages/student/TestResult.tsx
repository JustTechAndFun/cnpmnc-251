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
import type { TestResult as TestResultType, Question, SubmissionAnswer } from '../../types';

const { Title, Text } = Typography;

export const TestResult = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResultType | null>(null);
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
                setResult(response.data);
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
        // eslint-disable-next-line no-restricted-globals
        window.print(); // Browser API for printing
    };

    const getQuestionAnswer = (questionId: string): SubmissionAnswer | undefined => {
        return result?.answers.find(answer => answer.questionId === questionId);
    };

    const formatAnswer = (answer: string | string[]): string => {
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        return answer;
    };

    const getQuestionTypeLabel = (type: string): string => {
        switch (type) {
            case 'MULTIPLE_CHOICE':
                return 'Trắc nghiệm';
            case 'TRUE_FALSE':
                return 'Đúng/Sai';
            case 'SHORT_ANSWER':
                return 'Tự luận';
            default:
                return type;
        }
    };

    const renderQuestionCard = (question: Question, index: number) => {
        const answer = getQuestionAnswer(question.id);
        const isCorrect = answer?.isCorrect ?? false;
        const selectedAnswer = answer?.selectedAnswer;
        const correctAnswer = question.correctAnswer;

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
                        <Tag>{getQuestionTypeLabel(question.questionType)}</Tag>
                        <Tag>Điểm: {answer?.pointsEarned ?? 0}/{question.points}</Tag>
                    </div>
                </div>

                <Text className="text-base mb-4 block">{question.content}</Text>

                {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                    <div className="space-y-2 mb-4">
                        {question.options.map((option, optIndex) => {
                            const optionLabel = String.fromCodePoint(65 + optIndex); // A, B, C, D
                            const isSelected = Array.isArray(selectedAnswer)
                                ? selectedAnswer.includes(option)
                                : selectedAnswer === option;
                            const isCorrectOption = Array.isArray(correctAnswer)
                                ? correctAnswer.includes(option)
                                : correctAnswer === option;

                            let bgColor = 'bg-gray-50';
                            let borderColor = 'border-gray-200';
                            let textColor = 'text-gray-700';

                            if (isCorrectOption) {
                                bgColor = 'bg-green-50';
                                borderColor = 'border-green-500';
                                textColor = 'text-green-700';
                            } else if (isSelected && !isCorrectOption) {
                                bgColor = 'bg-red-50';
                                borderColor = 'border-red-500';
                                textColor = 'text-red-700';
                            }

                            return (
                                <div
                                    key={`${question.id}-option-${optIndex}`}
                                    className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor}`}
                                >
                                    <Text strong className={textColor}>
                                        {optionLabel}. {option}
                                    </Text>
                                    {isCorrectOption && (
                                        <Tag color="success" className="ml-2">
                                            Đáp án đúng
                                        </Tag>
                                    )}
                                    {isSelected && !isCorrectOption && (
                                        <Tag color="error" className="ml-2">
                                            Bạn đã chọn (sai)
                                        </Tag>
                                    )}
                                    {isSelected && isCorrectOption && (
                                        <Tag color="success" className="ml-2">
                                            Bạn đã chọn (đúng)
                                        </Tag>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {question.questionType === 'TRUE_FALSE' && (
                    <div className="space-y-2 mb-4">
                        {['True', 'False'].map((option) => {
                            const isSelected = formatAnswer(selectedAnswer || '') === option;
                            const isCorrectOption = formatAnswer(correctAnswer) === option;

                            let bgColor = 'bg-gray-50';
                            let borderColor = 'border-gray-200';
                            let textColor = 'text-gray-700';

                            if (isCorrectOption) {
                                bgColor = 'bg-green-50';
                                borderColor = 'border-green-500';
                                textColor = 'text-green-700';
                            } else if (isSelected && !isCorrectOption) {
                                bgColor = 'bg-red-50';
                                borderColor = 'border-red-500';
                                textColor = 'text-red-700';
                            }

                            return (
                                <div
                                    key={option}
                                    className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor}`}
                                >
                                    <Text strong className={textColor}>
                                        {option}
                                    </Text>
                                    {isCorrectOption && (
                                        <Tag color="success" className="ml-2">
                                            Đáp án đúng
                                        </Tag>
                                    )}
                                    {isSelected && !isCorrectOption && (
                                        <Tag color="error" className="ml-2">
                                            Bạn đã chọn
                                        </Tag>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {question.questionType === 'SHORT_ANSWER' && (
                    <div className="space-y-3 mb-4">
                        <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
                            <Text strong className="text-gray-600 block mb-2">
                                Đáp án của bạn:
                            </Text>
                            <Text className="text-gray-700">
                                {formatAnswer(selectedAnswer || '') || '(Không có đáp án)'}
                            </Text>
                        </div>
                        <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50">
                            <Text strong className="text-blue-700 block mb-2">
                                Đáp án đúng:
                            </Text>
                            <Text className="text-blue-700">
                                {formatAnswer(correctAnswer)}
                            </Text>
                        </div>
                    </div>
                )}

                {!selectedAnswer && (
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

    const percentage = result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : 0;

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
                            {result.testName}
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
                            suffix={`/ ${result.maxScore}`}
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
                        <Text strong>Ngày nộp bài:</Text>
                        <Text>{new Date(result.submittedAt).toLocaleString('vi-VN')}</Text>
                    </div>
                    <div className="flex justify-between">
                        <Text strong>Tổng số câu hỏi:</Text>
                        <Text>{result.totalQuestions}</Text>
                    </div>
                    {result.studentName && (
                        <div className="flex justify-between">
                            <Text strong>Học sinh:</Text>
                            <Text>{result.studentName}</Text>
                        </div>
                    )}
                </Space>
            </Card>

            <Divider>Chi tiết từng câu hỏi</Divider>

            {/* Questions Review */}
            <div>
                {result.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question, index) => renderQuestionCard(question, index))}
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


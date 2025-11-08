import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { Card, Typography, Button, Spin, Descriptions, Tag, Modal, Form, Input, Select, InputNumber, Space, List, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, QuestionCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { Question } from '../../types';
import { SuccessModal } from '../../components/SuccessModal';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TestInfo {
    id: string;
    title: string;
    description?: string | null;
    createdAt?: string;
    duration: number;
    classId?: string;
    className?: string;
    passcode?: string;
    status?: string;
    openTime?: string | null;
    closeTime?: string | null;
}

export const TestDetail = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { testId } = useParams<{ testId: string }>();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<TestInfo | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [addQuestionModalVisible, setAddQuestionModalVisible] = useState(false);
    const [questionForm] = Form.useForm();
    const [addingQuestion, setAddingQuestion] = useState(false);
    const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE');
    const [options, setOptions] = useState<string[]>(['', '', '', '']); // Initialize with 4 options for multiple choice
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (testId) {
            fetchTestDetail();
        }
    }, [testId]);

    // Only TEACHER role can access
    if (!auth?.user || auth.user.role !== Role.TEACHER) {
        return <Navigate to="/unauthorized" replace />;
    }

    const fetchTestDetail = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            // First, get all classes to find which class this test belongs to
            const classesResponse = await teacherApi.getMyClasses();

            if (!classesResponse.error && classesResponse.data) {
                const classes = classesResponse.data;
                let foundClassId: string | null = null;
                let foundClassName: string | null = null;

                // Check each class for this test
                for (const cls of classes) {
                    try {
                        const testsResponse = await teacherApi.getTestsInClass(cls.id);
                        if (!testsResponse.error && testsResponse.data) {
                            const testExists = testsResponse.data.find(t => t.id === testId);
                            if (testExists) {
                                foundClassId = cls.id;
                                foundClassName = cls.className;
                                break;
                            }
                        }
                    } catch (err) {
                        // Continue to next class if this one fails
                        console.error(`Failed to fetch tests for class ${cls.id}`, err);
                    }
                }

                if (foundClassId && testId) {
                    // Fetch test detail
                    const response = await teacherApi.getTestDetail(foundClassId, testId);

                    if (!response.error && response.data) {
                        const testData = response.data as any; // API returns: id, passcode, title, description, openTime, closeTime, duration, status
                        setTest({
                            id: testData.id,
                            title: testData.title || '',
                            description: testData.description ?? null,
                            duration: testData.duration,
                            classId: foundClassId,
                            className: foundClassName || undefined,
                            passcode: testData.passcode,
                            status: testData.status,
                            openTime: testData.openTime ?? null,
                            closeTime: testData.closeTime ?? null,
                            createdAt: testData.createdAt
                        });
                        
                        // Fetch questions separately using getTestQuestions API
                        try {
                            const questionsResponse = await teacherApi.getTestQuestions(foundClassId, testId);
                            if (!questionsResponse.error && questionsResponse.data) {
                                const questionsData = questionsResponse.data.map((q: any) => ({
                                    id: q.id,
                                    testId: testData.id,
                                    content: q.content,
                                    questionType: 'MULTIPLE_CHOICE' as const, // Backend returns choiceA, choiceB, etc.
                                    options: [q.choiceA, q.choiceB, q.choiceC, q.choiceD].filter((opt: string) => opt && opt.trim() !== ''),
                                    correctAnswer: q.answer,
                                    points: 10, // Default points if not provided
                                    order: q.order || 0
                                }));
                                setQuestions(questionsData);
                            }
                        } catch (err) {
                            console.error('Failed to fetch questions', err);
                            // Continue even if questions fetch fails
                        }
                    } else {
                        setErrorMessage(response.message || 'Không thể tải thông tin bài kiểm tra');
                    }
                } else {
                    setErrorMessage('Không tìm thấy bài kiểm tra trong các lớp học của bạn');
                }
            } else {
                setErrorMessage('Không thể tải danh sách lớp học');
            }
        } catch (error) {
            console.error('Failed to fetch test detail', error);
            setErrorMessage('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };


    const handleAddQuestion = () => {
        setAddQuestionModalVisible(true);
        questionForm.resetFields();
        setQuestionType('MULTIPLE_CHOICE');
        setOptions(['', '', '', '']); // Initialize with 4 empty options for multiple choice
        setCorrectAnswerIndex(0);
    };

    const handleQuestionTypeChange = (value: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER') => {
        setQuestionType(value);
        if (value === 'MULTIPLE_CHOICE') {
            setOptions(['', '', '', '']); // Initialize with 4 empty options
            setCorrectAnswerIndex(0);
        }
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        if (correctAnswerIndex >= newOptions.length) {
            setCorrectAnswerIndex(0);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSaveQuestion = async (values: {
        content: string;
        points: number;
        correctAnswer?: string;
    }) => {
        if (!test?.classId || !testId) {
            message.error('Thông tin test không hợp lệ');
            return;
        }

        setAddingQuestion(true);
        try {
            let answer: 'CHOICE_A' | 'CHOICE_B' | 'CHOICE_C' | 'CHOICE_D';
            
            if (questionType === 'MULTIPLE_CHOICE') {
                // Ensure we have exactly 4 options
                if (options.length < 4) {
                    message.error('Cần đủ 4 đáp án cho câu hỏi trắc nghiệm');
                    setAddingQuestion(false);
                    return;
                }
                
                // Check that all 4 options are filled
                const trimmedOptions = options.map(opt => opt.trim());
                const emptyOptions = trimmedOptions.filter(opt => opt === '');
                
                if (emptyOptions.length > 0) {
                    message.error('Vui lòng điền đầy đủ 4 đáp án');
                    setAddingQuestion(false);
                    return;
                }
                
                // Validate correctAnswerIndex is within range
                if (correctAnswerIndex < 0 || correctAnswerIndex >= 4) {
                    message.error('Vui lòng chọn đáp án đúng');
                    setAddingQuestion(false);
                    return;
                }
                
                // Map index to CHOICE_A, CHOICE_B, CHOICE_C, CHOICE_D
                const answerMap: Record<number, 'CHOICE_A' | 'CHOICE_B' | 'CHOICE_C' | 'CHOICE_D'> = {
                    0: 'CHOICE_A',
                    1: 'CHOICE_B',
                    2: 'CHOICE_C',
                    3: 'CHOICE_D'
                };
                answer = answerMap[correctAnswerIndex];
            } else {
                message.error('Hiện tại chỉ hỗ trợ câu hỏi trắc nghiệm');
                setAddingQuestion(false);
                return;
            }

            // Prepare question data for API
            const questionData = {
                content: values.content,
                choiceA: options[0]?.trim() || '',
                choiceB: options[1]?.trim() || '',
                choiceC: options[2]?.trim() || '',
                choiceD: options[3]?.trim() || '',
                answer: answer
            };

            // Call API to add question
            const response = await teacherApi.addQuestionToTest(test.classId, testId, questionData);
            
            if (!response.error) {
                setSuccessMessage('Thêm câu hỏi thành công!');
                setSuccessModalVisible(true);
                setAddQuestionModalVisible(false);
                questionForm.resetFields();
                setQuestionType('MULTIPLE_CHOICE');
                setOptions(['', '', '', '']); // Reset to 4 empty options
                setCorrectAnswerIndex(0);
                
                // Refresh questions list
                try {
                    const questionsResponse = await teacherApi.getTestQuestions(test.classId, testId);
                    if (!questionsResponse.error && questionsResponse.data) {
                        const questionsData = questionsResponse.data.map((q: any) => ({
                            id: q.id,
                            testId: testId,
                            content: q.content,
                            questionType: 'MULTIPLE_CHOICE' as const,
                            options: [q.choiceA, q.choiceB, q.choiceC, q.choiceD].filter((opt: string) => opt && opt.trim() !== ''),
                            correctAnswer: q.answer,
                            points: 10,
                            order: q.order || 0
                        }));
                        setQuestions(questionsData);
                    }
                } catch (err) {
                    console.error('Failed to refresh questions', err);
                }
            } else {
                setErrorMessage(response.message || 'Không thể thêm câu hỏi');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to add question', error);
            setErrorMessage('Không thể thêm câu hỏi. Vui lòng thử lại.');
            setErrorModalVisible(true);
        } finally {
            setAddingQuestion(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="mb-4"
            >
                Quay lại
            </Button>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-600">Đang tải thông tin bài kiểm tra...</Text>
                </div>
            ) : errorMessage ? (
                <Card className="shadow-sm">
                    <div className="text-center py-12">
                        <Title level={4} type="danger">Lỗi</Title>
                        <Text className="text-gray-500">{errorMessage}</Text>
                    </div>
                </Card>
            ) : test ? (
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <Title level={2} className="mb-4 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent text-xl sm:text-2xl">
                            {test.title}
                        </Title>

                        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} className="mt-6">
                            <Descriptions.Item label="Mô tả" span={2}>
                                {test.description || 'Chưa có mô tả'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lớp học">
                                {test.className || 'N/A'}
                            </Descriptions.Item>
                            {test.passcode && (
                                <Descriptions.Item label="Mã truy cập">
                                    <Text copyable={{ text: test.passcode }}>{test.passcode}</Text>
                                </Descriptions.Item>
                            )}
                            {test.status && (
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={test.status === 'DRAFT' ? 'orange' : test.status === 'PUBLISHED' ? 'green' : 'default'}>
                                        {test.status}
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            {test.createdAt && (
                                <Descriptions.Item label="Ngày tạo">
                                    {new Date(test.createdAt).toLocaleDateString('vi-VN')}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Thời gian làm bài">
                                {test.duration} phút
                            </Descriptions.Item>
                            {test.openTime && (
                                <Descriptions.Item label="Thời gian mở">
                                    {new Date(test.openTime).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}
                            {test.closeTime && (
                                <Descriptions.Item label="Thời gian đóng">
                                    {new Date(test.closeTime).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>

                    {/* Questions Section */}
                    <Card className="shadow-sm">
                        <div className="mt-6 md:mt-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                                <Title level={3} className="mb-0 text-lg sm:text-xl">
                                    <QuestionCircleOutlined className="mr-2 text-purple-600" />
                                    Danh sách câu hỏi ({questions.length})
                                </Title>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddQuestion}
                                    className="bg-linear-to-r from-purple-600 to-purple-800 border-none w-full sm:w-auto"
                                >
                                    Thêm câu hỏi
                                </Button>
                            </div>

                        {questions.length === 0 ? (
                            <Card className="text-center py-8">
                                <Text type="secondary">Chưa có câu hỏi nào. Hãy thêm câu hỏi để bắt đầu.</Text>
                            </Card>
                        ) : (
                            <List
                                dataSource={questions}
                                renderItem={(question, index) => (
                                    <Card className="mb-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Text strong className="text-lg">
                                                        Câu {index + 1}:
                                                    </Text>
                                                    <Tag color={question.questionType === 'MULTIPLE_CHOICE' ? 'blue' : 'green'}>
                                                        {question.questionType === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                                                    </Tag>
                                                    <Tag color="purple">{question.points} điểm</Tag>
                                                </div>
                                                <Text className="text-base">{question.content}</Text>
                                            </div>
                                        </div>

                                        {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                                            <div className="mt-4">
                                                <Text strong className="block mb-2">Các đáp án:</Text>
                                                <List
                                                    dataSource={question.options}
                                                    renderItem={(option, optIndex) => {
                                                        // Handle correctAnswer - backend returns CHOICE_A, CHOICE_B, CHOICE_C, CHOICE_D
                                                        const correctAnswerValue = Array.isArray(question.correctAnswer) 
                                                            ? question.correctAnswer[0] 
                                                            : question.correctAnswer;
                                                        
                                                        // Map CHOICE_A -> 0, CHOICE_B -> 1, CHOICE_C -> 2, CHOICE_D -> 3
                                                        const answerIndexMap: Record<string, number> = {
                                                            'CHOICE_A': 0,
                                                            'CHOICE_B': 1,
                                                            'CHOICE_C': 2,
                                                            'CHOICE_D': 3
                                                        };
                                                        
                                                        const correctAnswerIndex = answerIndexMap[String(correctAnswerValue || '').trim()];
                                                        const isCorrect = correctAnswerIndex !== undefined && correctAnswerIndex === optIndex;
                                                        
                                                        return (
                                                            <div className={`p-2 mb-2 rounded border ${
                                                                isCorrect
                                                                    ? 'bg-green-50 border-green-300' 
                                                                    : 'bg-gray-50 border-gray-200'
                                                            }`}>
                                                                <Space>
                                                                    {isCorrect && (
                                                                        <CheckCircleOutlined className="text-green-600" />
                                                                    )}
                                                                    <Text className={isCorrect ? 'text-green-700 font-semibold' : ''}>
                                                                        {String.fromCodePoint(65 + optIndex)}. {option}
                                                                    </Text>
                                                                    {isCorrect && (
                                                                        <Tag color="green">Đáp án đúng</Tag>
                                                                    )}
                                                                </Space>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {question.questionType === 'SHORT_ANSWER' && (
                                            <div className="mt-4">
                                                <Text strong className="block mb-2">Đáp án đúng:</Text>
                                                <div className="p-3 bg-green-50 border border-green-300 rounded">
                                                    <Text className="text-green-700">{question.correctAnswer}</Text>
                                                </div>
                                            </div>
                                        )}

                                        {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                                                <div className="mt-4">
                                                    <Text strong className="block mb-2">Các đáp án:</Text>
                                                    <List
                                                        dataSource={question.options}
                                                        renderItem={(option, optIndex) => {
                                                            // Handle correctAnswer as string or string[]
                                                            const correctAnswerValue = Array.isArray(question.correctAnswer)
                                                                ? question.correctAnswer[0]
                                                                : question.correctAnswer;

                                                            // Compare trimmed strings
                                                            const optionStr = String(option || '').trim();
                                                            const correctStr = String(correctAnswerValue || '').trim();
                                                            const isCorrect = optionStr === correctStr && optionStr !== '';

                                                            return (
                                                                <div className={`p-2 mb-2 rounded border ${isCorrect
                                                                        ? 'bg-green-50 border-green-300'
                                                                        : 'bg-gray-50 border-gray-200'
                                                                    }`}>
                                                                    <Space>
                                                                        {isCorrect && (
                                                                            <CheckCircleOutlined className="text-green-600" />
                                                                        )}
                                                                        <Text className={isCorrect ? 'text-green-700 font-semibold' : ''}>
                                                                            {String.fromCodePoint(65 + optIndex)}. {option}
                                                                        </Text>
                                                                        {isCorrect && (
                                                                            <Tag color="green">Đáp án đúng</Tag>
                                                                        )}
                                                                    </Space>
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {question.questionType === 'SHORT_ANSWER' && (
                                                <div className="mt-4">
                                                    <Text strong className="block mb-2">Đáp án đúng:</Text>
                                                    <div className="p-3 bg-green-50 border border-green-300 rounded">
                                                        <Text className="text-green-700">{question.correctAnswer}</Text>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                />
                            )}
                        </div>
                    </Card>
                </div>
            ) : (
                <Card>
                    <div className="text-center py-12">
                        <Title level={4} type="secondary">Không tìm thấy bài kiểm tra</Title>
                        <Text className="text-gray-500">Bài kiểm tra với ID {testId} không tồn tại</Text>
                    </div>
                </Card>
            )}

            {/* Add Question Modal */}
            <Modal
                title={
                    <Space>
                        <QuestionCircleOutlined className="text-purple-600" />
                        <span>Thêm câu hỏi mới</span>
                    </Space>
                }
                open={addQuestionModalVisible}
                onCancel={() => {
                    setAddQuestionModalVisible(false);
                    questionForm.resetFields();
                    setQuestionType('MULTIPLE_CHOICE');
                    setOptions(['', '', '', '']); // Reset to 4 empty options
                    setCorrectAnswerIndex(0);
                }}
                onOk={() => questionForm.submit()}
                okText="Thêm câu hỏi"
                cancelText="Hủy"
                okButtonProps={{
                    icon: <PlusOutlined />,
                    loading: addingQuestion,
                    className: "bg-gradient-to-r from-purple-600 to-purple-800 border-none"
                }}
                width="90%"
                style={{ maxWidth: 700 }}
            >
                <Form
                    form={questionForm}
                    layout="vertical"
                    onFinish={handleSaveQuestion}
                    initialValues={{
                        points: 10
                    }}
                >
                    <Form.Item
                        name="questionType"
                        label="Loại câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi' }]}
                    >
                        <Select
                            value={questionType}
                            onChange={handleQuestionTypeChange}
                            size="large"
                        >
                            <Select.Option value="MULTIPLE_CHOICE">Trắc nghiệm</Select.Option>
                            <Select.Option value="SHORT_ANSWER">Tự luận</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập nội dung câu hỏi..."
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>

                    {questionType === 'MULTIPLE_CHOICE' && (
                        <Form.Item label="Các đáp án">
                            {options.map((option, index) => (
                                <div key={`option-${index}-${option}`} className="mb-3 flex items-center gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Đáp án ${String.fromCodePoint(65 + index)}`}
                                        size="large"
                                        className="flex-1"
                                    />
                                    <Button
                                        type={correctAnswerIndex === index ? 'primary' : 'default'}
                                        icon={correctAnswerIndex === index ? <CheckCircleOutlined /> : null}
                                        onClick={() => setCorrectAnswerIndex(index)}
                                        className={correctAnswerIndex === index ? 'bg-green-600 border-green-600' : ''}
                                    >
                                        Đúng
                                    </Button>
                                    {options.length > 4 && (
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveOption(index)}
                                        />
                                    )}
                                </div>
                                ))}
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddOption}
                                    block
                                    className="mt-2"
                                >
                                    Thêm đáp án
                                </Button>
                        </Form.Item>
                    )}

                    {questionType === 'SHORT_ANSWER' && (
                        <Form.Item
                            name="correctAnswer"
                            label="Câu trả lời đúng"
                            rules={[{ required: true, message: 'Vui lòng nhập câu trả lời đúng' }]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập câu trả lời đúng..."
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="points"
                        label="Điểm số"
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm số' },
                            { type: 'number', min: 1, message: 'Điểm số phải lớn hơn 0' }
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={100}
                            placeholder="10"
                            style={{ width: '100%' }}
                            addonAfter="điểm"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <SuccessModal
                open={successModalVisible}
                message={successMessage}
                onClose={() => setSuccessModalVisible(false)}
            />
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />
        </div>
    );
};

export default TestDetail;

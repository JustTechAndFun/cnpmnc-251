import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Typography,
    Space,
    Tag,
    Popconfirm,
    Spin,
    Empty
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    KeyOutlined,
    EyeOutlined
} from '@ant-design/icons';
import type { ApiResponse, Test, Question } from '../../types';
import { ErrorModal } from '../../components/ErrorModal';
import { SuccessModal } from '../../components/SuccessModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const TestManagement = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Modals state
    const [testInfoModalVisible, setTestInfoModalVisible] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Forms
    const [testInfoForm] = Form.useForm();
    const [questionForm] = Form.useForm();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            // First, get all classes of the teacher
            const classesResponse = await axios.get<ApiResponse<any[]>>(
                `${API_BASE_URL}/api/classes/my-classes`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );

            if (!classesResponse.data.error && classesResponse.data.data) {
                const classes = classesResponse.data.data;

                // Fetch tests from all classes
                const allTestsPromises = classes.map(cls =>
                    axios.get<ApiResponse<Test[]>>(
                        `${API_BASE_URL}/api/classes/${cls.id}/tests`,
                        {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                            withCredentials: true
                        }
                    ).catch(error => {
                        console.error(`Failed to fetch tests for class ${cls.id}`, error);
                        return { data: { error: true, data: [] } };
                    })
                );

                const testsResponses = await Promise.all(allTestsPromises);

                // Combine all tests from all classes
                const allTests: Test[] = [];
                testsResponses.forEach(response => {
                    if (!response.data.error && response.data.data) {
                        allTests.push(...response.data.data);
                    }
                });

                setTests(allTests);
            } else {
                setErrorMessage('Không thể tải danh sách lớp học');
                setErrorModalVisible(true);
                setTests([]);
            }
        } catch (error) {
            console.error('Failed to fetch tests', error);
            setErrorMessage('Không thể tải danh sách test. Vui lòng thử lại sau.');
            setErrorModalVisible(true);
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditTest = (test: Test) => {
        setSelectedTest(test);
        testInfoForm.setFieldsValue({
            name: test.name,
            description: test.description,
            duration: test.duration,
            passcode: test.passcode
        });
        setTestInfoModalVisible(true);
    };

    const handleUpdateTest = async (values: {
        name: string;
        description: string;
        duration: number;
        passcode: string;
    }) => {
        if (!selectedTest) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put<ApiResponse<Test>>(
                `${API_BASE_URL}/api/teacher/tests/${selectedTest.id}`,
                values,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );

            if (!response.data.error && response.data.data) {
                setTestInfoModalVisible(false);
                setSuccessMessage('Cập nhật thông tin test thành công');
                setSuccessModalVisible(true);
                fetchTests();
            } else {
                setTestInfoModalVisible(false);
                setErrorMessage(response.data.message || 'Không thể cập nhật test');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to update test', error);
            setTestInfoModalVisible(false);
            setErrorMessage('Không thể cập nhật test. Vui lòng thử lại.');
            setErrorModalVisible(true);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete<ApiResponse<void>>(
                `${API_BASE_URL}/api/teacher/tests/${testId}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );
            setSuccessMessage('Xóa test thành công');
            setSuccessModalVisible(true);
            fetchTests();
        } catch (error) {
            console.error('Failed to delete test', error);
            setErrorMessage('Không thể xóa test. Vui lòng thử lại.');
            setErrorModalVisible(true);
        }
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        questionForm.setFieldsValue({
            content: question.content,
            questionType: question.questionType,
            options: question.options?.join('\n') || '',
            correctAnswer: Array.isArray(question.correctAnswer)
                ? question.correctAnswer.join('\n')
                : question.correctAnswer,
            points: question.points
        });
        setQuestionModalVisible(true);
    };

    const handleDeleteQuestion = async (testId: string, questionId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete<ApiResponse<void>>(
                `${API_BASE_URL}/api/teacher/tests/${testId}/questions/${questionId}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true
                }
            );
            setSuccessMessage('Xóa câu hỏi thành công');
            setSuccessModalVisible(true);
            fetchTests();
        } catch (error) {
            console.error('Failed to delete question', error);
            setErrorMessage('Không thể xóa câu hỏi. Vui lòng thử lại.');
            setErrorModalVisible(true);
        }
    };

    const handleAddQuestion = () => {
        if (!selectedTest) return;
        setEditingQuestion(null);
        questionForm.resetFields();
        questionForm.setFieldsValue({
            questionType: 'MULTIPLE_CHOICE',
            points: 10
        });
        setQuestionModalVisible(true);
    };

    const handleSaveQuestion = async (values: {
        content: string;
        questionType: string;
        options?: string;
        correctAnswer: string;
        points: number;
    }) => {
        if (!selectedTest) return;

        const questionType = values.questionType;

        let correctAnswer: string | string[];
        if (questionType === 'TRUE_FALSE') {
            correctAnswer = values.correctAnswer.trim().toLowerCase();
        } else if (Array.isArray(values.correctAnswer)) {
            correctAnswer = values.correctAnswer;
        } else {
            correctAnswer = values.correctAnswer.split('\n').filter(a => a.trim());
        }

        const questionData = {
            content: values.content,
            questionType: questionType,
            options: questionType === 'MULTIPLE_CHOICE' && values.options
                ? values.options.split('\n').filter(o => o.trim())
                : undefined,
            correctAnswer,
            points: values.points
        };

        try {
            const token = localStorage.getItem('auth_token');
            if (editingQuestion) {
                // Update question
                const response = await axios.put<ApiResponse<Question>>(
                    `${API_BASE_URL}/api/teacher/tests/${selectedTest.id}/questions/${editingQuestion.id}`,
                    questionData,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        withCredentials: true
                    }
                );
                if (!response.data.error) {
                    setQuestionModalVisible(false);
                    setEditingQuestion(null);
                    setSuccessMessage('Cập nhật câu hỏi thành công');
                    setSuccessModalVisible(true);
                    fetchTests();
                } else {
                    setQuestionModalVisible(false);
                    setErrorMessage(response.data.message || 'Không thể cập nhật câu hỏi');
                    setErrorModalVisible(true);
                }
            } else {
                // Create question
                const response = await axios.post<ApiResponse<Question>>(
                    `${API_BASE_URL}/api/teacher/tests/${selectedTest.id}/questions`,
                    questionData,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        withCredentials: true
                    }
                );
                if (!response.data.error) {
                    setQuestionModalVisible(false);
                    setEditingQuestion(null);
                    setSuccessMessage('Thêm câu hỏi thành công');
                    setSuccessModalVisible(true);
                    fetchTests();
                } else {
                    setQuestionModalVisible(false);
                    setErrorMessage(response.data.message || 'Không thể thêm câu hỏi');
                    setErrorModalVisible(true);
                }
            }
        } catch (error) {
            console.error('Failed to save question', error);
            setQuestionModalVisible(false);
            setErrorMessage('Không thể lưu câu hỏi. Vui lòng thử lại.');
            setErrorModalVisible(true);
        }
    };

    const getQuestionTypeLabel = (questionType: string): string => {
        if (questionType === 'MULTIPLE_CHOICE') {
            return 'Trắc nghiệm';
        }
        if (questionType === 'TRUE_FALSE') {
            return 'Đúng/Sai';
        }
        return 'Tự luận';
    };

    const renderQuestionCard = (question: Question, index: number, test: Test) => {
        const questionTypeLabel = getQuestionTypeLabel(question.questionType);
        const correctAnswerText = Array.isArray(question.correctAnswer)
            ? question.correctAnswer.join(', ')
            : question.correctAnswer;

        const handleEditClick = () => {
            setSelectedTest(test);
            handleEditQuestion(question);
        };

        const handleDeleteClick = () => {
            handleDeleteQuestion(test.id, question.id);
        };

        return (
            <Card key={question.id} className="shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag color="blue">Câu {index + 1}</Tag>
                            <Tag>{questionTypeLabel}</Tag>
                            <Tag color="orange">{question.points} điểm</Tag>
                        </div>
                        <Text className="text-base font-medium block mb-2">{question.content}</Text>

                        {question.options && question.options.length > 0 && (
                            <div className="ml-4 mb-2">
                                {question.options.map((option, optIndex) => (
                                    <div key={`${question.id}-opt-${optIndex}`} className="text-gray-600">
                                        {String.fromCodePoint(65 + optIndex)}. {option}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-2">
                            <Text type="secondary" className="text-sm">
                                Đáp án đúng: <Text strong>{correctAnswerText}</Text>
                            </Text>
                        </div>
                    </div>
                    <Space>
                        <Button icon={<EditOutlined />} onClick={handleEditClick}>
                            Sửa
                        </Button>
                        <Popconfirm
                            title="Xóa câu hỏi"
                            description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                            onConfirm={handleDeleteClick}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                </div>
            </Card>
        );
    };

    const expandableRowRender = (test: Test) => {
        const sortedQuestions = [...test.questions].sort((a, b) => a.order - b.order);
        const handleAddQuestionClick = () => {
            setSelectedTest(test);
            handleAddQuestion();
        };

        return (
            <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="mb-0">Danh sách câu hỏi ({test.questions.length})</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddQuestionClick}
                    >
                        Thêm câu hỏi
                    </Button>
                </div>

                {test.questions.length === 0 ? (
                    <Empty description="Chưa có câu hỏi nào" />
                ) : (
                    <div className="space-y-4">
                        {sortedQuestions.map((question, index) => renderQuestionCard(question, index, test))}
                    </div>
                )}
            </div>
        );
    };

    const columns = [
        {
            title: 'Tên test',
            dataIndex: 'name',
            key: 'name',
            render: (_: string, record: Test) => (
                <div>
                    <Text strong className="block">{record.name}</Text>
                    <Text type="secondary" className="text-xs">{record.description}</Text>
                </div>
            ),
        },
        {
            title: 'Thời gian',
            key: 'duration',
            render: (_: unknown, record: Test) => (
                <Space>
                    <ClockCircleOutlined />
                    <Text>{record.duration} phút</Text>
                </Space>
            ),
        },
        {
            title: 'Mã truy cập',
            key: 'passcode',
            render: (_: unknown, record: Test) => (
                <Space>
                    <KeyOutlined />
                    <Text copyable={{ text: record.passcode }}>{record.passcode}</Text>
                </Space>
            ),
        },
        {
            title: 'Số câu hỏi',
            key: 'questionsCount',
            render: (_: unknown, record: Test) => {
                const count = record.questions.length;
                return <Tag color="blue">{count} câu</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: unknown, record: Test) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/teacher/tests/${record.id}`)}
                    >
                        Xem
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditTest(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa test"
                        description="Bạn có chắc chắn muốn xóa test này? Tất cả câu hỏi cũng sẽ bị xóa."
                        onConfirm={() => handleDeleteTest(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Quản lý Tests
                    </Title>
                    <Text type="secondary">Xem và quản lý tất cả các test bạn đã tạo</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/teacher/tests/create')}
                    size="large"
                >
                    Tạo bài kiểm tra
                </Button>
            </div>

            <Card className="shadow-sm">
                {loading && (
                    <div className="flex justify-center py-12">
                        <Spin size="large" />
                    </div>
                )}
                {!loading && tests.length === 0 && (
                    <Empty description="Chưa có test nào" />
                )}
                {!loading && tests.length > 0 && (
                    <Table
                        columns={columns}
                        dataSource={tests}
                        rowKey="id"
                        expandable={{
                            expandedRowRender: expandableRowRender,
                            expandIconColumnIndex: -1,
                        }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} test`,
                        }}
                    />
                )}
            </Card>

            {/* Test Info Modal */}
            <Modal
                title="Chỉnh sửa thông tin test"
                open={testInfoModalVisible}
                onCancel={() => {
                    setTestInfoModalVisible(false);
                    setSelectedTest(null);
                    testInfoForm.resetFields();
                }}
                onOk={() => testInfoForm.submit()}
                okText="Lưu"
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={testInfoForm}
                    layout="vertical"
                    onFinish={handleUpdateTest}
                >
                    <Form.Item
                        label="Tên test"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên test' }]}
                    >
                        <Input placeholder="Nhập tên test" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả test" />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian (phút)"
                        name="duration"
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                    >
                        <InputNumber min={1} className="w-full" placeholder="Nhập thời gian làm bài" />
                    </Form.Item>

                    <Form.Item
                        label="Mã truy cập"
                        name="passcode"
                        rules={[{ required: true, message: 'Vui lòng nhập mã truy cập' }]}
                    >
                        <Input placeholder="Nhập mã truy cập" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Question Modal */}
            <Modal
                title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                open={questionModalVisible}
                onCancel={() => {
                    setQuestionModalVisible(false);
                    setEditingQuestion(null);
                    questionForm.resetFields();
                }}
                onOk={() => questionForm.submit()}
                okText={editingQuestion ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={700}
            >
                <Form
                    form={questionForm}
                    layout="vertical"
                    onFinish={handleSaveQuestion}
                >
                    <Form.Item
                        label="Nội dung câu hỏi"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                    >
                        <TextArea rows={3} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>

                    <Form.Item
                        label="Loại câu hỏi"
                        name="questionType"
                        rules={[{ required: true }]}
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.questionType !== currentValues.questionType}
                    >
                        {({ getFieldValue }) => {
                            const questionType = getFieldValue('questionType');
                            if (questionType === 'MULTIPLE_CHOICE') {
                                return (
                                    <Form.Item
                                        label="Các lựa chọn (mỗi dòng một lựa chọn)"
                                        name="options"
                                        rules={[{ required: true, message: 'Vui lòng nhập các lựa chọn' }]}
                                    >
                                        <TextArea
                                            rows={4}
                                            placeholder="Lựa chọn 1&#10;Lựa chọn 2&#10;Lựa chọn 3&#10;Lựa chọn 4"
                                        />
                                    </Form.Item>
                                );
                            }
                            if (questionType === 'TRUE_FALSE') {
                                return (
                                    <Form.Item
                                        label="Đáp án đúng"
                                        name="correctAnswer"
                                        rules={[{ required: true, message: 'Vui lòng chọn đáp án' }]}
                                    >
                                        <Input placeholder="Nhập 'true' hoặc 'false'" />
                                    </Form.Item>
                                );
                            }
                            return (
                                <Form.Item
                                    label="Đáp án đúng"
                                    name="correctAnswer"
                                    rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng' }]}
                                >
                                    <TextArea rows={3} placeholder="Nhập đáp án đúng" />
                                </Form.Item>
                            );
                        }}
                    </Form.Item>


                    <Form.Item
                        label="Điểm số"
                        name="points"
                        rules={[{ required: true, message: 'Vui lòng nhập điểm số' }]}
                    >
                        <InputNumber min={1} className="w-full" placeholder="Nhập điểm số" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Error Modal */}
            <ErrorModal
                open={errorModalVisible}
                message={errorMessage}
                onClose={() => setErrorModalVisible(false)}
            />

            {/* Success Modal */}
            <SuccessModal
                open={successModalVisible}
                message={successMessage}
                onClose={() => setSuccessModalVisible(false)}
            />
        </div>
    );
};
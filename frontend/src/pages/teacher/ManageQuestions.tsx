import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    Card,
    Typography,
    Button,
    Form,
    Input,
    Radio,
    Space,
    List,
    Popconfirm,
    message,
    Spin,
    Empty,
    Tag,
    Modal
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { teacherApi } from '../../apis';
import type { QuestionDTO, AddQuestionRequest } from '../../apis/teacherApi';
import { SuccessModal } from '../../components/SuccessModal';
import { ErrorModal } from '../../components/ErrorModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ManageQuestions = () => {
    const { classId, testId } = useParams<{ classId: string; testId: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState<QuestionDTO[]>([]);
    const [testInfo, setTestInfo] = useState<{ title: string; description?: string } | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<QuestionDTO | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (classId && testId) {
            fetchTestDetail();
        }
    }, [classId, testId]);

    const fetchTestDetail = async () => {
        if (!classId || !testId) return;

        setLoading(true);
        try {
            // Fetch test info
            const testResponse = await teacherApi.getTestDetail(classId, testId);
            if (!testResponse.error && testResponse.data) {
                setTestInfo({
                    title: testResponse.data.title,
                    description: testResponse.data.description
                });
            } else {
                message.error('Không thể tải thông tin bài kiểm tra');
                setLoading(false);
                return;
            }

            // Fetch questions separately
            const questionsResponse = await teacherApi.getTestQuestions(classId, testId);
            if (!questionsResponse.error && questionsResponse.data) {
                setQuestions(questionsResponse.data);
            } else {
                // If error, set empty array (test might have no questions yet)
                setQuestions([]);
            }
        } catch (error) {
            console.error('Failed to fetch test detail', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (question?: QuestionDTO) => {
        if (question) {
            setEditingQuestion(question);
            form.setFieldsValue({
                content: question.content,
                choiceA: question.choiceA,
                choiceB: question.choiceB,
                choiceC: question.choiceC,
                choiceD: question.choiceD,
                answer: question.answer
            });
        } else {
            setEditingQuestion(null);
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingQuestion(null);
        form.resetFields();
    };

    const handleSubmitQuestion = async (values: AddQuestionRequest) => {
        if (!classId || !testId) return;

        setSubmitting(true);
        try {
            if (editingQuestion) {
                // Update existing question
                const response = await teacherApi.updateQuestion(
                    classId,
                    testId,
                    editingQuestion.id,
                    values
                );
                if (!response.error) {
                    setSuccessMessage('Cập nhật câu hỏi thành công!');
                    setSuccessModalVisible(true);
                    fetchTestDetail();
                    handleCloseModal();
                } else {
                    setErrorMessage(response.message || 'Không thể cập nhật câu hỏi');
                    setErrorModalVisible(true);
                }
            } else {
                // Add new question
                const response = await teacherApi.addQuestionToTest(classId, testId, values);
                if (!response.error) {
                    setSuccessMessage('Thêm câu hỏi thành công!');
                    setSuccessModalVisible(true);
                    fetchTestDetail();
                    handleCloseModal();
                } else {
                    setErrorMessage(response.message || 'Không thể thêm câu hỏi');
                    setErrorModalVisible(true);
                }
            }
        } catch (error) {
            console.error('Failed to submit question', error);
            setErrorMessage('Không thể kết nối đến server');
            setErrorModalVisible(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!classId || !testId) return;

        try {
            const response = await teacherApi.deleteQuestion(classId, testId, questionId);
            if (!response.error) {
                setSuccessMessage('Xóa câu hỏi thành công!');
                setSuccessModalVisible(true);
                fetchTestDetail();
            } else {
                setErrorMessage(response.message || 'Không thể xóa câu hỏi');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Failed to delete question', error);
            setErrorMessage('Không thể kết nối đến server');
            setErrorModalVisible(true);
        }
    };

    const getAnswerLabel = (answer: string): string => {
        const labels: Record<string, string> = {
            'CHOICE_A': 'A',
            'CHOICE_B': 'B',
            'CHOICE_C': 'C',
            'CHOICE_D': 'D'
        };
        return labels[answer] || answer;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/teacher/tests')}
                    className="mb-4"
                >
                    Quay lại
                </Button>
                <Title level={2} className="mb-2 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Quản lý câu hỏi
                </Title>
                {testInfo && (
                    <>
                        <Text strong className="text-lg block mb-1">{testInfo.title}</Text>
                        {testInfo.description && (
                            <Text type="secondary">{testInfo.description}</Text>
                        )}
                    </>
                )}
            </div>

            {/* Add Question Button */}
            <Card className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={4} className="mb-1">Danh sách câu hỏi</Title>
                        <Text type="secondary">Tổng số: {questions.length} câu hỏi</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                        size="large"
                    >
                        Thêm câu hỏi
                    </Button>
                </div>
            </Card>

            {/* Questions List */}
            {questions.length === 0 ? (
                <Card>
                    <Empty
                        description="Chưa có câu hỏi nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                            Thêm câu hỏi đầu tiên
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
                    dataSource={questions}
                    renderItem={(question, index) => (
                        <List.Item>
                            <Card
                                className="hover:shadow-lg transition-shadow"
                                actions={[
                                    <Button
                                        key="edit"
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => handleOpenModal(question)}
                                    >
                                        Sửa
                                    </Button>,
                                    <Popconfirm
                                        key="delete"
                                        title="Xóa câu hỏi"
                                        description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                                        onConfirm={() => handleDeleteQuestion(question.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />}>
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                ]}
                            >
                                <div className="mb-4">
                                    <Space>
                                        <Tag color="blue">Câu {index + 1}</Tag>
                                        <Tag color="green">Đáp án: {getAnswerLabel(question.answer)}</Tag>
                                    </Space>
                                </div>
                                <Title level={5} className="mb-3">{question.content}</Title>
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <Text strong className="mr-2 min-w-6">A.</Text>
                                        <Text className={question.answer === 'CHOICE_A' ? 'text-green-600 font-semibold' : ''}>
                                            {question.choiceA}
                                        </Text>
                                    </div>
                                    <div className="flex items-start">
                                        <Text strong className="mr-2 min-w-6">B.</Text>
                                        <Text className={question.answer === 'CHOICE_B' ? 'text-green-600 font-semibold' : ''}>
                                            {question.choiceB}
                                        </Text>
                                    </div>
                                    <div className="flex items-start">
                                        <Text strong className="mr-2 min-w-6">C.</Text>
                                        <Text className={question.answer === 'CHOICE_C' ? 'text-green-600 font-semibold' : ''}>
                                            {question.choiceC}
                                        </Text>
                                    </div>
                                    <div className="flex items-start">
                                        <Text strong className="mr-2 min-w-6">D.</Text>
                                        <Text className={question.answer === 'CHOICE_D' ? 'text-green-600 font-semibold' : ''}>
                                            {question.choiceD}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            {/* Question Form Modal */}
            <Modal
                title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                open={modalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitQuestion}
                    className="mt-4"
                >
                    <Form.Item
                        label="Nội dung câu hỏi"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập nội dung câu hỏi..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        label="Đáp án A"
                        name="choiceA"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án A' }]}
                    >
                        <Input placeholder="Nhập đáp án A..." maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        label="Đáp án B"
                        name="choiceB"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án B' }]}
                    >
                        <Input placeholder="Nhập đáp án B..." maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        label="Đáp án C"
                        name="choiceC"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án C' }]}
                    >
                        <Input placeholder="Nhập đáp án C..." maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        label="Đáp án D"
                        name="choiceD"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án D' }]}
                    >
                        <Input placeholder="Nhập đáp án D..." maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        label="Đáp án đúng"
                        name="answer"
                        rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng' }]}
                    >
                        <Radio.Group>
                            <Space direction="vertical">
                                <Radio value="CHOICE_A">A</Radio>
                                <Radio value="CHOICE_B">B</Radio>
                                <Radio value="CHOICE_C">C</Radio>
                                <Radio value="CHOICE_D">D</Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={handleCloseModal}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<SaveOutlined />}
                            >
                                {editingQuestion ? 'Cập nhật' : 'Thêm câu hỏi'}
                            </Button>
                        </Space>
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

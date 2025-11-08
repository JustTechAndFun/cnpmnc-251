import React, { useState } from "react";
import { Card, Typography, Modal, message, Alert, Spin, Input, Button, Space } from "antd";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { studentApi } from "../../apis";

const { Title, Text } = Typography;

interface QuestionForStudent {
  id: string;
  content: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
}

interface AnswerSubmission {
  questionId: string;
  submitAnswer: string;
}

export const MyExams: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();

  const [questions, setQuestions] = useState<QuestionForStudent[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [unanswered, setUnanswered] = useState<number>(0);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeEntered, setPasscodeEntered] = useState(false);
  const [loadingPasscode, setLoadingPasscode] = useState(false);
  const [testTitle, setTestTitle] = useState<string>("");
  const [actualTestId, setActualTestId] = useState<string>("");

  // Check if examId looks like a UUID (testId) or a passcode
  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const fetchQuestionsWithPasscode = async (passcodeValue: string, testIdValue?: string) => {
    setLoadingPasscode(true);
    try {
      let questionsData: QuestionForStudent[] = [];
      let testId = testIdValue || examId || "";
      let title = "";
      
      // If testIdValue is provided and looks like UUID, use old endpoint
      if (testIdValue && isUUID(testIdValue)) {
        const response = await studentApi.getExamQuestions(testIdValue, passcodeValue);
        if (!response.error && response.data) {
          questionsData = response.data;
          testId = testIdValue;
        } else {
          throw new Error(response.message || "Không thể tải câu hỏi");
        }
      } else {
        // Use new endpoint that accepts only passcode
        const response = await studentApi.joinExamByPasscode(passcodeValue);
        if (!response.error && response.data) {
          questionsData = response.data.questions;
          testId = response.data.testId;
          title = response.data.testTitle;
        } else {
          throw new Error(response.message || "Không thể tải câu hỏi");
        }
      }

      setQuestions(questionsData);
      setActualTestId(testId);
      setTestTitle(title || passcodeValue);
      setPasscodeEntered(true);
      message.success("Đã tải câu hỏi thành công!");
    } catch (error: any) {
      console.error("Failed to fetch questions", error);
      message.error(error.message || "Không thể kết nối đến server");
    } finally {
      setLoadingPasscode(false);
    }
  };

  const handlePasscodeSubmit = () => {
    const trimmedPasscode = passcode.trim().toUpperCase();
    if (!trimmedPasscode) {
      message.warning("Vui lòng nhập mã truy cập");
      return;
    }
    
    // If examId exists and looks like UUID, use it as testId
    if (examId && isUUID(examId)) {
      fetchQuestionsWithPasscode(trimmedPasscode, examId);
    } else {
      // examId might be a passcode from URL, or we just use the entered passcode
      const passcodeToUse = examId || trimmedPasscode;
      fetchQuestionsWithPasscode(passcodeToUse);
    }
  };

  const select = (questionId: string, choice: string) => {
    setSelected((s) => ({ ...s, [questionId]: choice }));
  };

  const handleOpenSubmit = () => {
    const count = questions.filter((q) => !selected[q.id]).length;
    setUnanswered(count);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (unanswered > 0) return;
    if (!auth?.user?.id) {
      message.error("Thông tin người dùng không hợp lệ");
      return;
    }
    
    // Use actualTestId if available, otherwise fall back to examId
    const testIdToSubmit = actualTestId || examId;
    if (!testIdToSubmit) {
      message.error("Không tìm thấy ID bài kiểm tra");
      return;
    }

    setLoading(true);
    try {
      const answers: AnswerSubmission[] = Object.entries(selected).map(([questionId, choice]) => ({
        questionId,
        submitAnswer: choice
      }));

      const response = await studentApi.submitExam(testIdToSubmit, auth.user.id, answers);

      if (!response.error) {
        message.success("Nộp bài thành công!");
        navigate("/student/grades");
      } else {
        throw new Error(response.message || "Không thể nộp bài");
      }
    } catch (err: any) {
      setErrorLog(err.message || "Unknown error");
      message.error("Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setShowModal(false);
      setLoading(false);
    }
  };

  // Show passcode input if not entered yet
  if (!passcodeEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <div className="text-center mb-6">
            <Title level={3}>Nhập mã truy cập</Title>
            <Text type="secondary">Vui lòng nhập mã truy cập để bắt đầu làm bài</Text>
          </div>
          <Space.Compact className="w-full">
            <Input
              size="large"
              placeholder="Nhập mã truy cập..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              onPressEnter={handlePasscodeSubmit}
              style={{ textTransform: 'uppercase' }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handlePasscodeSubmit}
              loading={loadingPasscode}
            >
              Xác nhận
            </Button>
          </Space.Compact>
        </Card>
      </div>
    );
  }

  if (loadingPasscode || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4">
      <Title level={3}>Bài thi {testTitle || examId || 'Không xác định'}</Title>

      {questions.map((q) => {
        const choices = [
          { key: 'CHOICE_A', label: 'A', text: q.choiceA },
          { key: 'CHOICE_B', label: 'B', text: q.choiceB },
          { key: 'CHOICE_C', label: 'C', text: q.choiceC },
          { key: 'CHOICE_D', label: 'D', text: q.choiceD }
        ];

        return (
          <Card
            key={q.id}
            className="w-full max-w-4xl shadow-sm"
            title={
              <div>
                <Title level={5} className="m-0!">
                  Câu hỏi
                </Title>
                <Text type="secondary">{q.content}</Text>
              </div>
            }
          >
            <div className="flex flex-col gap-2">
              {choices.map((choice) => {
                const checked = selected[q.id] === choice.key;
                return (
                  <label
                    key={choice.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer select-none transition
                    ${checked ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={checked}
                      onChange={() => select(q.id, choice.key)}
                    />
                    <span><strong>{choice.label}.</strong> {choice.text}</span>
                  </label>
                );
              })}
              <Alert
                className="mt-2"
                message={
                  selected[q.id]
                    ? `Đã chọn: ${choices.find(c => c.key === selected[q.id])?.label}`
                    : "Chưa trả lời"
                }
                type={selected[q.id] ? "success" : "warning"}
                showIcon
              />
            </div>
          </Card>
        );
      })}

      <Button
        type="primary"
        size="large"
        onClick={handleOpenSubmit}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Nộp bài
      </Button>

      <Modal
        title="Hoàn thành bài thi"
        open={showModal}
        onOk={handleSubmit}
        onCancel={() => setShowModal(false)}
        okText="Nộp bài"
        cancelText="Hủy"
        okButtonProps={{ danger: unanswered > 0, loading }}
      >
        {unanswered > 0 ? (
          <Alert
            type="error"
            message={`Bạn còn ${unanswered} câu chưa trả lời. Vui lòng hoàn thành trước khi nộp bài.`}
            showIcon
          />
        ) : (
          <p>Bạn có chắc chắn muốn nộp bài thi này không?</p>
        )}
      </Modal>

      <Modal
        title="Lỗi nộp bài"
        open={!!errorLog}
        onCancel={() => setErrorLog(null)}
        footer={null}
      >
        <pre className="text-red-500 whitespace-pre-wrap">{errorLog}</pre>
      </Modal>
    </div>
  );
};

export default MyExams;

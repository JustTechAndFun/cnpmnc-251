import React, { useEffect, useState } from "react";
import { Card, Typography, Modal, message, Alert, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

type Question = { id: number; questionText: string; options: string[] };

const mockQuestions: Question[] = [
  { id: 1, questionText: "What is 2 + 2?", options: ["3", "4", "5", "6"] },
  { id: 2, questionText: "Which language is used for styling web pages?", options: ["HTML", "CSS", "Python", "C++"] },
  { id: 3, questionText: "Which company developed TypeScript?", options: ["Facebook", "Google", "Microsoft", "Amazon"] },
  { id: 4, questionText: "What does 'JSX' stand for?", options: ["JavaScript XML", "JavaScript eXtensions", "Just Simple XML", "Java Small eXecute"] },
];

export const MyExams: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [unanswered, setUnanswered] = useState<number>(0);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const studentId = 1;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exams/${examId}/questions`);
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();
        setQuestions(Array.isArray(data) && data.length ? data : mockQuestions);
      } catch {
        setQuestions(mockQuestions);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [examId]);

  const select = (qid: number, idx: number) =>
    setSelected((s) => ({ ...s, [qid]: idx }));

  const handleOpenSubmit = () => {
    const count = questions.filter((q) => selected[q.id] == null).length;
    setUnanswered(count);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (unanswered > 0) return; // không cho submit khi còn câu chưa làm
    try {
      const payload = {
        examId,
        studentId,
        answers: Object.entries(selected).map(([id, idx]) => ({
          questionId: Number(id),
          selectedOption: idx,
        })),
      };
      const res = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      message.success("Exam submitted successfully");
      navigate("/student/grades");
    } catch (err: any) {
      setErrorLog(err.message || "Unknown error");
    } finally {
      setShowModal(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4">
      <Title level={3}>Exam {examId}</Title>

      {questions.map((q) => (
        <Card
          key={q.id}
          className="w-full max-w-4xl shadow-sm"
          title={
            <div>
              <Title level={5} className="!m-0">
                Question {q.id}
              </Title>
              <Text type="secondary">{q.questionText}</Text>
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const checked = selected[q.id] === i;
              return (
                <label
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer select-none transition
                  ${checked ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={checked}
                    onChange={() => select(q.id, i)}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
            <Alert
              className="mt-2"
              message={
                selected[q.id] != null
                  ? `Selected: ${q.options[selected[q.id]!]}`
                  : "Unanswered"
              }
              type={selected[q.id] != null ? "success" : "warning"}
              showIcon
            />
          </div>
        </Card>
      ))}

      <button
        onClick={handleOpenSubmit}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
      >
        Submit
      </button>

      <Modal
        title="Finish Exam"
        open={showModal}
        onOk={handleSubmit}
        onCancel={() => setShowModal(false)}
        okText="Submit"
        okButtonProps={{ danger: unanswered > 0 }}
      >
        {unanswered > 0 ? (
          <Alert
            type="error"
            message={`You still have ${unanswered} unanswered question(s). Please complete them before submitting.`}
            showIcon
          />
        ) : (
          <p>Are you sure you want to submit your exam?</p>
        )}
      </Modal>

      <Modal
        title="Submission Error Log"
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

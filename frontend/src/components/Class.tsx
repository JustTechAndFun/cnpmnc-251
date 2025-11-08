import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { teacherApi } from '../apis';
import type { ClassDto, StudentDto, TestDTO } from '../apis/teacherApi';
import { Spin, Alert, Empty, Button, Space, message } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import '../styles/class.css';

interface ClassInfo {
    id: string;
    name: string;
    description: string;
    totalStudents: number;
    totalTests: number;
}

export const ClassPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();
    const user = auth?.user;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [students, setStudents] = useState<StudentDto[]>([]);
    const [tests, setTests] = useState<TestDTO[]>([]);

    // Kiểm tra quyền truy cập
    if (!user || user.role !== Role.TEACHER) {
        return <Navigate to="/unauthorized" replace />;
    }

    useEffect(() => {
        if (classId) {
            loadClassData();
        }
    }, [classId]);

    const loadClassData = async () => {
        if (!classId) return;

        setLoading(true);
        setError(null);

        try {
            // Load class info
            const classInfoResponse = await teacherApi.getClassInfo(classId);
            if (!classInfoResponse.error && classInfoResponse.data) {
                const cls = classInfoResponse.data;
                setClassInfo({
                    id: cls.id,
                    name: cls.className,
                    description: `${cls.classCode} - Học kỳ ${cls.semester} năm ${cls.year}`,
                    totalStudents: cls.studentCount || 0,
                    totalTests: 0
                });
            } else {
                throw new Error(classInfoResponse.message || 'Failed to load class');
            }

            // Load students
            const studentsResponse = await teacherApi.getClassStudents(classId);
            if (!studentsResponse.error && studentsResponse.data) {
                setStudents(studentsResponse.data);
            } else {
                console.warn('Failed to load students:', studentsResponse.message);
                setStudents([]);
            }

            // Load tests
            const testsResponse = await teacherApi.getTestsInClass(classId);
            if (!testsResponse.error && testsResponse.data) {
                setTests(testsResponse.data);
                setClassInfo(prev => prev ? { ...prev, totalTests: testsResponse.data.length } : null);
            } else {
                console.warn('Failed to load tests:', testsResponse.message);
                setTests([]);
            }
        } catch (err: any) {
            console.error('Failed to load class data:', err);
            setError(err.message || 'Không thể tải thông tin lớp học');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = () => {
        navigate(`/teacher/classes/${classId}`);
        message.info('Chức năng thêm sinh viên. Vui lòng sử dụng trang quản lý lớp học.');
    };

    const handleCreateTest = () => {
        navigate('/teacher/tests/create', {
            state: { preselectedClassId: classId }
        });
    };

    const handleTestClick = (testId: string) => {
        navigate(`/teacher/tests/${testId}`);
    };

    // Loading state
    if (loading) {
        return (
            <div className="class-container">
                <div className="flex flex-col items-center justify-center py-32">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-600">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="class-container">
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    action={
                        <Space>
                            <Button size="small" type="primary" onClick={loadClassData} icon={<ReloadOutlined />}>
                                Thử lại
                            </Button>
                        </Space>
                    }
                />
            </div>
        );
    }

    // Empty state
    if (!classInfo) {
        return (
            <div className="class-container">
                <Empty
                    description="Không tìm thấy thông tin lớp học"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate('/teacher/classes')}>
                        Quay lại danh sách lớp
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="class-container">
            {/* Thông tin lớp học */}
            <div className="class-header">
                <div className="class-info">
                    <h1>{classInfo.name}</h1>
                    <p className="description">{classInfo.description}</p>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-label">Tổng số sinh viên:</span>
                            <span className="stat-value">{classInfo.totalStudents}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Tổng số bài kiểm tra:</span>
                            <span className="stat-value">{classInfo.totalTests}</span>
                        </div>
                    </div>
                </div>
                <button className="create-test-btn" onClick={handleCreateTest}>
                    Tạo bài kiểm tra mới
                </button>
            </div>

            {/* Danh sách sinh viên */}
            <div className="section">
                <div className="section-header">
                    <h2>Danh sách sinh viên</h2>
                    <button className="add-student-btn" onClick={handleAddStudent}>
                        Thêm sinh viên
                    </button>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Họ và tên</th>
                                <th>Email</th>
                                <th>MSSV</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">
                                        <Empty description="Chưa có sinh viên nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    </td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.studentId || '-'}</td>
                                        <td>
                                            <span className="status active">Active</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Danh sách bài kiểm tra */}
            <div className="section">
                <h2>Danh sách bài kiểm tra</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tên bài kiểm tra</th>
                                <th>Ngày tạo</th>
                                <th>Thời gian (phút)</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">
                                        <Empty description="Chưa có bài kiểm tra nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    </td>
                                </tr>
                            ) : (
                                tests.map(test => (
                                    <tr key={test.id} onClick={() => handleTestClick(test.id)} className="clickable-row">
                                        <td>{test.name}</td>
                                        <td>{new Date(test.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>{test.duration}</td>
                                        <td>
                                            <span className="status completed">Completed</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassPage;

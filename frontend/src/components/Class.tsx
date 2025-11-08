import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import '../styles/class.css';

interface Student {
    id: string;
    name: string;
    email: string;
    studentId: string;
    status: 'Active' | 'Inactive';
}

interface Test {
    id: string;
    title: string;
    createdAt: string;
    duration: number;
    status: 'Upcoming' | 'In Progress' | 'Completed';
}

interface ClassInfo {
    id: string;
    name: string;
    description: string;
    totalStudents: number;
    totalTests: number;
}

export const ClassPage = () => {
    const auth = useAuth();
    const user = auth?.user;
    const classInfo = {
        id: '1',
        name: 'Công nghệ phần mềm nâng cao',
        description: 'Lớp học về các kỹ thuật phát triển phần mềm hiện đại',
        totalStudents: 35,
        totalTests: 5
    };

    const students = [
        {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            studentId: 'ST001',
            status: 'Active'
        },
        // Thêm dữ liệu mẫu khác ở đây
    ]

    const tests = [
        {
            id: '1',
            title: 'Kiểm tra giữa kỳ',
            createdAt: '2025-10-15',
            duration: 90,
            status: 'Completed'
        }
        // Thêm dữ liệu mẫu khác ở đây
    ];

    // Kiểm tra quyền truy cập
    if (!user || user.role !== Role.TEACHER) {
        return <Navigate to="/unauthorized" replace />;
    }

    const handleAddStudent = () => {
        // Xử lý thêm sinh viên
        console.log('Add student clicked');
    };

    const handleCreateTest = () => {
        // Xử lý tạo bài kiểm tra mới
        console.log('Create test clicked');
    };

    const handleTestClick = (testId: string) => {
        // Điều hướng đến trang chi tiết bài kiểm tra
        console.log(`Navigate to test ${testId}`);
    };

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
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.studentId}</td>
                                    <td>
                                        <span className={`status ${student.status.toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
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
                            {tests.map(test => (
                                <tr key={test.id} onClick={() => handleTestClick(test.id)} className="clickable-row">
                                    <td>{test.title}</td>
                                    <td>{test.createdAt}</td>
                                    <td>{test.duration}</td>
                                    <td>
                                        <span className={`status ${test.status.toLowerCase().replace(' ', '-')}`}>
                                            {test.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassPage;

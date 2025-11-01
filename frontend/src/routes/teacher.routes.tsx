import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { ManageAssignments } from '../pages/teacher/ManageAssignments';
import { GradeStudents } from '../pages/teacher/GradeStudents';
import { ClassPage } from '../pages/teacher/Class';
import { TestDetail } from '../pages/teacher/TestDetail';

export const teacherRoutes: RouteObject[] = [
    {
        path: '/teacher',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <TeacherDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/classes',
        element: (
            <ProtectedRoute allowedRoles={[Role.TEACHER]}>
                <ClassPage />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/assignments',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <ManageAssignments />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/grades',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <GradeStudents />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/classes/:classId',
        element: (
            <ProtectedRoute allowedRoles={[Role.TEACHER]}>
                <ClassPage />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/tests/:testId',
        element: (
            <ProtectedRoute allowedRoles={[Role.TEACHER]}>
                <TestDetail />
            </ProtectedRoute>
        )
    }
];

import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { ManageClasses } from '../pages/teacher/ManageClasses';
import { ManageAssignments } from '../pages/teacher/ManageAssignments';
import { GradeStudents } from '../pages/teacher/GradeStudents';
import { TestManagement } from '../pages/teacher/TestManagement';

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
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <ManageClasses />
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
        path: '/teacher/tests',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <TestManagement />
            </ProtectedRoute>
        )
    }
];

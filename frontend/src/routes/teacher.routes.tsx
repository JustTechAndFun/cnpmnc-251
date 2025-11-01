import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherLayout } from '../components/TeacherLayout';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { ManageClasses } from '../pages/teacher/ManageClasses';
import { ManageAssignments } from '../pages/teacher/ManageAssignments';
import { GradeStudents } from '../pages/teacher/GradeStudents';

export const teacherRoutes: RouteObject[] = [
    {
        path: '/teacher',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <TeacherLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <TeacherDashboard />
            },
            {
                path: 'classes',
                element: <ManageClasses />
            },
            {
                path: 'assignments',
                element: <ManageAssignments />
            },
            {
                path: 'grades',
                element: <GradeStudents />
            }
        ]
    }
];

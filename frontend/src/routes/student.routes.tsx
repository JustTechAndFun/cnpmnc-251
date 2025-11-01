import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { MyCourses } from '../pages/student/MyCourses';
import { MyAssignments } from '../pages/student/MyAssignments';
import { MyGrades } from '../pages/student/MyGrades';

export const studentRoutes: RouteObject[] = [
    {
        path: '/student',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}>
                <StudentDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: '/student/courses',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}>
                <MyCourses />
            </ProtectedRoute>
        )
    },
    {
        path: '/student/assignments',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}>
                <MyAssignments />
            </ProtectedRoute>
        )
    },
    {
        path: '/student/grades',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}>
                <MyGrades />
            </ProtectedRoute>
        )
    }
];

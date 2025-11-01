import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { StudentLayout } from '../components/StudentLayout';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { MyCourses } from '../pages/student/MyCourses';
import { MyAssignments } from '../pages/student/MyAssignments';
import { MyGrades } from '../pages/student/MyGrades';
import { ProfilePage } from '../pages/ProfilePage';

export const studentRoutes: RouteObject[] = [
    {
        path: '/student',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}>
                <StudentLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <StudentDashboard />
            },
            {
                path: 'courses',
                element: <MyCourses />
            },
            {
                path: 'assignments',
                element: <MyAssignments />
            },
            {
                path: 'grades',
                element: <MyGrades />
            },
            {
                path: 'profile',
                element: <ProfilePage />
            }
        ]
    }
];

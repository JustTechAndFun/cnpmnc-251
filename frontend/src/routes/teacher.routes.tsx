import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherLayout } from '../components/TeacherLayout';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { ManageAssignments } from '../pages/teacher/ManageAssignments';
import { ClassPage } from '../pages/teacher/Class';
import { TestDetail } from '../pages/teacher/TestDetail';
import { TestManagement } from '../pages/teacher/TestManagement';
import { CreateClass } from '../pages/teacher/CreateClass';
import { CreateTest } from '../pages/teacher/CreateTest';
import { ManageClasses } from '../pages/teacher/ManageClasses';
import { ProfilePage } from '../pages/ProfilePage';
import { TestResults } from '../pages/teacher/TestResults';

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
                path: 'classes/create',
                element: <CreateClass />
            },
            {
                path: 'classes/:classId',
                element: <ClassPage />
            },
            {
                path: 'assignments',
                element: <ManageAssignments />
            },
            {
                path: 'tests',
                element: <TestManagement />
            },
            {
                path: 'tests/create',
                element: <CreateTest />
            },
            {
                path: 'tests/:testId',
                element: <TestDetail />
            },
            {
                path: 'tests/:testId/results',
                element: <TestResults />
            },
            {
                path: 'profile',
                element: <ProfilePage />
            }
        ]
    }
];

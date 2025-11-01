import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Teacher pages
const TeacherDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Teacher Dashboard</h1></div>;
const ManageClasses = () => <div className="p-6"><h1 className="text-2xl font-bold">Manage Classes</h1></div>;
const ManageAssignments = () => <div className="p-6"><h1 className="text-2xl font-bold">Manage Assignments</h1></div>;
const GradeStudents = () => <div className="p-6"><h1 className="text-2xl font-bold">Grade Students</h1></div>;

export const teacherRoutes: RouteObject[] = [
    {
        path: '/teacher',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
                <div className="min-h-screen bg-gray-50">
                    <nav className="bg-blue-600 text-white p-4 mb-4">
                        <h2 className="text-xl font-bold">Teacher Portal</h2>
                    </nav>
                    <div className="container mx-auto">
                        <TeacherDashboard />
                    </div>
                </div>
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
    }
];

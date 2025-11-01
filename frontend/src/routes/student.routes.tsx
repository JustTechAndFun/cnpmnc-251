import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Student pages
const StudentDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Student Dashboard</h1></div>;
const MyCourses = () => <div className="p-6"><h1 className="text-2xl font-bold">My Courses</h1></div>;
const MyAssignments = () => <div className="p-6"><h1 className="text-2xl font-bold">My Assignments</h1></div>;
const MyGrades = () => <div className="p-6"><h1 className="text-2xl font-bold">My Grades</h1></div>;

export const studentRoutes: RouteObject[] = [
    {
        path: '/student',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}>
                <div className="min-h-screen from-blue-50 to-indigo-50">
                    <nav className="bg-indigo-600 text-white p-4 mb-4">
                        <h2 className="text-xl font-bold">Student Portal</h2>
                    </nav>
                    <div className="container mx-auto">
                        <StudentDashboard />
                    </div>
                </div>
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

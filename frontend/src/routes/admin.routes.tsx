import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Admin pages
const AdminDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Admin Dashboard</h1></div>;
const UserManagement = () => <div className="p-6"><h1 className="text-2xl font-bold">User Management</h1></div>;
const SystemSettings = () => <div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1></div>;

export const adminRoutes: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <div className="min-h-screen bg-gray-100">
                    <nav className="bg-white shadow-sm p-4 mb-4">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                    </nav>
                    <div className="container mx-auto">
                        <AdminDashboard />
                    </div>
                </div>
            </ProtectedRoute>
        )
    },
    {
        path: '/admin/users',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <UserManagement />
            </ProtectedRoute>
        )
    },
    {
        path: '/admin/settings',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <SystemSettings />
            </ProtectedRoute>
        )
    }
];

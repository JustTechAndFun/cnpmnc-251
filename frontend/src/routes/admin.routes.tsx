import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserList } from '../pages/admin/UserList';
import { UserDetail } from '../pages/admin/UserDetail';

export const adminRoutes: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AdminDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: '/admin/users',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <UserList />
            </ProtectedRoute>
        )
    },
    {
        path: '/admin/users/:id',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <UserDetail />
            </ProtectedRoute>
        )
    }
];

import { type RouteObject } from 'react-router';
import { Role } from '../types';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserList } from '../pages/admin/UserList';
import { UserDetail } from '../pages/admin/UserDetail';
import { ProfilePage } from '../pages/ProfilePage';

export const adminRoutes: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <AdminDashboard />
            },
            {
                path: 'users',
                element: <UserList />
            },
            {
                path: 'users/:id',
                element: <UserDetail />
            },
            {
                path: 'profile',
                element: <ProfilePage />
            }
        ]
    }
];

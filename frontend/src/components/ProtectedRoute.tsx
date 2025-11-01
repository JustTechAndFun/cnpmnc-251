import { type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: Role[];
    requireAuth?: boolean;
}

export const ProtectedRoute = ({
    children,
    allowedRoles,
    requireAuth = true
}: ProtectedRouteProps) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

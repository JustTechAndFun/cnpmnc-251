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
    const auth = useAuth();
    const user = auth?.user ?? null;
    const loading = auth?.loading ?? false;
    const isAuthenticated = auth?.isAuthenticated ?? false;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Skip auth check in development mode
    const isDevMode = import.meta.env.DEV;
    
    if (requireAuth && !isAuthenticated && !isDevMode) {
        return <Navigate to="/login" replace />;
    }

    // In dev mode, skip role check to allow testing different roles
    // In production, check role permissions
    if (!isDevMode && allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

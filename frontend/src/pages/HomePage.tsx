import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

export const HomePage = () => {
    const auth = useAuth();
    const user = auth?.user ?? null;
    const isAuthenticated = auth?.isAuthenticated ?? false;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
        case Role.ADMIN:
            return <Navigate to="/admin" replace />;
        case Role.TEACHER:
            return <Navigate to="/teacher" replace />;
        case Role.STUDENT:
            return <Navigate to="/student" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};


import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { Role, type User, type AuthContextType, type ApiResponse } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get<ApiResponse<{
                email: string;
                name: string;
                picture: string;
                authorities: Array<{ authority: string }>;
            }>>(`${API_BASE_URL}/api/user/info`, {
                withCredentials: true
            });

            if (!response.data.error && response.data.data) {
                const userData = response.data.data;
                const role = userData.authorities[0]?.authority as Role;

                setUser({
                    id: userData.email,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    role: role,
                    activate: true
                });
            }
        } catch (error) {
            console.error('Not authenticated', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/logout`, {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            window.location.href = '/';
        }
    };

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
                hasRole
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

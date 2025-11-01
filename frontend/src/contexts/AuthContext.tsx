import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { Role, type User, type AuthContextType, type ApiResponse } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000/authenticate';

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
                role: string;
            }>>(`${API_BASE_URL}/api/auth/user`, {
                withCredentials: true
            });

            if (!response.data.error && response.data.data) {
                const userData = response.data.data;
                setUser({
                    id: userData.email,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    role: userData.role as Role,
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
        // Build Google OAuth2 authorization URL - redirect to FRONTEND
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_REDIRECT_URI, // Frontend callback URL
            response_type: 'code',
            scope: 'email openid profile',
            access_type: 'offline',
            prompt: 'consent'
        });
        console.log(params.toString())
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    };

    const handleCallback = async (code: string) => {
        try {
            const response = await axios.post<ApiResponse<{
                email: string;
                name: string;
                picture: string;
                role: string;
            }>>(`${API_BASE_URL}/api/auth/google/callback`, {
                code,
                redirectUri: GOOGLE_REDIRECT_URI
            }, {
                withCredentials: true
            });

            if (!response.data.error && response.data.data) {
                const userData = response.data.data;
                setUser({
                    id: userData.email,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    role: userData.role as Role,
                    activate: true
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Callback error', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
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
                hasRole,
                handleCallback
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

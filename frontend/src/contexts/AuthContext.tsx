import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { Role, type User, type AuthContextType, type ApiResponse } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://cnpmnc-251.vercel.app/authenticate';

const USER_KEY = 'user_data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const isDevMode = import.meta.env.DEV;

        try {
            // Check if user exists in localStorage
            const storedUser = localStorage.getItem(USER_KEY);

            // If user exists, set user from localStorage first (for immediate UI update)
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // In dev mode, skip API call if we have stored user (especially fake users)
                    if (isDevMode) {
                        // Check if it's a fake user (has 'fake-' prefix in id)
                        if (parsedUser.id?.startsWith('fake-')) {
                            setLoading(false);
                            return; // Don't make API call for fake users
                        }
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing stored user data', e);
                }
            }

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
                const userObject = {
                    id: userData.email,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    role: userData.role as Role,
                    activate: true
                };

                setUser(userObject);

                // Save user data to localStorage
                localStorage.setItem(USER_KEY, JSON.stringify(userObject));
            } else {
                // Clear invalid data
                localStorage.removeItem(USER_KEY);
                setUser(null);
            }
        } catch (error) {
            console.error('Not authenticated', error);
            // In dev mode, don't clear user data to allow bypassing login
            if (!isDevMode) {
                // Clear invalid data on error
                localStorage.removeItem(USER_KEY);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };


    const hasRole = useCallback((roles: Role | Role[]): boolean => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    }, [user]);

    const loginCallback = useCallback(() => {
        // Build Google OAuth2 authorization URL
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID || '',
            redirect_uri: GOOGLE_REDIRECT_URI,
            response_type: 'code',
            scope: 'email openid profile',
            access_type: 'offline',
            prompt: 'consent'
        });
        console.log(params.toString())
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }, []);

    const handleCallbackMemo = useCallback(async (code: string) => {
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
                const userObject = {
                    id: userData.email,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    role: userData.role as Role,
                    activate: true
                };

                setUser(userObject);

                // Save user data to localStorage
                localStorage.setItem(USER_KEY, JSON.stringify(userObject));

                return true;
            }
            return false;
        } catch (error) {
            console.error('Callback error', error);
            // Clear any partial data on error
            localStorage.removeItem(USER_KEY);
            return false;
        }
    }, []);

    const logoutCallback = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            // Clear all stored data
            localStorage.removeItem(USER_KEY);
            setUser(null);
            // Small delay to show loading, then redirect to login page
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        }
    }, []);

    const fakeLoginCallback = useCallback((role: Role = Role.ADMIN) => {
        const fakeUsers: Record<string, User> = {
            [Role.ADMIN]: {
                id: 'fake-admin-1',
                email: 'admin@test.com',
                name: 'Admin Test',
                role: Role.ADMIN,
                activate: true,
                picture: 'https://ui-avatars.com/api/?name=Admin+Test&background=667eea&color=fff'
            },
            [Role.TEACHER]: {
                id: 'fake-teacher-1',
                email: 'teacher@test.com',
                name: 'Teacher Test',
                role: Role.TEACHER,
                activate: true,
                picture: 'https://ui-avatars.com/api/?name=Teacher+Test&background=a855f7&color=fff'
            },
            [Role.STUDENT]: {
                id: 'fake-student-1',
                email: 'student@test.com',
                name: 'Student Test',
                role: Role.STUDENT,
                activate: true,
                picture: 'https://ui-avatars.com/api/?name=Student+Test&background=10b981&color=fff'
            }
        };

        const fakeUser = fakeUsers[role];

        setUser(fakeUser);
        localStorage.setItem(USER_KEY, JSON.stringify(fakeUser));

        // Redirect to appropriate dashboard based on role
        let redirectPath = '/dashboard';
        switch (role) {
            case Role.ADMIN:
                redirectPath = '/admin';
                break;
            case Role.TEACHER:
                redirectPath = '/teacher';
                break;
            case Role.STUDENT:
                redirectPath = '/student';
                break;
        }

        window.location.href = redirectPath;
    }, []);

    const contextValue = useMemo(() => ({
        user,
        loading,
        isLoggingOut,
        login: loginCallback,
        logout: logoutCallback,
        isAuthenticated: !!user,
        hasRole,
        handleCallback: handleCallbackMemo,
        fakeLogin: fakeLoginCallback // Expose fakeLogin in dev mode
    }), [user, loading, isLoggingOut, loginCallback, logoutCallback, hasRole, handleCallbackMemo, fakeLoginCallback]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType | null => {
    const context = useContext(AuthContext);
    // Return null instead of throwing error to prevent crashes
    // Components should handle null case gracefully
    if (context === undefined) {
        console.warn('useAuth must be used within an AuthProvider');
        return null;
    }
    return context;
};

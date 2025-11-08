import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { Role, type User, type AuthContextType } from '../types';
import { authApi } from '../apis';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

                    // In dev mode, skip API call ONLY for fake users
                    if (isDevMode && parsedUser.id?.startsWith('fake-')) {
                        setUser(parsedUser);
                        setLoading(false);
                        return; // Don't make API call for fake users
                    }

                    // For real users, optimistically set user but still verify with backend
                    setUser(parsedUser);
                } catch (e) {
                    console.error('Error parsing stored user data', e);
                }
            }

            // Always verify session with backend (except for fake users)
            // Backend will check JSESSIONID cookie automatically
            const response = await authApi.getCurrentUser();

            if (!response.error && response.data) {
                const userData = response.data;
                const userObject = {
                    id: userData.email,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                    role: userData.role as Role,
                    activate: true
                };

                setUser(userObject);

                // Save user data to localStorage for offline access
                localStorage.setItem(USER_KEY, JSON.stringify(userObject));
            } else {
                // Session invalid or expired - clear data
                localStorage.removeItem(USER_KEY);
                setUser(null);
            }
        } catch (error) {
            console.error('Not authenticated', error);
            // Session expired or network error - clear data
            localStorage.removeItem(USER_KEY);
            setUser(null);
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
            const response = await authApi.handleGoogleCallback(code, GOOGLE_REDIRECT_URI);

            if (!response.error && response.data) {
                const userData = response.data;
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
            // Call logout API
            await authApi.logout();

            // Clear all stored data
            localStorage.removeItem(USER_KEY);
            setUser(null);

            // Small delay to show loading animation
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            console.error('Logout error', error);

            // Even if API fails, still clear local data
            localStorage.removeItem(USER_KEY);
            setUser(null);

            // Small delay
            await new Promise(resolve => setTimeout(resolve, 800));
        } finally {
            setIsLoggingOut(false);

            // Use window.location for full page reload to ensure clean state
            window.location.href = '/login';
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

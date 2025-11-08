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
        try {
            // Check if user exists in localStorage
            const storedUser = localStorage.getItem(USER_KEY);

            // If user exists, set user from localStorage first (for immediate UI update)
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (e) {
                    console.error('Error parsing stored user data', e);
                }
            }

            // Always verify session with backend
            // Backend will check JSESSIONID cookie (with 30-day max-age) automatically
            const response = await authApi.getCurrentUser();

            console.log('[Auth] getCurrentUser response:', {
                error: response.error,
                hasData: !!response.data,
                message: response.message
            });

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
                console.log('[Auth] No valid session found, clearing data');
                localStorage.removeItem(USER_KEY);
                setUser(null);
            }
        } catch (error) {
            console.error('[Auth] Authentication check failed:', error);
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
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_REDIRECT_URI,
            response_type: 'code',
            scope: 'email openid profile',
            access_type: 'offline',
            prompt: 'consent'
        });
        console.log(params.toString())
        globalThis.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }, []);

    const handleCallbackMemo = useCallback(async (code: string) => {
        try {
            console.log('[Auth] Processing callback with code:', code.substring(0, 10) + '...');

            const response = await authApi.handleGoogleCallback(code, GOOGLE_REDIRECT_URI);

            console.log('[Auth] Callback response:', {
                error: response.error,
                hasData: !!response.data,
                message: response.message
            });

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

                // Log cookies after successful login (dev only)
                if (import.meta.env.DEV) {
                    console.log('[Auth] Login successful. JSESSIONID cookie maintained with 30-day max-age');
                    console.log('[Auth] Current cookies:', document.cookie);
                    console.log('[Auth] User data saved to localStorage');
                }

                return true;
            }

            console.error('[Auth] Callback failed:', response.message);
            return false;
        } catch (error) {
            console.error('[Auth] Callback error:', error);
            // Clear any partial data on error
            localStorage.removeItem(USER_KEY);
            return false;
        }
    }, []);

    const logoutCallback = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            // Call logout API to invalidate backend session and clear JSESSIONID cookie
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

            // Use globalThis.location for full page reload to ensure clean state
            globalThis.location.href = '/login';
        }
    }, []);

    const contextValue = useMemo(() => ({
        user,
        loading,
        isLoggingOut,
        login: loginCallback,
        logout: logoutCallback,
        isAuthenticated: !!user,
        hasRole,
        handleCallback: handleCallbackMemo
    }), [user, loading, isLoggingOut, loginCallback, logoutCallback, hasRole, handleCallbackMemo]);

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

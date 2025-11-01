import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const { handleCallback, isAuthenticated } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Authentication failed. Please try again.');
                setProcessing(false);
                return;
            }

            if (!code) {
                setError('No authorization code received.');
                setProcessing(false);
                return;
            }

            const success = await handleCallback(code);
            if (!success) {
                setError('Failed to authenticate. Please try again.');
            }
            setProcessing(false);
        };

        processCallback();
    }, [searchParams, handleCallback]);

    if (processing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
                    <p className="text-gray-600">Please wait while we sign you in.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a
                        href="/login"
                        className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </a>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
};

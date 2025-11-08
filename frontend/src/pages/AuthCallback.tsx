import { useEffect, useState, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const auth = useAuth();
    const handleCallback = auth?.handleCallback;
    const isAuthenticated = auth?.isAuthenticated ?? false;
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(true);
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple calls
        if (hasProcessed.current) return;
        hasProcessed.current = true;

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

            if (!handleCallback) {
                setError('Authentication handler not available.');
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
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-white/20">
                    <div className="relative inline-flex items-center justify-center mb-6">
                        <div className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-blue-400 opacity-20"></div>
                        <div className="relative inline-flex rounded-full h-16 w-16 bg-to-br from-blue-500 to-indigo-600 items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác thực...</h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                    <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full animate-progress"></div>
                    </div>
                    <style>{`
                        @keyframes progress {
                            0% { width: 0%; }
                            50% { width: 70%; }
                            100% { width: 100%; }
                        }
                        .animate-progress {
                            animation: progress 2s ease-in-out infinite;
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-to-br from-red-50 via-orange-50 to-yellow-50">
                <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-white/20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Lỗi xác thực</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <a
                        href="/login"
                        className="inline-block bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Thử lại
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

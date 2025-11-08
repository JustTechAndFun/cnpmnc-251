export const UnauthorizedPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-8">Bạn không có quyền truy cập trang này.</p>
            <a
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
                Về trang chủ
            </a>
        </div>
    </div>
);


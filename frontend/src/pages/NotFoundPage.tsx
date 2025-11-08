export const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-white/20">
            <div className="mb-6">
                <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 mb-2">404</h1>
                <div className="w-24 h-1 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Trang không tồn tại</h2>
            <p className="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <a
                href="/"
                className="inline-block bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
                Về trang chủ
            </a>
        </div>
    </div>
);


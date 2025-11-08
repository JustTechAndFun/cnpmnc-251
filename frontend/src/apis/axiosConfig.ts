import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: This enables sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // You can add additional headers here if needed
        // For example, CSRF tokens or other custom headers
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status
            const { status } = error.response;

            if (status === 401) {
                // Unauthorized - redirect to login if needed
                console.error('Unauthorized access - please login again');
                // You can dispatch a logout action here if needed
            } else if (status === 403) {
                // Forbidden
                console.error('Access forbidden');
            } else if (status === 404) {
                console.error('Resource not found');
            } else if (status >= 500) {
                console.error('Server error');
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from server');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

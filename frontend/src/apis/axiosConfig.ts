import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
        // Check if session is about to expire (within 7 days) and refresh it
        const expiryTime = localStorage.getItem('auth_expiry');
        const authTimestamp = localStorage.getItem('auth_timestamp');
        
        if (expiryTime && authTimestamp) {
            const now = Date.now();
            const expiry = parseInt(expiryTime);
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            
            // If session expires in less than 7 days, refresh the timestamps
            if (expiry - now < sevenDaysInMs && expiry > now) {
                const newExpiry = now + (30 * 24 * 60 * 60 * 1000); // Reset to 30 days
                localStorage.setItem('auth_expiry', newExpiry.toString());
                localStorage.setItem('auth_timestamp', now.toString());
                
                if (import.meta.env.DEV) {
                    console.log('[API] Session refreshed. New expiry:', new Date(newExpiry).toLocaleString());
                }
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Log cookies for debugging (only in development)
        if (import.meta.env.DEV) {
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                console.log('[API] Received Set-Cookie header:', setCookieHeader);
            }

            // Log all cookies currently in browser
            if (typeof document !== 'undefined') {
                console.log('[API] Current browser cookies:', document.cookie);
            }
        }

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
                // Clear any stale data
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('user_data');
                }
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

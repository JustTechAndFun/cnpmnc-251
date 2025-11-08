// Central export file for all API modules
export * as authApi from './authApi';
export * as profileApi from './profileApi';
export * as adminApi from './adminApi';
export * as teacherApi from './teacherApi';
export * as studentApi from './studentApi';

// Re-export the axios client for direct use if needed
export { default as apiClient } from './axiosConfig';

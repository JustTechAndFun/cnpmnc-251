import apiClient from './axiosConfig';
import type { ApiResponse, Profile } from '../types';

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ApiResponse<Profile>> => {
    const response = await apiClient.get<ApiResponse<Profile>>('/api/profile');
    return response.data;
};

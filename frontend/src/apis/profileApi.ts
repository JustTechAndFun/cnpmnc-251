import apiClient from './axiosConfig';
import type { ApiResponse, Profile } from '../types';

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ApiResponse<Profile>> => {
    const response = await apiClient.get<ApiResponse<Profile>>('/api/profile');
    return response.data;
};

/**
 * Update current user's profile
 * @param data - Profile data to update (studentId)
 */
export const updateProfile = async (data: { studentId: string }): Promise<ApiResponse<Profile>> => {
    const response = await apiClient.put<ApiResponse<Profile>>('/api/profile', data);
    return response.data;
};

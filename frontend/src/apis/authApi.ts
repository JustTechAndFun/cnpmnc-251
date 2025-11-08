import apiClient from './axiosConfig';
import type { ApiResponse } from '../types';

export interface GoogleCallbackRequest {
    code: string;
    redirectUri: string;
}

export interface UserDto {
    email: string;
    name: string;
    picture: string;
    role: string;
}

/**
 * Handle Google OAuth2 callback
 * @param code - Authorization code from Google
 * @param redirectUri - Redirect URI used in OAuth flow
 */
export const handleGoogleCallback = async (code: string, redirectUri: string): Promise<ApiResponse<UserDto>> => {
    const response = await apiClient.post<ApiResponse<UserDto>>('/api/auth/google/callback', {
        code,
        redirectUri,
    });
    return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<ApiResponse<UserDto>> => {
    const response = await apiClient.get<ApiResponse<UserDto>>('/api/auth/user');
    return response.data;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/auth/logout');
    return response.data;
};

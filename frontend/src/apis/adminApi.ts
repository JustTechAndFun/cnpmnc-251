import apiClient from './axiosConfig';
import type { ApiResponse } from '../types';

export interface UserDto {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
    activate: boolean;
}

export interface ClassDto {
    id: string;
    className: string;
    classCode: string;
    teacherId: string;
    teacherName: string;
    semester: string;
    year: number;
    studentCount?: number;
}

export interface CreateClassRequest {
    className: string;
    classCode: string;
    teacherId: string;
    semester: string;
    year: number;
}

export interface TeacherDto {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
    activate: boolean;
}

export interface CreateTeacherRequest {
    name: string;
    email: string;
    department?: string;
    activate?: boolean;
}

/**
 * Get all users with optional filters
 * @param mail - Search by email (partial match)
 * @param activate - Filter by activation status
 */
export const getAllUsers = async (mail?: string, activate?: boolean): Promise<ApiResponse<UserDto[]>> => {
    const params: Record<string, string | boolean> = {};
    if (mail !== undefined) params.mail = mail;
    if (activate !== undefined) params.activate = activate;

    const response = await apiClient.get<ApiResponse<UserDto[]>>('/api/admin/users', { params });
    return response.data;
};

/**
 * Create a new class
 * @param request - Class creation request data
 */
export const createClass = async (request: CreateClassRequest): Promise<ApiResponse<ClassDto>> => {
    const response = await apiClient.post<ApiResponse<ClassDto>>('/api/admin/classes', request);
    return response.data;
};

/**
 * Get all classes
 */
export const getAllClasses = async (): Promise<ApiResponse<ClassDto[]>> => {
    const response = await apiClient.get<ApiResponse<ClassDto[]>>('/api/admin/classes');
    return response.data;
};

/**
 * Delete a class
 * @param id - Class ID
 */
export const deleteClass = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/admin/classes/${id}`);
    return response.data;
};

/**
 * Get all teachers with optional filters
 * @param mail - Search by email (partial match)
 * @param activate - Filter by activation status
 */
export const getAllTeachers = async (mail?: string, activate?: boolean): Promise<ApiResponse<TeacherDto[]>> => {
    const params: Record<string, string | boolean> = {};
    if (mail !== undefined) params.mail = mail;
    if (activate !== undefined) params.activate = activate;

    const response = await apiClient.get<ApiResponse<TeacherDto[]>>('/api/admin/users/teachers', { params });
    return response.data;
};

/**
 * Create a new teacher account
 * @param request - Teacher account data
 */
export const createTeacherAccount = async (request: CreateTeacherRequest): Promise<ApiResponse<TeacherDto>> => {
    const response = await apiClient.post<ApiResponse<TeacherDto>>('/api/admin/users/teachers', request);
    return response.data;
};

/**
 * Delete a teacher
 * @param id - Teacher ID
 */
export const deleteTeacher = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/admin/users/teachers/${id}`);
    return response.data;
};

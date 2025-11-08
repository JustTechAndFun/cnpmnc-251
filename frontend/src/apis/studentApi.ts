import apiClient from './axiosConfig';
import type { ApiResponse } from '../types';

export interface ClassDto {
    id: string;
    className: string;
    classCode: string;
    teacherId: string;
    teacherName: string;
    semester: string;
    year: number;
}

export interface TestDTO {
    id: string;
    name: string;
    description?: string;
    duration: number;
    passcode?: string;
    classId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TestDetail extends TestDTO {
    questions?: Array<{
        id: string;
        content: string;
        questionType: string;
        options?: string[];
        correctAnswer: string | string[];
        points: number;
        order: number;
    }>;
}

/**
 * Get student's enrolled classes
 */
export const getMyClasses = async (): Promise<ApiResponse<ClassDto[]>> => {
    // Note: This endpoint needs to be implemented on backend
    // For now, using the same endpoint as teacher
    const response = await apiClient.get<ApiResponse<ClassDto[]>>('/api/classes/my-classes');
    return response.data;
};

/**
 * Get tests in a class (student view)
 * @param classId - Class ID
 */
export const getTestsInClass = async (classId: string): Promise<ApiResponse<TestDTO[]>> => {
    const response = await apiClient.get<ApiResponse<TestDTO[]>>(`/api/classes/${classId}/tests`);
    return response.data;
};

/**
 * Get test detail (student view)
 * @param classId - Class ID
 * @param testId - Test ID
 */
export const getTestDetail = async (classId: string, testId: string): Promise<ApiResponse<TestDetail>> => {
    const response = await apiClient.get<ApiResponse<TestDetail>>(`/api/classes/${classId}/tests/${testId}`);
    return response.data;
};

/**
 * Get test result by submission ID or test ID
 * @param id - Submission ID or Test ID
 */
export const getTestResult = async (id: string): Promise<ApiResponse<import('../types').TestResult>> => {
    const response = await apiClient.get<ApiResponse<import('../types').TestResult>>(`/api/getresult/${id}`);
    return response.data;
};

/**
 * Join a class by class code
 * @param classCode - Class code to join
 */
export const joinClass = async (classCode: string): Promise<ApiResponse<ClassDto>> => {
    const response = await apiClient.post<ApiResponse<ClassDto>>('/api/classes/join', { classCode });
    return response.data;
};

// Note: Additional student-specific endpoints (grades, assignments, etc.)
// will need to be added as they are implemented on the backend

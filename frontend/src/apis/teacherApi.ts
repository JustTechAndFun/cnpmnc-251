import apiClient from './axiosConfig';
import type { ApiResponse } from '../types';

export interface ClassDto {
    id: string;
    name: string;
    className: string;
    classCode: string;
    teacherId?: string;
    teacherName?: string;
    semester?: string;
    year?: number;
    studentCount?: number;
}

export interface StudentDto {
    id: string;
    email: string;
    name: string;
    studentId?: string;
    picture?: string;
}

export interface AddStudentRequest {
    email?: string;
    studentId?: string;
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

export interface AddTestRequestDTO {
    name: string;
    description?: string;
    duration: number;
    passcode?: string;
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
 * Get teacher's classes
 */
export const getMyClasses = async (): Promise<ApiResponse<ClassDto[]>> => {
    const response = await apiClient.get<ApiResponse<ClassDto[]>>('/api/classes/my-classes');
    return response.data;
};

/**
 * Get class information
 * @param id - Class ID
 */
export const getClassInfo = async (id: string): Promise<ApiResponse<ClassDto>> => {
    const response = await apiClient.get<ApiResponse<ClassDto>>(`/api/classes/${id}`);
    return response.data;
};

/**
 * Get students in a class
 * @param id - Class ID
 */
export const getClassStudents = async (id: string): Promise<ApiResponse<StudentDto[]>> => {
    const response = await apiClient.get<ApiResponse<StudentDto[]>>(`/api/classes/${id}/students`);
    return response.data;
};

/**
 * Add student to class
 * @param id - Class ID
 * @param request - Student data (email or studentId)
 */
export const addStudentToClass = async (id: string, request: AddStudentRequest): Promise<ApiResponse<StudentDto>> => {
    const response = await apiClient.post<ApiResponse<StudentDto>>(`/api/classes/${id}/students`, request);
    return response.data;
};

/**
 * Add test to class
 * @param classId - Class ID
 * @param test - Test data
 */
export const addTestToClass = async (classId: string, test: AddTestRequestDTO): Promise<ApiResponse<TestDTO>> => {
    const response = await apiClient.post<ApiResponse<TestDTO>>(`/api/classes/${classId}/tests`, test);
    return response.data;
};

/**
 * Get tests in a class
 * @param classId - Class ID
 */
export const getTestsInClass = async (classId: string): Promise<ApiResponse<TestDTO[]>> => {
    const response = await apiClient.get<ApiResponse<TestDTO[]>>(`/api/classes/${classId}/tests`);
    return response.data;
};

/**
 * Get test detail
 * @param classId - Class ID
 * @param testId - Test ID
 */
export const getTestDetail = async (classId: string, testId: string): Promise<ApiResponse<TestDetail>> => {
    const response = await apiClient.get<ApiResponse<TestDetail>>(`/api/classes/${classId}/tests/${testId}`);
    return response.data;
};

/**
 * Get test results for all students
 * @param testId - Test ID
 */
export const getTestResults = async (testId: string): Promise<ApiResponse<import('../types').TestResultsResponse>> => {
    const response = await apiClient.get<ApiResponse<import('../types').TestResultsResponse>>(`/api/teacher/tests/${testId}/results`);
    return response.data;
};
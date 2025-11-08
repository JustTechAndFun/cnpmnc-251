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
    title: string;  // Backend uses 'title'
    name?: string;  // Keep for backward compatibility
    description?: string;
    duration: number;
    passcode?: string;
    classId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddTestRequestDTO {
    title: string;
    description?: string;
    duration: number;
    passcode?: string;
}

export interface AddQuestionRequest {
    content: string;
    choiceA: string;
    choiceB: string;
    choiceC: string;
    choiceD: string;
    answer: 'CHOICE_A' | 'CHOICE_B' | 'CHOICE_C' | 'CHOICE_D';
}

export interface QuestionDTO {
    id: string;
    content: string;
    choiceA: string;
    choiceB: string;
    choiceC: string;
    choiceD: string;
    answer: string;
    order?: number;
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
 * Update class information
 * @param id - Class ID
 * @param classData - Updated class data
 */
export const updateClass = async (id: string, classData: {
    className: string;
    classCode: string;
    semester: string;
    year: number;
}): Promise<ApiResponse<ClassDto>> => {
    const response = await apiClient.put<ApiResponse<ClassDto>>(`/api/classes/${id}`, classData);
    return response.data;
};

/**
 * Delete class
 * @param id - Class ID
 */
export const deleteClass = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/classes/${id}`);
    return response.data;
};

/**
 * Remove student from class
 * @param classId - Class ID
 * @param studentId - Student ID
 */
export const removeStudentFromClass = async (classId: string, studentId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/classes/${classId}/students/${studentId}`);
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
 * Update test information
 * @param classId - Class ID
 * @param testId - Test ID
 * @param test - Updated test data
 */
export const updateTest = async (
    classId: string,
    testId: string,
    test: AddTestRequestDTO
): Promise<ApiResponse<TestDTO>> => {
    const response = await apiClient.put<ApiResponse<TestDTO>>(
        `/api/classes/${classId}/tests/${testId}`,
        test
    );
    return response.data;
};

/**
 * Delete test
 * @param classId - Class ID
 * @param testId - Test ID
 */
export const deleteTest = async (classId: string, testId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
        `/api/classes/${classId}/tests/${testId}`
    );
    return response.data;
};

/**
 * Get test results (submissions and statistics)
 * @param classId - Class ID
 * @param testId - Test ID
 * @returns Test results with submissions and summary statistics
 */
export const getTestResults = async (classId: string, testId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/classes/${classId}/tests/${testId}/results`);
    return response.data;
};

/**
 * Add question to test
 * @param classId - Class ID
 * @param testId - Test ID
 * @param question - Question data
 */
export const addQuestionToTest = async (
    classId: string,
    testId: string,
    question: AddQuestionRequest
): Promise<ApiResponse<QuestionDTO>> => {
    const response = await apiClient.post<ApiResponse<QuestionDTO>>(
        `/api/classes/${classId}/tests/${testId}`,
        question
    );
    return response.data;
};

/**
 * Update question in test
 * @param classId - Class ID
 * @param testId - Test ID
 * @param questionId - Question ID
 * @param question - Updated question data
 */
export const updateQuestion = async (
    classId: string,
    testId: string,
    questionId: string,
    question: AddQuestionRequest
): Promise<ApiResponse<QuestionDTO>> => {
    const response = await apiClient.put<ApiResponse<QuestionDTO>>(
        `/api/classes/${classId}/tests/${testId}/questions/${questionId}`,
        question
    );
    return response.data;
};

/**
 * Delete question from test
 * @param classId - Class ID
 * @param testId - Test ID
 * @param questionId - Question ID
 */
export const deleteQuestion = async (
    classId: string,
    testId: string,
    questionId: string
): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
        `/api/classes/${classId}/tests/${testId}/questions/${questionId}`
    );
    return response.data;
};

/**
 * Get questions of a test
 * @param classId - Class ID
 * @param testId - Test ID
 */
export const getTestQuestions = async (
    classId: string,
    testId: string
): Promise<ApiResponse<QuestionDTO[]>> => {
    const response = await apiClient.get<ApiResponse<QuestionDTO[]>>(
        `/api/classes/${classId}/test/${testId}/questions`
    );
    return response.data;
};

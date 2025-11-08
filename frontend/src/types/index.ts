export const Role = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT'
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
    id: string;
    email: string;
    role: Role;
    name?: string;
    picture?: string;
    activate: boolean;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isLoggingOut: boolean;
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: Role | Role[]) => boolean;
    handleCallback: (code: string) => Promise<boolean>;
}

// Make AuthContextType fields optional for safe access
export type SafeAuthContextType = {
    [K in keyof AuthContextType]?: AuthContextType[K];
} | null;

export interface ApiResponse<T> {
    error: boolean;
    data: T;
    message: string;
}

export interface Profile {
    id?: string;
    email: string;
    studentId?: string;
    role?: string;
    school?: string;
    schoolName?: string;
    activate?: boolean;
    information?: {
        name?: string;
        gender?: string;
        phone?: string;
        dob?: string; // Date of birth
        address?: string;
        [key: string]: unknown; // Allow additional fields
    };
}

export interface Question {
    id: string;
    testId: string;
    content: string;
    questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options?: string[]; // For multiple choice
    correctAnswer: string | string[];
    points: number;
    order: number;
}

export interface Test {
    id: string;
    name: string;
    description: string;
    duration: number; // in minutes
    passcode: string;
    teacherId: string;
    classId?: string; // Optional - added by frontend when fetching tests
    createdAt: string;
    updatedAt: string;
    questions: Question[];
}

export interface SubmissionAnswer {
    questionId: string;
    selectedAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
}

export interface TestResult {
    submissionId: string;
    testId: string;
    testName: string;
    studentId: string;
    studentName?: string;
    submittedAt: string;
    totalScore: number;
    maxScore: number;
    correctCount: number;
    wrongCount: number;
    totalQuestions: number;
    answers: SubmissionAnswer[];
    questions: Question[];
}

export interface StudentSubmission {
    submissionId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    score: number;
    maxScore: number;
    submittedAt: string;
    completionTime?: number; // in minutes
    status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
}

export interface TestResultsSummary {
    totalSubmissions: number;
    highestScore: number;
    lowestScore: number;
    averageScore: number;
    maxScore: number;
    completionRate: number; // percentage
}

export interface TestResultsResponse {
    testId: string;
    testName: string;
    submissions: StudentSubmission[];
    summary: TestResultsSummary;
}

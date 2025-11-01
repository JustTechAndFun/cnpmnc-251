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
    fakeLogin?: (role: Role) => void;
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
    email: string;
    school: string;
    information: {
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
    createdAt: string;
    updatedAt: string;
    questions: Question[];
}

export enum Role {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT'
}

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
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: Role | Role[]) => boolean;
}

export interface ApiResponse<T> {
    error: boolean;
    data: T;
    message: string;
}

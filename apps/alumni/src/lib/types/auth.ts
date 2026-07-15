export type UserRole = "admin" | "hr_staff" | "employee" | "fellow" | "alumni";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  position?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApplicantCheckCredentials {
  email: string;
  verification_code?: string;
}

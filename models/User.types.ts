import type { User, RefreshToken, Column, Task } from '@prisma/client';

export interface UserWithRelations extends User {
  columns?: Column[];
  tasks?: Task[];
  refreshTokens?: RefreshToken[];
}

export interface UserWithCounts extends User {
  _count: {
    columns: number;
    tasks: number;
  };
}

// Input types for authentication
export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

// Input types for user management
export interface UpdateUserInput {
  username?: string;
  fullName?: string | null;
  email?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Response types for API (with dates as strings for JSON)
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  isActive: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// JWT Token payload
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

// Extended JWT payload with standard claims
export interface DecodedToken extends JWTPayload {
  iat: number; // Issued at
  exp: number; // Expiration time
}

// Utility type - User without sensitive fields
export type PublicUser = Omit<User, 'passwordHash'>;

// Authentication context type
export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Error types
export interface AuthError {
  code:
    | 'INVALID_CREDENTIALS'
    | 'USER_NOT_FOUND'
    | 'USER_INACTIVE'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'USER_EXISTS'
    | 'UNAUTHORIZED';
  message: string;
}

// Type guards
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AuthError).code === 'string' &&
    typeof (error as AuthError).message === 'string'
  );
}

// Helper type for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string | AuthError;
  message?: string;
}

// Validation constants
export const PASSWORD_MIN_LENGTH = 6;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 255;

// Session type for storing in cookies/local storage
export interface UserSession {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

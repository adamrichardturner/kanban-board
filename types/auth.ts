export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  isDemo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token?: string;
  everywhere?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<AuthUser> };

export type UserRole = 'user' | 'admin' | 'demo';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    ip?: string;
  };
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
}

export type AuthProvider = 'email' | 'google' | 'github' | 'demo';

export interface ProviderAuthRequest {
  provider: AuthProvider;
  code?: string;
  state?: string;
  redirectUri?: string;
}

export interface DemoLoginResponse extends AuthResponse {
  demoData?: {
    boardsCount: number;
    tasksCount: number;
    expiresAt?: Date;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  acceptTerms: boolean;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_DISABLED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USERNAME_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'DEMO_USER_ERROR'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

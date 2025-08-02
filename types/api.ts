export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiValidationError extends ApiError {
  errors: ValidationError[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TaskFilters {
  status?: string | string[];
  boardId?: string;
  columnId?: string;
  search?: string;
  priority?: number;
  hasSubtasks?: boolean;
  hasDueDate?: boolean;
  isOverdue?: boolean;
}

export interface BoardFilters {
  isDefault?: boolean;
  search?: string;
  userId?: string;
}

export interface ColumnFilters {
  boardId?: string;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, unknown>;
  include?: string[];
}

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const API_ENDPOINTS = {
  // Auth
  AUTH_DEMO_LOGIN: '/api/auth/demo-login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_PROFILE: '/api/users/profile',

  // Boards
  BOARDS: '/api/boards',
  BOARD_BY_ID: (id: string) => `/api/boards/${id}`,

  // Columns
  COLUMNS: '/api/columns',
  COLUMN_BY_ID: (id: string) => `/api/columns/${id}`,
  BOARD_COLUMNS: (boardId: string) => `/api/boards/${boardId}/columns`,

  // Tasks
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
  COLUMN_TASKS: (columnId: string) => `/api/columns/${columnId}/tasks`,
  BOARD_TASKS: (boardId: string) => `/api/boards/${boardId}/tasks`,

  // Subtasks
  SUBTASKS: '/api/subtasks',
  SUBTASK_BY_ID: (id: string) => `/api/subtasks/${id}`,
  TASK_SUBTASKS: (taskId: string) => `/api/tasks/${taskId}/subtasks`,
} as const;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

export interface ApiClientResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface BulkOperation<T = unknown> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
}

export interface BulkResponse<T = unknown> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

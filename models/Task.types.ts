import type {
  Task,
  Subtask,
  Column,
  User,
  TaskStatus,
  SubtaskStatus,
} from '@prisma/client';

// Extended types that include relations
export interface TaskWithRelations extends Task {
  column: Column;
  subtasks: Subtask[];
  user?: User;
}

export interface ColumnWithTasks extends Column {
  tasks: TaskWithRelations[];
  _count?: {
    tasks: number;
  };
}

export interface ColumnWithCount extends Column {
  _count: {
    tasks: number;
  };
}

// Input types for creating/updating
export interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  priority?: number;
  dueDate?: Date | string;
  subtasks?: CreateSubtaskInput[];
}

export interface CreateSubtaskInput {
  title: string;
  status?: SubtaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  dueDate?: Date | string | null;
}

export interface UpdateSubtaskInput {
  title?: string;
  status?: SubtaskStatus;
  position?: number;
}

export interface MoveTaskInput {
  columnId: string;
  position?: number;
}

export interface CreateColumnInput {
  name: string;
  color?: string;
  position?: number;
}

export interface UpdateColumnInput {
  name?: string;
  color?: string;
  position?: number;
}

// Response types for API (with dates as strings for JSON)
export interface TaskResponse {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  columnId: string;
  position: number;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  column: {
    id: string;
    name: string;
    color: string;
  };
  subtasks: SubtaskResponse[];
}

export interface SubtaskResponse {
  id: string;
  taskId: string;
  title: string;
  status: SubtaskStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnResponse {
  id: string;
  userId: string;
  name: string;
  position: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

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

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

// Drag and drop types
export interface DragEndResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
  draggableId: string;
  type: string;
}

// Board state types for frontend
export interface BoardState {
  columns: ColumnWithTasks[];
  isLoading: boolean;
  error: string | null;
}

// Utility type for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus;
  priority?: number;
  search?: string;
  columnId?: string;
  hasDueDate?: boolean;
  isOverdue?: boolean;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
}

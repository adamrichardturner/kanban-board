import type {
  Task,
  Subtask,
  Column,
  Board,
  User,
  TaskStatus,
  SubtaskStatus,
} from '@prisma/client';

// Extended types that include relations
export interface TaskWithRelations extends Task {
  board: Board;
  column: Column;
  subtasks: Subtask[];
  user?: User;
}

export interface SubtaskWithTask extends Subtask {
  task: Task;
}

export interface ColumnWithTasks extends Column {
  board?: Board;
  tasks: TaskWithRelations[];
  _count?: {
    tasks: number;
  };
}

export interface ColumnWithCount extends Column {
  board?: Board;
  _count: {
    tasks: number;
  };
}

export interface BoardWithColumns extends Board {
  user?: User;
  columns: ColumnWithTasks[];
  _count?: {
    columns: number;
    tasks: number;
  };
}

// Input types for creating/updating tasks
export interface CreateTaskInput {
  title: string;
  description?: string;
  boardId: string;
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
  boardId?: string; // Allow moving between boards
  columnId: string;
  position?: number;
}

export interface BulkMoveTasksInput {
  taskIds: string[];
  targetBoardId?: string;
  targetColumnId: string;
  startPosition?: number;
}

export interface DuplicateTaskInput {
  title?: string;
  boardId?: string;
  columnId?: string;
  includeSubtasks?: boolean;
}

// Input types for columns
export interface CreateColumnInput {
  boardId: string;
  name: string;
  color?: string;
  position?: number;
}

export interface UpdateColumnInput {
  name?: string;
  color?: string;
  position?: number;
}

export interface MoveColumnInput {
  boardId?: string;
  position: number;
}

export interface DuplicateColumnInput {
  name?: string;
  boardId?: string;
  includeTasks?: boolean;
}

// Response types for API (with dates as strings for JSON)
export interface TaskResponse {
  id: string;
  boardId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  columnId: string;
  position: number;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  board: {
    id: string;
    name: string;
    color: string;
  };
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
  boardId: string;
  name: string;
  position: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface BoardResponse {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  columnCount?: number;
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
  type: 'task' | 'column' | 'board';
}

export interface TaskDragData {
  taskId: string;
  sourceColumnId: string;
  sourceBoardId: string;
  sourceIndex: number;
}

export interface ColumnDragData {
  columnId: string;
  sourceBoardId: string;
  sourceIndex: number;
}

// Board state types for frontend
export interface BoardState {
  currentBoard: BoardWithColumns | null;
  boards: BoardResponse[];
  isLoading: boolean;
  error: string | null;
}

export interface TaskListState {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  status?: TaskStatus | TaskStatus[];
  priority?: number | number[];
  search?: string;
  columnId?: string | string[];
  boardId?: string | string[];
  hasDueDate?: boolean;
  isOverdue?: boolean;
  hasSubtasks?: boolean;
  completedSubtasks?: 'all' | 'some' | 'none';
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string; // for future user assignment feature
}

export interface ColumnFilters {
  boardId?: string;
  search?: string;
  hasColor?: boolean;
}

export interface BoardFilters {
  search?: string;
  isArchived?: boolean;
  isDefault?: boolean;
  hasColor?: boolean;
}

// Sort types
export interface TaskSortOptions {
  field:
    | 'title'
    | 'priority'
    | 'dueDate'
    | 'createdAt'
    | 'updatedAt'
    | 'position';
  direction: 'asc' | 'desc';
}

export interface ColumnSortOptions {
  field: 'name' | 'position' | 'createdAt' | 'taskCount';
  direction: 'asc' | 'desc';
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

export interface TaskError extends ApiError {
  taskId?: string;
  columnId?: string;
  boardId?: string;
}

// Task analytics types
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  tasksPerPriority: Record<number, number>;
  tasksPerColumn: Record<string, number>;
  tasksByStatus: Record<TaskStatus, number>;
  productivityTrends: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
}

// Task templates
export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  priority: number;
  estimatedHours?: number;
  subtasks: Array<{
    title: string;
    position: number;
  }>;
  tags?: string[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
}

export interface CreateTaskFromTemplateInput {
  templateId: string;
  boardId: string;
  columnId: string;
  customizations?: {
    title?: string;
    description?: string;
    priority?: number;
    dueDate?: Date | string;
  };
}

// Task comments (for future feature)
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullName: string | null;
  };
}

export interface CreateTaskCommentInput {
  content: string;
}

// Task attachments (for future feature)
export interface TaskAttachment {
  id: string;
  taskId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

// Task history/audit trail
export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  userId: string;
  action:
    | 'created'
    | 'updated'
    | 'moved'
    | 'completed'
    | 'deleted'
    | 'restored';
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
  user: {
    username: string;
    fullName: string | null;
  };
}

// Bulk operations
export interface BulkTaskOperation {
  operation: 'update' | 'move' | 'delete' | 'duplicate';
  taskIds: string[];
  params?: {
    updates?: Partial<UpdateTaskInput>;
    targetBoardId?: string;
    targetColumnId?: string;
    position?: number;
  };
}

export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    taskId: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Task views/layouts
export interface TaskView {
  id: string;
  name: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  filters: TaskFilters;
  sorting: TaskSortOptions;
  groupBy?: 'status' | 'priority' | 'dueDate' | 'assignee';
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
}

// Time tracking (for future feature)
export interface TaskTimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  createdAt: string;
}

export interface TaskTimeTracking {
  totalTime: number;
  estimatedTime?: number;
  timeEntries: TaskTimeEntry[];
  isTracking: boolean;
  currentSession?: {
    startTime: string;
    duration: number;
  };
}

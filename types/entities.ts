export type TaskStatus = 'todo' | 'doing' | 'done';
export type SubtaskStatus = 'todo' | 'doing' | 'done';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  full_name: string | null;
  is_demo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  board_id: string;
  columnId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithRefreshTokens extends User {
  refresh_tokens: RefreshToken[];
}

export interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

export interface ColumnWithTasks extends Column {
  tasks: TaskWithSubtasks[];
}

export interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

export interface BoardWithCounts extends Board {
  column_count: number;
  task_count: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardResponse {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnResponse {
  id: string;
  boardId: string;
  name: string;
  position: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResponse {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubtaskResponse {
  id: string;
  taskId: string;
  title: string;
  status: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardWithColumnsResponse extends BoardResponse {
  columns: ColumnWithTasksResponse[];
}

export interface ColumnWithTasksResponse extends ColumnResponse {
  tasks: TaskWithSubtasksResponse[];
}

export interface TaskWithSubtasksResponse extends TaskResponse {
  subtasks: SubtaskResponse[];
}

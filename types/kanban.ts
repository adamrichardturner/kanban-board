export interface Board {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
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

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  created_at: Date;
  updated_at: Date;
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

export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  created_at: Date;
  updated_at: Date;
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
  subtasks?: SubtaskResponse[];
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: TaskStatus;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface SubtaskResponse {
  id: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface CreateBoardRequest {
  name: string;
  isDefault?: boolean;
}

export interface UpdateBoardRequest {
  name?: string;
  isDefault?: boolean;
  position?: number;
}

export interface CreateColumnRequest {
  name: string;
  color?: string;
}

export interface UpdateColumnRequest {
  name?: string;
  color?: string;
  position?: number;
}

export interface CreateTaskRequest {
  columnId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  columnId?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  position?: number;
}

export interface CreateSubtaskRequest {
  title: string;
  status?: TaskStatus;
}

export interface UpdateSubtaskRequest {
  title?: string;
  status?: TaskStatus;
  position?: number;
}

export interface ReorderRequest {
  items: { id: string; position: number }[];
}

export interface MoveTaskRequest {
  columnId: string;
  position: number;
}

export interface BoardWithColumns extends BoardResponse {
  columns: ColumnWithTasks[];
}

export interface ColumnWithTasks extends ColumnResponse {
  tasks: TaskResponse[];
}

export interface TaskWithSubtasks extends TaskResponse {
  subtasks: SubtaskResponse[];
}

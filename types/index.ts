export * from './entities';
export * from './api';
export * from './auth';
export * from './common';

// Type guards for runtime checking
export function isTaskStatus(
  value: string,
): value is import('./entities').TaskStatus {
  return ['todo', 'doing', 'done'].includes(value);
}

export function isSubtaskStatus(
  value: string,
): value is import('./entities').SubtaskStatus {
  return ['todo', 'doing', 'done'].includes(value);
}

// Utility functions for type transformations
export function userToAuthUser(
  user: import('./entities').User,
): import('./auth').AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
    isDemo: user.is_demo,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function userToResponse(
  user: import('./entities').User,
): import('./entities').UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
    isDemo: user.is_demo,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function boardToResponse(
  board: import('./entities').Board,
): import('./entities').BoardResponse {
  return {
    id: board.id,
    userId: board.user_id,
    name: board.name,
    isDefault: board.is_default,
    position: board.position,
    createdAt: board.created_at,
    updatedAt: board.updated_at,
  };
}

export function columnToResponse(
  column: import('./entities').Column,
): import('./entities').ColumnResponse {
  return {
    id: column.id,
    boardId: column.board_id,
    name: column.name,
    position: column.position,
    color: column.color,
    createdAt: column.created_at,
    updatedAt: column.updated_at,
  };
}

export function taskToResponse(
  task: import('./entities').Task,
): import('./entities').TaskResponse {
  return {
    id: task.id,
    boardId: task.board_id,
    columnId: task.columnId,
    title: task.title,
    description: task.description,
    status: task.status,
    position: task.position,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

export function subtaskToResponse(
  subtask: import('./entities').Subtask,
): import('./entities').SubtaskResponse {
  return {
    id: subtask.id,
    taskId: subtask.task_id,
    title: subtask.title,
    status: subtask.status,
    position: subtask.position,
    createdAt: subtask.created_at,
    updatedAt: subtask.updated_at,
  };
}

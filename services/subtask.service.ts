import { SubtaskRepository } from '@/repositories/subtask.repository';
import { TaskRepository } from '@/repositories/task.repository';
import {
  SubtaskResponse,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  ReorderRequest,
  Subtask,
} from '@/types/kanban';

interface SubtaskUpdateFields {
  title?: string;
  status?: boolean;
  position?: number;
}

export class SubtaskService {
  private subtaskRepository: SubtaskRepository;
  private taskRepository: TaskRepository;

  constructor() {
    this.subtaskRepository = new SubtaskRepository();
    this.taskRepository = new TaskRepository();
  }

  async getTaskSubtasks(
    taskId: string,
    userId: string,
  ): Promise<SubtaskResponse[]> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    const subtasks = await this.subtaskRepository.findByTaskId(taskId);
    return subtasks.map(this.mapSubtaskResponse);
  }

  async createSubtask(
    taskId: string,
    userId: string,
    data: CreateSubtaskRequest,
  ): Promise<SubtaskResponse> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    const subtask = await this.subtaskRepository.create(
      taskId,
      data.title,
      data.status || false,
    );

    return this.mapSubtaskResponse(subtask);
  }

  async updateSubtask(
    subtaskId: string,
    userId: string,
    data: UpdateSubtaskRequest,
  ): Promise<SubtaskResponse | null> {
    // Verify user owns the board that contains this subtask
    const hasAccess = await this.subtaskRepository.verifyTaskOwnership(
      subtaskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Subtask not found or access denied');
    }

    const updates: SubtaskUpdateFields = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.status !== undefined) updates.status = data.status;
    if (data.position !== undefined) updates.position = data.position;

    const subtask = await this.subtaskRepository.update(subtaskId, updates);
    if (!subtask) return null;

    return this.mapSubtaskResponse(subtask);
  }

  async deleteSubtask(subtaskId: string, userId: string): Promise<boolean> {
    // Verify user owns the board that contains this subtask
    const hasAccess = await this.subtaskRepository.verifyTaskOwnership(
      subtaskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Subtask not found or access denied');
    }

    return await this.subtaskRepository.delete(subtaskId);
  }

  async reorderSubtasks(
    taskId: string,
    userId: string,
    data: ReorderRequest,
  ): Promise<void> {
    // Verify user owns the board that contains this task
    const hasAccess = await this.taskRepository.verifyBoardOwnership(
      taskId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Task not found or access denied');
    }

    await this.subtaskRepository.reorderSubtasks(taskId, data.items);
  }

  private mapSubtaskResponse(subtask: Subtask): SubtaskResponse {
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
}

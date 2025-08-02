import { NextRequest } from 'next/server';
import { SubtaskController } from '@/controllers/subtask.controller';

const subtaskController = new SubtaskController();

export async function PUT(request: NextRequest) {
  return await subtaskController.updateSubtask(request);
}

export async function DELETE(request: NextRequest) {
  return await subtaskController.deleteSubtask(request);
}

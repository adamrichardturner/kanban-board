import { NextRequest } from 'next/server';
import { SubtaskController } from '@/controllers/subtask.controller';

const subtaskController = new SubtaskController();

export async function PUT(request: NextRequest) {
  return subtaskController.updateSubtask(request);
}

export async function DELETE(request: NextRequest) {
  return subtaskController.deleteSubtask(request);
}

import { NextRequest } from 'next/server';
import { SubtaskController } from '@/controllers/subtask.controller';

const subtaskController = new SubtaskController();

export async function POST(request: NextRequest) {
  return subtaskController.reorderSubtasks(request);
}

import { NextRequest } from 'next/server';
import { SubtaskController } from '@/controllers/subtask.controller';

const subtaskController = new SubtaskController();

export async function GET(request: NextRequest) {
  return await subtaskController.getTaskSubtasks(request);
}

export async function POST(request: NextRequest) {
  return await subtaskController.createSubtask(request);
}

import { NextRequest } from 'next/server';
import { TaskController } from '@/controllers/task.controller';

const taskController = new TaskController();

export async function GET(request: NextRequest) {
  return await taskController.getColumnTasks(request);
}

export async function POST(request: NextRequest) {
  return await taskController.createTask(request);
}

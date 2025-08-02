import { NextRequest } from 'next/server';
import { TaskController } from '@/controllers/task.controller';

const taskController = new TaskController();

export async function POST(request: NextRequest) {
  return await taskController.moveTask(request);
}

import { NextRequest } from 'next/server';
import { TaskController } from '@/controllers/task.controller';

const taskController = new TaskController();

export async function GET(request: NextRequest) {
  return await taskController.getTask(request);
}

export async function PUT(request: NextRequest) {
  return await taskController.updateTask(request);
}

export async function DELETE(request: NextRequest) {
  return await taskController.deleteTask(request);
}

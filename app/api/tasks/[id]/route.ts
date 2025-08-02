import { NextRequest } from 'next/server';
import { TaskController } from '@/controllers/task.controller';

const taskController = new TaskController();

export async function GET(request: NextRequest) {
  return taskController.getTask(request);
}

export async function PUT(request: NextRequest) {
  return taskController.updateTask(request);
}

export async function DELETE(request: NextRequest) {
  return taskController.deleteTask(request);
}

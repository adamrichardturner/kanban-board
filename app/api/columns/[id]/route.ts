import { NextRequest } from 'next/server';
import { ColumnController } from '@/controllers/column.controller';

const columnController = new ColumnController();

export async function PUT(request: NextRequest) {
  return await columnController.updateColumn(request);
}

export async function DELETE(request: NextRequest) {
  return await columnController.deleteColumn(request);
}

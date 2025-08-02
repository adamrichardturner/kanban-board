import { NextRequest } from 'next/server';
import { ColumnController } from '@/controllers/column.controller';

const columnController = new ColumnController();

export async function GET(request: NextRequest) {
  return await columnController.getBoardColumns(request);
}

export async function POST(request: NextRequest) {
  return await columnController.createColumn(request);
}

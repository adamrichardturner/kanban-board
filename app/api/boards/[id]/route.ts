import { NextRequest } from 'next/server';
import { BoardController } from '@/controllers/board.controller';

const boardController = new BoardController();

export async function GET(request: NextRequest) {
  return await boardController.getBoard(request);
}

export async function PUT(request: NextRequest) {
  return await boardController.updateBoard(request);
}

export async function DELETE(request: NextRequest) {
  return await boardController.deleteBoard(request);
}

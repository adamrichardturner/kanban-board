import { NextRequest } from 'next/server';
import { BoardController } from '@/controllers/board.controller';

const boardController = new BoardController();

export async function GET() {
  return await boardController.getBoards();
}

export async function POST(request: NextRequest) {
  return await boardController.createBoard(request);
}

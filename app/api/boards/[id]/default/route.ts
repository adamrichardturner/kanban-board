import { NextRequest } from 'next/server';
import { BoardController } from '@/controllers/board.controller';

const boardController = new BoardController();

export async function POST(request: NextRequest) {
  return await boardController.setDefaultBoard(request);
}

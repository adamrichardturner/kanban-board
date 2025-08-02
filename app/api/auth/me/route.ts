import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/auth.controller';

const authController = new AuthController();

export async function GET(request: NextRequest) {
  return await authController.getCurrentUser(request);
}

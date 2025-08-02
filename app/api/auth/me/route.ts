import { AuthController } from '@/controllers/auth.controller';

const authController = new AuthController();

export async function GET() {
  return await authController.getCurrentUser();
}

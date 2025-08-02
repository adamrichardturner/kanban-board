import { AuthController } from '@/controllers/auth.controller';

const authController = new AuthController();

export async function POST() {
  return await authController.logout();
}

import { AuthController } from '@/controllers/auth.controller';

const authController = new AuthController();

export async function POST(request: NextRequest) {
  return await authController.logout(request);
}

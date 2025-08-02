import { UserRepository } from '@/repositories/user.repository';
import { signToken, verifyToken } from '@/lib/auth';
import { AuthResponse, UserResponse } from '@/types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async demoLogin(): Promise<AuthResponse> {
    const user = await this.userRepository.findDemoUser();

    if (!user) {
      throw new Error(
        'Demo user not found. Please run the database seed first.',
      );
    }

    if (!user.is_demo) {
      throw new Error('Invalid demo user configuration.');
    }

    const token = signToken({ userId: user.id });

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      isDemo: user.is_demo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
    await this.userRepository.createRefreshToken(
      user.id,
      token,
      refreshTokenExpiry,
    );

    return {
      user: userResponse,
      token,
    };
  }

  async getCurrentUser(token: string): Promise<UserResponse> {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token');
    }

    const user = await this.userRepository.findUserById(decoded.userId);

    if (!user) {
      throw new Error('User not found or deactivated');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      isDemo: user.is_demo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async logout(token: string): Promise<void> {
    await this.userRepository.deleteRefreshToken(token);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.userRepository.deleteUserRefreshTokens(userId);
  }
}

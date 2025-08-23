import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import { ApiResponse, AuthResponse, AuthUser, HTTP_STATUS } from '@/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async demoLogin(): Promise<NextResponse> {
    try {
      const authResult = await this.authService.demoLogin();

      const cookieStore = await cookies();
      cookieStore.set('token', authResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      const response: ApiResponse<AuthResponse> = {
        data: authResult,
        message: 'Demo login successful',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      console.error('Demo login error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Demo login failed';
      const statusCode = this.getErrorStatusCode(errorMessage);

      const errorResponse: ApiResponse = {
        error: errorMessage,
      };

      return NextResponse.json(errorResponse, { status: statusCode });
    }
  }

  async getCurrentUser(): Promise<NextResponse> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;

      if (!token) {
        const errorResponse: ApiResponse = {
          error: 'No authentication token found',
        };
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS.UNAUTHORIZED,
        });
      }

      const user = await this.authService.getCurrentUser(token);

      const response: ApiResponse<AuthUser> = {
        data: user,
        message: 'User retrieved successfully',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      console.error('Get current user error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get current user';
      const statusCode = this.getErrorStatusCode(errorMessage);

      const errorResponse: ApiResponse = {
        error: errorMessage,
      };

      return NextResponse.json(errorResponse, { status: statusCode });
    }
  }

  async logout(): Promise<NextResponse> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;

      if (token) {
        await this.authService.logout(token);
      }

      cookieStore.delete('token');

      const response: ApiResponse = {
        message: 'Logout successful',
      };

      return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
      console.error('Logout error:', error);
      const cookieStore = await cookies();
      cookieStore.delete('token');

      const errorResponse: ApiResponse = {
        error: 'Logout failed',
      };

      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private getErrorStatusCode(errorMessage: string): number {
    if (errorMessage.includes('not found')) {
      return HTTP_STATUS.NOT_FOUND;
    }
    if (errorMessage.includes('deactivated')) {
      return HTTP_STATUS.FORBIDDEN;
    }
    if (errorMessage.includes('Invalid')) {
      return HTTP_STATUS.BAD_REQUEST;
    }
    if (errorMessage.includes('token')) {
      return HTTP_STATUS.UNAUTHORIZED;
    }
    return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}

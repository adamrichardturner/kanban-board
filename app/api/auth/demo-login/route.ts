import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        isActive: true,
        isDemo: true,
        createdAt: true,
      },
    });

    if (!demoUser) {
      return NextResponse.json(
        { error: 'Demo user not found. Please run the database seed first.' },
        { status: 404 },
      );
    }
    if (!demoUser.isActive) {
      return NextResponse.json(
        { error: 'Demo user account is deactivated.' },
        { status: 403 },
      );
    }
    if (!demoUser.isDemo) {
      return NextResponse.json(
        { error: 'Invalid demo user configuration.' },
        { status: 400 },
      );
    }

    // Create the JWT
    const token = signToken({ userId: demoUser.id });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json(
      { data: { token, user: demoUser } },
      { status: 200 },
    );
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during demo login' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: {
        email: 'demo@example.com',
      },
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

    // Check if demo user exists and is active
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

    // Verify this is actually the demo user
    if (!demoUser.isDemo) {
      return NextResponse.json(
        { error: 'Invalid demo user configuration.' },
        { status: 400 },
      );
    }

    // Issue JWT token for demo user
    const token = signToken({ userId: demoUser.id });

    // Return same format as regular login
    return NextResponse.json({
      data: {
        token,
        user: demoUser,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during demo login' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas';
import { compare } from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { z } from 'zod';

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  try {
    // Look up user by email (including password hash for verification)
    const userWithPassword = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        passwordHash: true,
        isActive: true,
        isDemo: true,
        createdAt: true,
      },
    });

    // Verify user exists and password is correct
    if (
      !userWithPassword ||
      !(await compare(password, userWithPassword.passwordHash))
    ) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Check if user account is active
    if (!userWithPassword.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated' },
        { status: 403 },
      );
    }

    // Issue JWT token
    const token = signToken({ userId: userWithPassword.id });

    // Create safe user object without password hash
    const safeUser = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      username: userWithPassword.username,
      fullName: userWithPassword.fullName,
      isActive: userWithPassword.isActive,
      isDemo: userWithPassword.isDemo,
      createdAt: userWithPassword.createdAt,
    };

    return NextResponse.json({
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 },
    );
  }
}

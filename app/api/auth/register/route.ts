import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/schemas';
import { hash } from 'bcryptjs';
import { z } from 'zod';

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { email, username, password, fullName } = parsed.data;

  try {
    // Check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? 'A user with this email already exists'
              : 'A user with this username already exists',
        },
        { status: 409 },
      );
    }

    // Hash the password
    const passwordHash = await hash(password, 12);

    // Create user and default columns in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          fullName,
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

      // Create default board with columns using the stored function
      await tx.$executeRaw`SELECT create_default_board_for_user(${newUser.id}::UUID)`;

      return newUser;
    });

    return NextResponse.json(
      {
        data: {
          user,
          message: 'User registered successfully',
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle unique constraint violations that might slip through
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A user with this email or username already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 },
    );
  }
}

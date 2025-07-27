import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';
import { createTaskSchema } from '@/lib/schemas';

export async function GET(req: Request) {
  const userId = getUserId(req as any);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: fetch tasks for user
  // const tasks = await prisma.task.findMany({ where: { userId }, include: { subtasks: true, column: true } });

  return NextResponse.json({ data: /* tasks */ [] });
}

export async function POST(req: Request) {
  const userId = getUserId(req as any);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = createTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // TODO: create task + subtasks
  // const task = await prisma.task.create({ … });

  return NextResponse.json({ data: /* task */ {} }, { status: 201 });
}

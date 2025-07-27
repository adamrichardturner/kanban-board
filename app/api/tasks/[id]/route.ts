import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = getUserId(req as any);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await req.json();
  // TODO: validate updates, e.g. with zod
  // const result = await prisma.task.updateMany({ where: { id: params.id, userId }, data: updates });

  return NextResponse.json({ data: /* result */ {} });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = getUserId(req as any);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: delete task
  // await prisma.task.deleteMany({ where: { id: params.id, userId } });

  return NextResponse.json({ success: true });
}

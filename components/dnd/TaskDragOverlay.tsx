// components/dnd/TaskDragOverlay.tsx
'use client';

import * as React from 'react';
import type { BoardWithColumns } from '@/types';
import { Task } from '@/components/Task';

export function TaskDragOverlay({
  board,
  activeTaskId,
}: {
  board: BoardWithColumns;
  activeTaskId: string | null;
}) {
  if (!activeTaskId) return null;
  const all = board.columns.flatMap((c) => c.tasks);
  const t = all.find((x) => x.id === activeTaskId);
  return t ? (
    <div className='w-80'>
      <Task task={t} />
    </div>
  ) : null;
}

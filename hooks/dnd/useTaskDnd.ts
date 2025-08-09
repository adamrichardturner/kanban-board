'use client';

import { arrayMove } from '@dnd-kit/sortable';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import type { BoardWithColumns } from '@/types';
import type { ReorderRequest, MoveTaskRequest } from '@/types/kanban';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useCallback, useEffect, useState } from 'react';

export function useTaskDnd(initial: BoardWithColumns) {
  const [board, setBoard] = useState<BoardWithColumns>(initial);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const { moveTaskAsync, reorderTasksAsync } = useTasks();

  useEffect(() => {
    setBoard(initial);
  }, [initial]);

  const onDragStart = useCallback((e: DragStartEvent) => {
    if (e.active?.data?.current?.type === 'task') {
      setActiveTaskId(String(e.active.id));
    }
  }, []);

  const onDragOver = useCallback(
    (e: DragOverEvent) => {
      const over = e.over;
      if (!over) {
        setOverColumnId(null);
        return;
      }
      const overId = String(over.id);
      const overTask = findTask(board, overId);
      if (overTask) {
        setOverColumnId(overTask.colId);
        return;
      }
      // If not a task, assume it's a column id
      setOverColumnId(overId);
    },
    [board],
  );

  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      setActiveTaskId(null);
      const { active, over } = e;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      const from = findTask(board, activeId);
      const overTask = findTask(board, overId);
      if (from && overTask && from.colId === overTask.colId) {
        if (from.index === overTask.index) return;
        const next = clone(board);
        const col = next.columns.find((c) => c.id === from.colId)!;
        col.tasks = arrayMove(col.tasks, from.index, overTask.index);
        col.tasks = normalize(col.tasks);
        setBoard(next);
        const req: ReorderRequest = {
          items: col.tasks.map((t) => ({ id: t.id, position: t.position })),
        };
        await reorderTasksAsync(col.id, req);
        return;
      }
      const source = findTask(board, activeId);
      if (!source) return;
      const targetColId = overTask ? overTask.colId : overId;
      const next = clone(board);
      const sourceCol = next.columns.find((c) => c.id === source.colId)!;
      const [moved] = sourceCol.tasks.splice(source.index, 1);
      const targetCol = next.columns.find((c) => c.id === targetColId)!;
      const insertIndex = overTask ? overTask.index : targetCol.tasks.length;
      targetCol.tasks.splice(insertIndex, 0, moved);
      sourceCol.tasks = normalize(sourceCol.tasks);
      targetCol.tasks = normalize(targetCol.tasks);
      setBoard(next);
      const move: MoveTaskRequest = {
        columnId: targetCol.id,
        position: insertIndex + 1,
      };
      await moveTaskAsync(moved.id, move);
      const targetReq: ReorderRequest = {
        items: targetCol.tasks.map((t) => ({ id: t.id, position: t.position })),
      };
      await reorderTasksAsync(targetCol.id, targetReq);
      const sourceReq: ReorderRequest = {
        items: sourceCol.tasks.map((t) => ({ id: t.id, position: t.position })),
      };
      await reorderTasksAsync(source.colId, sourceReq);
    },
    [board, moveTaskAsync, reorderTasksAsync],
  );

  return {
    board,
    activeTaskId,
    overColumnId,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}
function normalize<T extends { id: string; position: number }>(arr: T[]) {
  return arr.map((it, i) => ({ ...it, position: i + 1 }));
}
function findTask(board: BoardWithColumns, taskId: string) {
  for (const col of board.columns) {
    const index = col.tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) return { col, colId: col.id, index };
  }
  return null;
}

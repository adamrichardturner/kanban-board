'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTask } from './SortableTask';
import { ColumnWithTasks } from '@/types';

export function DroppableColumn({
  column,
  activeTaskSourceColumnId,
  overColumnId,
}: {
  column: ColumnWithTasks;
  activeTaskSourceColumnId?: string | null;
  overColumnId?: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column' },
  });

  const isForeignOver = Boolean(
    overColumnId === column.id &&
      activeTaskSourceColumnId &&
      activeTaskSourceColumnId !== column.id,
  );

  return (
    <div
      ref={setNodeRef}
      className='w-80 flex-shrink-0 rounded-md p-1'
      style={{
        outline: isOver ? '2px solid #6366F1' : 'none',
        outlineOffset: 4,
        backgroundColor: isForeignOver
          ? 'rgba(99, 102, 241, 0.08)'
          : 'transparent',
        padding: '10px',
      }}
    >
      {/* Column header */}
      <div className='mb-6 flex items-center gap-3'>
        <div
          className='h-4 w-4 rounded-full'
          style={{ backgroundColor: column.color }}
        />
        <h2
          className='uppercase'
          style={{
            color: 'var(--Medium-Grey, #828FA3)',
            fontFeatureSettings: '"liga" off, "clig" off',
            fontFamily: '"Plus Jakarta Sans"',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '2.4px',
          }}
        >
          {column.name} ({column.tasks.length})
        </h2>
      </div>

      {/* Tasks inside this column are sortable vertically by index */}
      <div className='space-y-6'>
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

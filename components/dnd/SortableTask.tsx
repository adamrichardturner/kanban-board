'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/components/Task';
import { useDroppable } from '@dnd-kit/core';
import { TaskWithSubtasks } from '@/types';

export function SortableTask({ task }: { task: TaskWithSubtasks }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task' },
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: task.id,
    data: { type: 'task' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
    cursor: 'grab',
    position: 'relative',
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      style={style}
      {...attributes}
      {...listeners}
    >
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: 0,
            right: 0,
            height: 4,
            borderTop: '3px dashed #635fc7',
            borderRadius: 2,
            opacity: 0.6,
          }}
        />
      )}
      <Task task={task} />
    </div>
  );
}

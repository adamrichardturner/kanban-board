'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';

type DragDropProviderProps = {
  children: React.ReactNode;
  onDragStart?: (e: DragStartEvent) => void;
  onDragOver?: (e: DragOverEvent) => void;
  onDragEnd?: (e: DragEndEvent) => void;
  overlay?: React.ReactNode;
};

export function DragAndDropProvider({
  children,
  overlay,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DragDropProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
      {typeof window !== 'undefined'
        ? createPortal(<DragOverlay>{overlay}</DragOverlay>, document.body)
        : null}
    </DndContext>
  );
}

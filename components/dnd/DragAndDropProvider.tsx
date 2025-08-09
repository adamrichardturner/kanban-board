'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';

type Props = {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  onDragStart?: (e: DragStartEvent) => void;
  onDragOver?: (e: DragOverEvent) => void;
  onDragEnd?: (e: DragEndEvent) => void;
};

export function DragDropProvider({
  children,
  overlay,
  onDragStart,
  onDragOver,
  onDragEnd,
}: Props) {
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

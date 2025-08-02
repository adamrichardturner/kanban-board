'use client';

import { AppTopBar } from '@/components/AppTopBar';
import { useBoard } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { useTasks } from '@/hooks/tasks/useTasks';
import { use, useEffect } from 'react';
import Image from 'next/image';
import { Task } from '@/components/Task';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const { data: board, isLoading, error } = useBoard(id);
  const { setSelectedBoard } = useSelectedBoard();

  useEffect(() => {
    setSelectedBoard(id);
  }, [id, setSelectedBoard]);

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-red-500'>Error: {error.message}</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div>Board not found</div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <AppTopBar name={board.name} />
        <div className='flex gap-6 overflow-x-auto p-6'>
          {board.columns.map((column) => (
            <div key={column.id} className='w-80 flex-shrink-0'>
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

              <div className='space-y-3'>
                {column.tasks.map((task) => (
                  <Task key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

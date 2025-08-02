'use client';

import { AppTopBar } from '@/components/AppTopBar';
import { useBoard } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { useTasks } from '@/hooks/tasks/useTasks';
import { use, useEffect } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const { data: board, isLoading, error } = useBoard(id);
  const { setSelectedBoard } = useSelectedBoard();
  const { createTask } = useTasks();

  useEffect(() => {
    setSelectedBoard(id);
  }, [id, setSelectedBoard]);

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-lg'>Loading board...</div>
      </div>
    );
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
        <AppTopBar name={board.name} createTask={createTask} />
        <div className='flex gap-6 overflow-x-auto p-4'>
          {board.columns.map((column) => (
            <div key={column.id} className='w-80 flex-shrink-0'>
              <div
                className='mb-4 rounded-lg p-4'
                style={{ backgroundColor: column.color + '20' }}
              >
                <h2 className='text-lg font-semibold'>{column.name}</h2>
                <span className='text-sm text-gray-500'>
                  ({column.tasks.length} tasks)
                </span>
              </div>

              <div className='space-y-3'>
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className='rounded-lg border bg-white p-4 shadow'
                  >
                    <h3 className='mb-2 font-medium'>{task.title}</h3>

                    {task.description && (
                      <p className='mb-3 text-sm text-gray-600'>
                        {task.description}
                      </p>
                    )}

                    <div className='flex items-center justify-between'>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          task.status === 'done'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'doing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className='text-xs text-gray-500'>
                          {
                            task.subtasks.filter((st) => st.status === 'done')
                              .length
                          }
                          /{task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className='mt-3 space-y-1'>
                        {task.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className='flex items-center text-sm'
                          >
                            <input
                              type='checkbox'
                              checked={subtask.status === 'done'}
                              readOnly
                              className='mr-2'
                            />
                            <span
                              className={
                                subtask.status === 'done'
                                  ? 'text-gray-500 line-through'
                                  : ''
                              }
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

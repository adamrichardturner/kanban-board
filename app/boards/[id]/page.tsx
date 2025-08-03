'use client';

import { AppTopBar } from '@/components/AppTopBar';
import { useBoard } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { use, useEffect } from 'react';
import { Task } from '@/components/Task';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import { CreateColumnDialog } from '@/components/CreateColumnDialog';
import { useTheme } from 'next-themes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const { data: board, isLoading, error } = useBoard(id);
  const { setSelectedBoard } = useSelectedBoard();
  const { open: sidebarOpen } = useSidebar();
  const { theme } = useTheme();

  // Calculate content width based on sidebar state
  const scrollAreaWidth = sidebarOpen
    ? 'calc(100vw - 300px - 3rem)'
    : 'calc(100vw - 3rem)';

  useEffect(() => {
    setSelectedBoard(id);
  }, [id, setSelectedBoard]);

  if (isLoading) {
    return (
      <div className='animate-pulse'>
        {/* Skeleton AppTopBar */}
        <div
          className='flex h-[90px] items-center justify-between bg-white px-4 pt-1.5 dark:bg-[#20212C]'
          style={{
            boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)',
          }}
        >
          <div></div> {/* No skeleton for title */}
          <div className='flex items-center gap-4'>
            <div className='h-10 w-32 rounded-md bg-gray-200'></div>
            <div className='h-10 w-28 rounded-md bg-gray-200'></div>
          </div>
        </div>

        {/* Skeleton Board Content */}
        <div className='flex gap-6 overflow-x-auto p-6'>
          {/* Skeleton Columns - Variable widths for realism */}
          {[
            { tasks: 4, headerWidth: 'w-20' },
            { tasks: 2, headerWidth: 'w-24' },
            { tasks: 3, headerWidth: 'w-16' },
          ].map((column, i) => (
            <div key={i} className='w-80 flex-shrink-0'>
              {/* Skeleton Column Header */}
              <div className='mb-6 flex items-center gap-3'>
                <div className='h-4 w-4 rounded-full bg-gradient-to-r from-blue-200 to-blue-300'></div>
                <div
                  className={`h-3 ${column.headerWidth} rounded-md bg-gray-200`}
                ></div>
              </div>

              {/* Skeleton Tasks with varying heights */}
              <div className='space-y-3'>
                {Array.from({ length: column.tasks }).map((_, j) => (
                  <div
                    key={j}
                    className='rounded-lg border-none bg-white p-4'
                    style={{
                      boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)',
                    }}
                  >
                    <div
                      className={`h-4 ${j % 2 === 0 ? 'w-3/4' : 'w-5/6'} mb-3 rounded-md bg-gray-200`}
                    ></div>
                    <div
                      className={`h-3 ${j % 3 === 0 ? 'w-1/2' : 'w-2/3'} rounded-md bg-gray-100`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center bg-white dark:bg-[#20212C]'>
        <div className='text-red-500'>Error: {error.message}</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className='flex h-64 items-center justify-center bg-white dark:bg-[#20212C]'>
        <div>Board not found</div>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-white dark:bg-[#20212C]'>
      <AppTopBar name={board.name} />
      <div
        className='flex-1 overflow-hidden p-6'
        style={{
          animation: 'fadeIn 0.3s ease-in-out',
        }}
      >
        <ScrollArea className='h-full' style={{ width: scrollAreaWidth }}>
          <div className='flex w-max gap-6 pb-4'>
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

            {/* New Column Button */}
            {board.columns.length < 6 && (
              <div className='mt-10 w-80 flex-shrink-0'>
                <CreateColumnDialog
                  trigger={
                    <div
                      className='flex h-full min-h-96 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
                      style={{
                        borderRadius: '6px',
                        background:
                          theme === 'dark'
                            ? 'linear-gradient(180deg, rgba(43, 44, 55, 0.25) 0%, rgba(43, 44, 55, 0.13) 100%)'
                            : 'linear-gradient(180deg, #E9EFFA 0%, rgba(233, 239, 250, 0.50) 100%)',
                      }}
                    >
                      <span className='text-2xl font-bold text-[#828FA3]'>
                        + New Column
                      </span>
                    </div>
                  }
                />
              </div>
            )}
          </div>
          <ScrollBar
            orientation='horizontal'
            className='h-4 [&>div]:bg-[#4a4a4a] [&>div]:hover:bg-[#3a3a3a]'
          />
        </ScrollArea>
      </div>
    </div>
  );
}

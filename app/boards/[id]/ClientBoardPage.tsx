'use client';

import { AppTopBar } from '@/components/AppTopBar';
import { useBoard } from '@/hooks/boards/useBoards';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import { CreateColumnDialog } from '@/components/CreateColumnDialog';
import { useTheme } from 'next-themes';
import { useTaskDnd } from '@/hooks/dnd/useTaskDnd';
import { TaskDragOverlay } from '@/components/dnd/TaskDragOverlay';
import { DroppableColumn } from '@/components/dnd/DroppableColumn';
import type { BoardWithColumns } from '@/types';
import { DragDropProvider } from '@/components/dnd/DragAndDropProvider';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function ClientBoardPage({ boardId }: { boardId: string }) {
  const { data: board, isLoading, error } = useBoard(boardId);
  const { open: sidebarOpen, isMobile } = useSidebar();
  const { theme } = useTheme();

  const safeBoard: BoardWithColumns = board ?? {
    id: boardId,
    user_id: 'asd',
    name: '',
    is_default: false,
    position: 0,
    created_at: new Date(),
    updated_at: new Date(),
    columns: [],
  };

  const dnd = useTaskDnd(safeBoard);

  const scrollAreaWidth = getScrollAreaWidth(isMobile, sidebarOpen);
  function getScrollAreaWidth(isMobile: boolean, sidebarOpen: boolean) {
    if (isMobile) {
      return 'calc(100vw)';
    }
    if (sidebarOpen) {
      return 'calc(100vw - 300px - 3rem)';
    }
    return 'calc(100vw - 3rem)';
  }

  const showLoading = isLoading || !board;

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-white dark:bg-[#20212C]'>
      <AppTopBar name={board?.name ?? ''} />
      <div
        className='flex-1 overflow-hidden p-3 md:p-6'
        style={{ animation: 'fadeIn 0.3s ease-in-out' }}
      >
        {showLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Image
              src='/spinner.svg'
              alt='Loading...'
              width={40}
              height={40}
              priority
              className='animate-spin'
            />
          </div>
        ) : (
          <ScrollArea
            className='h-full md:touch-auto'
            style={{ width: scrollAreaWidth, paddingTop: '20px' }}
          >
            {dnd.board.columns.length === 0 ? (
              <div className='flex h-[calc(100vh-150px)] w-full items-center justify-center'>
                <div className='flex flex-col items-center gap-6 text-center'>
                  <p
                    className='text-[18px] font-bold text-[#828FA3]'
                    style={{ fontFeatureSettings: '"liga" off, "clig" off' }}
                  >
                    This board is empty. Create a new column to get started.
                  </p>
                  <CreateColumnDialog
                    trigger={
                      <button
                        className='rounded-[24px] bg-[#635FC7] px-6 py-3 text-white hover:bg-[#635FC7]/90'
                        type='button'
                      >
                        + Add New Column
                      </button>
                    }
                  />
                </div>
              </div>
            ) : (
              <DragDropProvider
                onDragStart={dnd.onDragStart}
                onDragOver={dnd.onDragOver}
                onDragEnd={dnd.onDragEnd}
                overlay={
                  <TaskDragOverlay
                    board={dnd.board}
                    activeTaskId={dnd.activeTaskId}
                  />
                }
              >
                <div className='ml-2 flex w-max gap-2 pt-2 pb-4'>
                  {dnd.board.columns.map((column) => (
                    <DroppableColumn
                      key={column.id}
                      column={column}
                      activeTaskSourceColumnId={
                        dnd.activeTaskId
                          ? findTaskColumnId(dnd.board, dnd.activeTaskId)
                          : null
                      }
                      overColumnId={dnd.overColumnId}
                    />
                  ))}
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
              </DragDropProvider>
            )}
            <ScrollBar
              orientation='horizontal'
              className='h-4 [&>div]:bg-[#4a4a4a] [&>div]:hover:bg-[#3a3a3a]'
            />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function findTaskColumnId(
  board: BoardWithColumns,
  taskId: string,
): string | null {
  for (const col of board.columns) {
    if (col.tasks.some((t) => t.id === taskId)) return col.id;
  }
  return null;
}

function BoardSkeleton() {
  return (
    <div className='mt-8 ml-4 animate-pulse'>
      {/* Top bar skeleton to match layout height and shadow */}
      <div
        className='flex h-[90px] items-center justify-between bg-white px-6 dark:bg-[#20212C]'
        style={{ boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)' }}
      >
        <Skeleton className='h-6 w-40 rounded-md' />
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-28 rounded-md' />
          <Skeleton className='h-10 w-28 rounded-md' />
        </div>
      </div>

      {/* Columns wrapper matching real board spacing */}
      <div className='flex gap-6 overflow-x-auto p-6'>
        {[
          { tasks: 5, headerWidth: 'w-24' },
          { tasks: 3, headerWidth: 'w-28' },
          { tasks: 4, headerWidth: 'w-20' },
        ].map((column, i) => (
          <div key={i} className='w-80 flex-shrink-0 rounded-md p-1'>
            {/* Column header */}
            <div className='mb-6 flex items-center gap-3'>
              <Skeleton className='h-4 w-4 rounded-full' />
              <Skeleton className={`h-3 ${column.headerWidth} rounded-md`} />
            </div>

            {/* Tasks list spacing should match space-y-6 */}
            <div className='space-y-6'>
              {Array.from({ length: column.tasks }).map((_, j) => (
                <div
                  key={j}
                  className='rounded-lg border-none bg-white p-4 dark:bg-[#2B2C37]'
                  style={{ boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)' }}
                >
                  {/* Title line */}
                  <Skeleton
                    className={`mb-3 h-4 ${j % 2 === 0 ? 'w-3/4' : 'w-5/6'} rounded-md`}
                  />
                  {/* Subtasks count line */}
                  <Skeleton
                    className={`h-3 ${j % 3 === 0 ? 'w-1/2' : 'w-2/3'} rounded-md`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

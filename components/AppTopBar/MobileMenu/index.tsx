'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBoards } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { BoardResponse } from '@/types';
import type { BoardWithColumns } from '@/types/entities';

type TriggerRender = (args: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => React.ReactNode;

interface MobileMenuProps {
  trigger?: React.ReactNode | TriggerRender;
}

export function MobileMenu({ trigger }: MobileMenuProps) {
  const { boards } = useBoards({ autoFetch: false });
  const { selectedBoardId, selectedBoard } = useSelectedBoard();
  const [open, setOpen] = useState(false);

  const listForMenu = useMemo<BoardResponse[]>(() => {
    return getDisplayBoardsForMenu(boards, selectedBoard || undefined);
  }, [boards, selectedBoard]);

  const sortedBoards = useMemo(() => {
    return [...listForMenu].sort((a, b) => a.position - b.position);
  }, [listForMenu]);

  const triggerElement =
    typeof trigger === 'function'
      ? (trigger as TriggerRender)({ open, setOpen })
      : trigger;

  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement || (
          <Button
            variant='ghost'
            className='h-9 w-9 rounded-full p-0 text-[#635FC7] hover:bg-[#635FC7]/10 hover:text-[#635FC7]'
            aria-label='Open boards menu'
          >
            <span className='sr-only'>Open boards menu</span>
            <Plus className='h-5 w-5' />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='fixed top-[80px] left-1/2 z-50 w-[264px] max-w-[264px] -translate-x-1/2 translate-y-0 rounded-lg border bg-white p-0 shadow-md md:top-[106px] dark:bg-[#2B2C37]'>
        <div className='rounded-lg p-0'>
          <DialogTitle className='px-6 py-6 text-xs font-medium tracking-[2.4px] text-[#828FA3]'>
            ALL BOARDS ({sortedBoards.length})
          </DialogTitle>
          <ul className='mb-1 space-y-1'>
            {sortedBoards.map((board) => {
              const isActive = board.id === selectedBoardId;
              return (
                <li key={board.id}>
                  <Link
                    href={`/boards/${board.id}`}
                    onClick={() => setOpen(false)}
                    className={
                      isActive
                        ? 'flex w-[90%] items-center gap-3 rounded-r-full bg-[#635FC7] px-6 py-3 font-semibold text-white'
                        : 'flex w-full items-center gap-3 rounded-md px-6 py-3 font-semibold text-[#828FA3] hover:bg-transparent hover:text-[#828FA3] dark:hover:bg-transparent'
                    }
                  >
                    <Image
                      src='/boards/board-icon-regular.svg'
                      alt='Board icon'
                      width={16}
                      height={16}
                      className={isActive ? 'brightness-0 invert' : ''}
                      priority
                    />
                    <span className='truncate'>{board.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className='mt-2 mb-3 space-y-1'>
            <li>
              <button
                type='button'
                onClick={() => {
                  setOpen(false);
                  const button = document.querySelector<HTMLButtonElement>(
                    '[data-create-board-trigger]',
                  );
                  button?.click();
                }}
                className='flex w-full items-center gap-3 rounded-md px-6 py-3 font-semibold text-[#635FC7] hover:bg-transparent hover:text-[#635FC7] dark:hover:bg-transparent'
              >
                <Image
                  src='/boards/board-icon-create.svg'
                  alt='Create board'
                  width={16}
                  height={16}
                  priority
                />
                <span className='truncate'>+ Create New Board</span>
              </button>
            </li>
          </ul>
          <div
            className='mt-3 flex h-[64px] items-center justify-center gap-4 rounded-md p-3'
            style={{
              backgroundColor: theme === 'dark' ? '#20212C' : '#F4F7FD',
            }}
          >
            <Sun className='h-5 w-5' style={{ color: '#828FA3' }} />
            <button
              type='button'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='relative inline-flex h-6 w-10 items-center rounded-full bg-[#635FC7]'
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
            <Moon className='h-5 w-5' style={{ color: '#828FA3' }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MobileMenu;

function getDisplayBoardsForMenu(
  boards: BoardResponse[],
  selectedBoard: BoardWithColumns | undefined,
): BoardResponse[] {
  if (boards.length > 0) {
    return boards;
  }
  if (!selectedBoard) {
    return [];
  }
  return [
    {
      id: selectedBoard.id,
      userId: selectedBoard.user_id,
      name: selectedBoard.name,
      isDefault: selectedBoard.is_default,
      position: selectedBoard.position,
      createdAt: selectedBoard.created_at,
      updatedAt: selectedBoard.updated_at,
    },
  ];
}

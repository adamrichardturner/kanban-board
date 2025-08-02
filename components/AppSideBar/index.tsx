'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useBoards } from '@/hooks/boards/useBoards';
import LoadingSpinner from '@/public/spinner.svg';
import { Reorder } from 'framer-motion';
import { BoardResponse } from '@/types';

export function AppSidebar() {
  const { boards, reorderBoards, isLoading } = useBoards();

  const handleReorder = (newOrder: BoardResponse[]) => {
    const reorderData = {
      items: newOrder.map((board, index) => ({
        id: board.id,
        position: index,
      })),
    };
    reorderBoards(reorderData);
  };

  return (
    <Sidebar
      className='bg-white shadow-lg dark:bg-gray-900'
      variant='inset'
      collapsible='offcanvas'
    >
      <SidebarHeader>
        <div className='p-4'>
          <Image
            src={KanBanLogo}
            alt='Kanban Board Logo'
            width={150}
            height={40}
            className='dark:invert'
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!isLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel className='semibold text-[12px] tracking-[2.4px] text-[#828FA3] uppercase'>
              All Boards ({boards.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <Reorder.Group
                values={boards}
                onReorder={handleReorder}
                className='flex min-h-0 w-full flex-col text-sm group-has-[[data-sidebar=menu-action]]/sidebar-group:space-y-1'
                as='ul'
              >
                {boards.map((board) => (
                  <Reorder.Item
                    key={board.id}
                    value={board}
                    className='cursor-grab active:cursor-grabbing'
                    as='li'
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={`/boards/${board.id}`}
                        className='flex w-full items-center gap-2'
                      >
                        <Image
                          src='/boards/board-icon-regular.svg'
                          alt='Board Icon'
                          width={16}
                          height={16}
                        />
                        <span className='truncate'>{board.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <div className='flex w-full items-center justify-center'>
            <Image alt='Loading' src={LoadingSpinner} height={20} width={20} />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Boards</SidebarGroupLabel>
          <SidebarGroupContent>{/* TODO Nav */}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className='p-4'>{/* TODO: Footer */}</div>
      </SidebarFooter>
    </Sidebar>
  );
}

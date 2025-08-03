'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useBoards } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import LoadingSpinner from '@/public/spinner.svg';
import { CreateNewBoardDialog } from './CreateNewBoardDialog';

export function AppSidebar() {
  const { boards, isLoading } = useBoards();
  const { selectedBoardId } = useSelectedBoard();

  return (
    <Sidebar
      className='bg-white shadow-lg dark:bg-gray-900'
      variant='inset'
      collapsible='offcanvas'
    >
      <SidebarHeader className='pb-[32px]'>
        <div className='p-4'>
          <Link href='/boards' className='flex items-center gap-2'>
            <Image
              src={KanBanLogo}
              alt='Kanban Board Logo'
              height={26}
              style={{ width: 'auto', height: '26px' }}
              className='dark:invert'
              priority
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!isLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel className='semibold pb-[20px] pl-[32px] text-[12px] tracking-[2.4px] text-[#828FA3] uppercase'>
              All Boards ({boards.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {boards.map((board) => (
                  <SidebarMenuItem key={board.id}>
                    <SidebarMenuButton
                      asChild
                      className={`${
                        selectedBoardId === board.id
                          ? 'min-h-[48px] max-w-[276px] rounded-l-none rounded-r-full bg-[#635FC7] pl-[32px] font-semibold text-white hover:bg-[#635FC7] hover:text-white focus:bg-[#635FC7] focus:text-white active:bg-[#635FC7] active:text-white'
                          : 'min-h-[48px] pl-[32px] font-semibold text-[#828FA3] focus-within:text-[#828FA3] hover:text-[#828FA3] focus:text-[#828FA3] active:text-[#828FA3]'
                      }`}
                    >
                      <Link
                        href={`/boards/${board.id}`}
                        className='flex w-full items-center gap-4 focus:text-inherit active:text-inherit'
                      >
                        <Image
                          src='/boards/board-icon-regular.svg'
                          alt='Board Icon'
                          width={16}
                          height={16}
                          className={`${
                            selectedBoardId === board.id
                              ? 'brightness-0 invert'
                              : ''
                          }`}
                        />
                        <span className='truncate'>{board.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <CreateNewBoardDialog
                    trigger={
                      <SidebarMenuButton
                        asChild
                        className='min-h-[48px] cursor-pointer gap-4 pl-[32px] font-semibold text-[#635FC7] focus-within:text-[#635FC7] hover:text-[#635FC7] focus:text-[#635FC7] active:text-[#635FC7]'
                      >
                        <div className='flex w-full items-center gap-4'>
                          <Image
                            src='/boards/board-icon-create.svg'
                            alt='Board Icon'
                            width={16}
                            height={16}
                          />
                          <span className='truncate'>+ Create New Board</span>
                        </div>
                      </SidebarMenuButton>
                    }
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <div className='flex w-full items-center justify-center'>
            <Image
              alt='Loading'
              src={LoadingSpinner}
              height={20}
              width={20}
              priority
            />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className='p-4'>{/* TODO: Footer */}</div>
      </SidebarFooter>
    </Sidebar>
  );
}

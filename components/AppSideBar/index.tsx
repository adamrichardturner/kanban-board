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
import KanBanLogoDark from '@/public/logo/kanban-board-logo-dark.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useBoards } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import LoadingSpinner from '@/public/spinner.svg';
import { CreateNewBoardDialog } from './CreateNewBoardDialog';
import { ThemeToggle } from '../theme-toggle';
import { useTheme } from 'next-themes';

export function AppSidebar() {
  const { boards, isLoading } = useBoards();
  const { selectedBoardId } = useSelectedBoard();
  const { theme } = useTheme();

  return (
    <Sidebar
      className='dark:bg-dark-grey bg-white shadow-lg'
      variant='inset'
      collapsible='offcanvas'
    >
      <SidebarHeader className='pb-[32px]'>
        <div className='p-4'>
          <Link href='/boards' className='flex items-center gap-2'>
            <Image
              src={theme === 'dark' ? KanBanLogoDark : KanBanLogo}
              alt='Kanban Board Logo'
              height={26}
              style={{ width: 'auto', height: '26px' }}
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
                          : 'min-h-[48px] pl-[32px] font-semibold text-[#828FA3] focus-within:text-[#828FA3] hover:bg-transparent hover:text-[#828FA3] focus:bg-transparent focus:text-[#828FA3] active:bg-transparent active:text-[#828FA3]'
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
                        className='min-h-[48px] cursor-pointer gap-4 pl-[32px] font-semibold text-[#635FC7] focus-within:text-[#635FC7] hover:bg-transparent hover:text-[#635FC7] focus:bg-transparent focus:text-[#635FC7] active:bg-transparent active:text-[#635FC7]'
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

      <SidebarFooter className='mb-16'>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}

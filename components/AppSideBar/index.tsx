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
import { Calendar, Home, Inbox, Link, Search, Settings } from 'lucide-react';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import Image from 'next/image';
import { useBoards } from '@/hooks/boards/useBoards';
import LoadingSpinner from "@/public/spinner.svg";

// Menu items
const items = [
  {
    title: 'Home',
    url: '#',
    icon: Home,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
  },
  {
    title: 'Calendar',
    url: '#',
    icon: Calendar,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { boards, isLoading } = useBoards();

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
        {!isLoading ? <SidebarGroup>
          <SidebarGroupLabel className="text-[#828FA3] text-[12px] semibold tracking-[2.4px] uppercase">All Boards ({boards.length})</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {boards.map((board) => (
                <Link href={`/boards/${board.id}`} className="flex items-center gap-2" key={board.id}>
                <SidebarMenuItem >
                  <SidebarMenuButton asChild>
                    
                    
                  </SidebarMenuButton>
                </SidebarMenuItem>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> : <div className="w-full flex items-center justify-center"><Image alt="Loading" src={LoadingSpinner} height={20} width={20} /></div> }

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

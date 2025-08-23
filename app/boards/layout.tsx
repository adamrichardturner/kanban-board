'use client';

import { AppSidebar } from '@/components/AppSideBar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <SidebarTrigger />
        <AppSidebar />
        <SidebarInset className='min-h-screen w-full bg-[#F4F7FD] dark:bg-[#20212C]'>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

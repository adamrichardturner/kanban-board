'use client';

import { AppSidebar } from '@/components/AppSideBar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/auth/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <SidebarProvider>
        {/* Always render sidebar shell to prevent layout shift */}
        <SidebarTrigger />
        <AppSidebar />
        <SidebarInset className='min-h-screen w-full bg-[#F4F7FD] dark:bg-[#20212C]'>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

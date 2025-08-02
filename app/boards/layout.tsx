'use client';

import { AppSidebar } from '@/components/AppSideBar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth, usePostLoginRoute } from '@/hooks/auth/useAuth';
import { AuthRedirect } from '@/components/AuthRedirect';
import Image from 'next/image';
import { useBoard } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: routeLoading } = usePostLoginRoute();
  const { isLoadingSelection: boardLoading } = useSelectedBoard();

  if (authLoading || (isAuthenticated && routeLoading)) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Image
          src='/spinner.svg'
          alt='Loading...'
          width={50}
          height={50}
          priority
        />
      </div>
    );
  }

  return (
    <>
      <AuthRedirect />
      {!isAuthenticated ? (
        children
      ) : (
        <SidebarProvider>
          <SidebarTrigger />
          <AppSidebar />
          <SidebarInset className='min-h-screen w-full bg-[#F4F7FD]'>
            {children}
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
}

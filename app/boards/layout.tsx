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

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: routeLoading } = usePostLoginRoute();

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
          <SidebarInset className='min-h-screen w-full bg-[#F4F7FD] dark:bg-[#20212C]'>
            {children}
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
}

import { AppSidebar } from '@/components/AppSideBar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarTrigger />
      <AppSidebar />
      <SidebarInset className='min-h-screen w-full bg-[#F4F7FD]'>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

import { memo, useMemo } from 'react';
import { CreateTaskDialog } from './CreateTaskDialog';
import Image from 'next/image';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import KanBanLogoDark from '@/public/logo/kanban-board-logo-dark.svg';
import KanBanLogoMobile from '@/public/logo/kanban-board-logo-mobile.svg';
import { useSidebar } from '../ui/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { SettingsDropdown } from './SettingsDropdown';
import { useTheme } from 'next-themes';
import { MobileMenu } from './MobileMenu';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppTopBarProps {
  name?: string;
}

export const AppTopBar = memo(function AppTopBar({ name }: AppTopBarProps) {
  const { open } = useSidebar();
  const { selectedBoard, selectedBoardId, todoColumnId } = useSelectedBoard();
  const isMobile = useIsMobile();
  const router = useRouter();
  const displayName = useMemo(
    () => name ?? selectedBoard?.name ?? '',
    [name, selectedBoard?.name],
  );

  const mobileName = useMemo(() => {
    const n = (displayName || '').trim();
    if (n.length <= 16) {
      return n;
    }
    return n.slice(0, 16) + '…';
  }, [displayName]);

  const handleLogoClick = () => {
    router.refresh();
  };

  return (
    <div
      className='flex h-[64px] items-center justify-between bg-white md:h-[90px] md:pr-4 md:pl-4 md:pl-[20px] dark:bg-[#2B2C37]'
      style={{
        boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)',
      }}
    >
      <div className='flex h-full items-center justify-start'>
        <AnimatePresence mode='wait'>
          {!open ? (
            <motion.div
              key='logo'
              initial={{ x: -150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
                mass: 1,
                duration: 0.15,
              }}
            >
              <div
                onClick={handleLogoClick}
                className='flex items-center gap-2 hover:bg-transparent dark:hover:bg-transparent'
              >
                {isMobile ? (
                  <>
                    <Image
                      src={KanBanLogoMobile}
                      alt='Kanban Board Logo'
                      height={26}
                      style={{ width: 'auto', height: '26px' }}
                      priority
                      className='block dark:hidden'
                    />
                    <Image
                      src={KanBanLogoDark}
                      alt='Kanban Board Logo'
                      height={26}
                      style={{ width: 'auto', height: '26px' }}
                      priority
                      className='hidden dark:md:block'
                    />
                  </>
                ) : (
                  <div className='flex items-start gap-2'>
                    <Image
                      src={KanBanLogo}
                      alt='Kanban Board Logo'
                      height={26}
                      style={{ width: 'auto', height: '26px' }}
                      priority
                      className='block dark:hidden'
                    />
                    <Image
                      src={KanBanLogoDark}
                      alt='Kanban Board Logo'
                      height={26}
                      style={{ width: 'auto', height: '26px' }}
                      priority
                      className='hidden dark:md:block'
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div key='logo-mobile' className='flex md:hidden'>
              <Button
                type='button'
                variant='ghost'
                onClick={handleLogoClick}
                className='flex items-center gap-2 hover:bg-transparent dark:hover:bg-transparent'
              >
                <Image
                  src={KanBanLogoMobile}
                  alt='Kanban Board Logo'
                  height={26}
                  style={{ width: 'auto', height: '26px' }}
                  priority
                />
              </Button>
            </div>
          )}
        </AnimatePresence>

        {!open && (
          <div
            aria-hidden
            className='mx-10 hidden w-px self-stretch bg-[#E4EBFA] md:block dark:bg-[#3E3F4E]'
          />
        )}

        <div className='md:hidden'>
          <MobileMenu
            trigger={({ open: popOpen, setOpen: setPopOpen }) => (
              <button
                type='button'
                onClick={() => setPopOpen(!popOpen)}
                className='flex items-center gap-2'
                aria-haspopup='dialog'
                aria-expanded={popOpen}
              >
                <h1 className='text-left text-[18px] leading-none font-bold'>
                  {mobileName}
                </h1>
                {popOpen ? (
                  <ChevronUp className='h-4 w-4 text-[#635FC7]' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-[#635FC7]' />
                )}
              </button>
            )}
          />
        </div>

        <h1 className='hidden text-[18px] leading-none font-bold md:block md:text-2xl'>
          {displayName}
        </h1>
      </div>

      <div className='flex items-center md:gap-4'>
        <CreateTaskDialog
          boardId={selectedBoardId}
          defaultColumnId={todoColumnId}
        />
        <SettingsDropdown board={selectedBoard} />
      </div>
    </div>
  );
});

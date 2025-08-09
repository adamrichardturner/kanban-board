import { CreateTaskDialog } from './CreateTaskDialog';
import Image from 'next/image';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import KanBanLogoDark from '@/public/logo/kanban-board-logo-dark.svg';
import { useSidebar } from '../ui/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { SettingsDropdown } from './SettingsDropdown';
import { useTheme } from 'next-themes';

interface AppTopBarProps {
  name: string;
}

export function AppTopBar({ name }: AppTopBarProps) {
  const { open } = useSidebar();
  const { selectedBoard, selectedBoardId, todoColumnId, isLoadingSelection } =
    useSelectedBoard();
  const { theme } = useTheme();

  return (
    <div
      className='flex h-[90px] items-center justify-between bg-white px-4 pt-1.5 dark:bg-[#2B2C37]'
      style={{
        boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)',
      }}
    >
      <div className='flex items-center justify-start'>
        <AnimatePresence mode='wait'>
          {!open && (
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
              className='pr-12 pl-3'
            >
              <Link href='/boards' className='flex items-center gap-2'>
                <Image
                  src={theme === 'dark' ? KanBanLogoDark : KanBanLogo}
                  alt='Kanban Board Logo'
                  height={26}
                  style={{ width: 'auto', height: '26px' }}
                  priority
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className='text-2xl font-bold'>{name}</h1>
      </div>

      <div className='flex items-center gap-4'>
        <CreateTaskDialog
          boardId={selectedBoardId}
          defaultColumnId={todoColumnId}
        />
        <SettingsDropdown board={selectedBoard} />
      </div>
    </div>
  );
}

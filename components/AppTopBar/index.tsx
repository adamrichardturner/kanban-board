import { CreateTaskRequest } from '@/types/kanban';
import { CreateTaskDialog } from './CreateTaskDialog';
import Image from 'next/image';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import { useSidebar } from '../ui/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface AppTopBarProps {
  name: string;
  createTask: (boardId: string, data: CreateTaskRequest) => void;
}

export function AppTopBar({ name, createTask }: AppTopBarProps) {
  const { open } = useSidebar();

  return (
    <div className='flex h-[90px] items-center justify-between bg-white px-4 pt-1.5'>
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
              className='p-4'
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          className='text-[24px] font-bold text-[#000112]'
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 25,
            mass: 1,
            duration: 0.15,
          }}
        >
          {name}
        </motion.h1>
      </div>

      <CreateTaskDialog />
    </div>
  );
}

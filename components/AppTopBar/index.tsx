import { CreateTaskRequest } from '@/types/kanban';
import { CreateTaskDialog } from './CreateTaskDialog';

interface AppTopBarProps {
  name: string;
  createTask: (boardId: string, data: CreateTaskRequest) => void;
}

export function AppTopBar({ name, createTask }: AppTopBarProps) {
  return (
    <div className='flex h-[90px] items-center justify-between bg-white px-4 pt-1.5'>
      <h1 className='text-[24px] font-bold text-[#000112]'>{name}</h1>
      <CreateTaskDialog />
    </div>
  );
}

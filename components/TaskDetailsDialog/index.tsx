import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EllipsisVerticalIcon } from 'lucide-react';
import { TaskWithSubtasks } from '@/types';
import { UpdateSubtaskRequest } from '@/types/kanban';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EditTaskDialog } from '../Task/EditTaskDialog';
import { toast } from 'sonner';

interface TaskDetailsDialogProps {
  task: TaskWithSubtasks;
  trigger?: React.ReactNode;
}

type MinimalSubtask = { id: string; title: string; status: boolean };

export function TaskDetailsDialog({ task, trigger }: TaskDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(task.columnId);
  const [optimisticSubtasks, setOptimisticSubtasks] = useState<
    MinimalSubtask[]
  >(toMinimal(task.subtasks));

  const { selectedBoard } = useSelectedBoard();
  const { updateTaskAsync, updateSubtaskAsync, useTaskQuery } = useTasks();
  const { data: freshTask } = useTaskQuery(task.id, open);

  // Sync when dialog opens or when fresh task data arrives
  useEffect(() => {
    if (!open) {
      return;
    }
    if (freshTask) {
      setSelectedColumnId(freshTask.columnId);
      setOptimisticSubtasks(toMinimal(freshTask.subtasks || []));
      return;
    }
    setSelectedColumnId(task.columnId);
    setOptimisticSubtasks(toMinimal(task.subtasks));
  }, [open, freshTask, task.columnId, task.subtasks]);

  function toMinimal<T extends { id: string; title: string; status: boolean }>(
    arr: T[],
  ): MinimalSubtask[] {
    return arr.map((s) => ({ id: s.id, title: s.title, status: s.status }));
  }

  const completedSubtasks = useMemo(
    () => optimisticSubtasks.filter((s) => s.status).length,
    [optimisticSubtasks],
  );

  const handleSubtaskToggle = async (
    subtaskId: string,
    currentStatus: boolean,
  ) => {
    const previous = optimisticSubtasks;
    const next = optimisticSubtasks.map((s) =>
      s.id === subtaskId ? { ...s, status: !currentStatus } : s,
    );
    setOptimisticSubtasks(next);

    try {
      const updateData: UpdateSubtaskRequest = { status: !currentStatus };
      await updateSubtaskAsync(subtaskId, updateData);
    } catch (_e) {
      setOptimisticSubtasks(previous);
      toast.error('Failed to update subtask. Please try again.');
    }
  };

  const handleStatusChange = async (newColumnId: string) => {
    if (newColumnId === selectedColumnId) {
      return;
    }
    const prev = selectedColumnId;
    setSelectedColumnId(newColumnId);
    try {
      await updateTaskAsync(task.id, { columnId: newColumnId });
    } catch (_e) {
      setSelectedColumnId(prev);
      toast.error('Failed to update task. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className='cursor-pointer'>{/* Default trigger */}</div>
        )}
      </DialogTrigger>
      <DialogContent className='inset:4 max-h-[90vh] overflow-y-auto rounded-lg'>
        <DialogHeader className='flex flex-row items-start justify-between space-y-0 pb-0'>
          <DialogTitle className='pr-8 text-[18px] leading-[23px] font-bold text-[#000112] dark:text-white'>
            {task.title}
          </DialogTitle>
          <EditTaskDialog
            task={task}
            trigger={
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 text-[#828FA3] hover:text-[#635FC7]'
              >
                <EllipsisVerticalIcon className='h-4 w-4' />
              </Button>
            }
          />
        </DialogHeader>

        <div className='space-y-6'>
          {/* Description */}
          {task.description && (
            <div className='space-y-2'>
              <p className='text-[13px] leading-[23px] text-[#828FA3]'>
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          {optimisticSubtasks && optimisticSubtasks.length > 0 && (
            <div className='space-y-4'>
              <Label className='text-[12px] leading-[15px] font-bold tracking-[0.5px] text-[#828FA3]'>
                Subtasks ({completedSubtasks} of {optimisticSubtasks.length})
              </Label>
              <div className='space-y-2'>
                {optimisticSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className='flex cursor-pointer items-center gap-4 rounded-[4px] bg-[#F4F7FD] p-3 transition-colors hover:bg-[#635FC7]/10 dark:bg-[#20212C]'
                    onClick={() =>
                      handleSubtaskToggle(subtask.id, subtask.status)
                    }
                  >
                    <Checkbox
                      checked={subtask.status}
                      onCheckedChange={(checked) => {
                        // Prevent double-triggering when clicking directly on checkbox
                        return;
                      }}
                      className='pointer-events-none h-4 w-4 border-[#828FA3]/25 data-[state=checked]:border-[#635FC7] data-[state=checked]:bg-[#635FC7]'
                    />
                    <span
                      className={`flex-1 text-[12px] leading-[15px] font-bold ${
                        subtask.status
                          ? 'text-[#828FA3]/90 line-through'
                          : 'text-[#000112] dark:text-white'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className='space-y-2'>
            <Label className='text-[12px] leading-[15px] font-bold tracking-[0.5px] text-[#828FA3]'>
              Current Status
            </Label>
            {selectedBoard?.columns ? (
              <Select
                key={`${task.id}-${task.columnId}`}
                value={selectedColumnId}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className='h-10 w-full border-[#828FA3]/25 text-[13px] font-medium'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {selectedBoard.columns.map((column) => (
                    <SelectItem
                      key={column.id}
                      value={column.id}
                      className='text-[13px]'
                    >
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className='border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 py-2 text-sm'>
                Loading columns...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

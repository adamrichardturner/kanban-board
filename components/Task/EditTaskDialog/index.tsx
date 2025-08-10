import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { TaskWithSubtasks } from '@/types';
import {
  UpdateTaskRequest,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
} from '@/types/kanban';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import Image from 'next/image';

interface EditTaskDialogProps {
  task: TaskWithSubtasks;
  trigger?: React.ReactNode;
}

interface EditableSubtask {
  id?: string;
  title: string;
  status: boolean;
  isNew?: boolean;
}

export function EditTaskDialog({ task, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<EditableSubtask[]>([]);
  const [selectedColumnId, setSelectedColumnId] = useState('');

  const { selectedBoard } = useSelectedBoard();
  const {
    updateTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    isUpdatingTask,
    isCreatingSubtask,
    isUpdatingSubtask,
    isDeletingSubtask,
  } = useTasks();

  const initializeFromTask = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setSelectedColumnId(task.columnId);
    const editableSubtasks: EditableSubtask[] = task.subtasks.map(
      (subtask) => ({
        id: subtask.id,
        title: subtask.title,
        status: subtask.status,
        isNew: false,
      }),
    );
    setSubtasks(editableSubtasks);
  };

  const addSubtask = () => {
    if (subtasks.length < 8) {
      setSubtasks([...subtasks, { title: '', status: false, isNew: true }]);
    }
  };

  const updateSubtaskTitle = (index: number, newTitle: string) => {
    const updated = [...subtasks];
    updated[index].title = newTitle;
    setSubtasks(updated);
  };

  const removeSubtask = (index: number) => {
    const subtaskToRemove = subtasks[index];

    if (subtaskToRemove.id && !subtaskToRemove.isNew) {
      // Delete existing subtask from backend
      deleteSubtask(subtaskToRemove.id);
    }

    // Remove from local state
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // Update the main task
    const taskUpdateData: UpdateTaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      columnId:
        selectedColumnId !== task.columnId ? selectedColumnId : undefined,
    };

    updateTask(task.id, taskUpdateData);

    // Handle subtask updates
    for (const subtask of subtasks) {
      if (subtask.title.trim()) {
        if (subtask.isNew) {
          // Create new subtask
          const createData: CreateSubtaskRequest = {
            title: subtask.title.trim(),
            status: subtask.status,
          };
          createSubtask(task.id, createData);
        } else if (subtask.id) {
          // Update existing subtask
          const originalSubtask = task.subtasks.find(
            (s) => s.id === subtask.id,
          );
          if (
            originalSubtask &&
            (originalSubtask.title !== subtask.title.trim() ||
              originalSubtask.status !== subtask.status)
          ) {
            const updateData: UpdateSubtaskRequest = {
              title: subtask.title.trim(),
              status: subtask.status,
            };
            updateSubtask(subtask.id, updateData);
          }
        }
      }
    }

    // Reset form and close dialog
    setOpen(false);
  };

  const isLoading =
    isUpdatingTask ||
    isCreatingSubtask ||
    isUpdatingSubtask ||
    isDeletingSubtask;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
          initializeFromTask();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <div className='cursor-pointer'>
            {/* Default trigger can be the task card itself */}
          </div>
        )}
      </DialogTrigger>
      <DialogContent className='inset:4 max-h-[90vh] max-w-md overflow-y-auto rounded-lg sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold text-[#000112] dark:text-white'>
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title' className='text-sm font-bold text-[#828FA3]'>
              Title
            </Label>
            <Input
              id='title'
              placeholder='e.g. Take coffee break'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full'
            />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label
              htmlFor='description'
              className='text-sm font-bold text-[#828FA3]'
            >
              Description
            </Label>
            <Textarea
              id='description'
              placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='min-h-[100px] w-full resize-none'
            />
          </div>

          {/* Subtasks */}
          <div className='space-y-2'>
            <Label className='text-sm font-bold text-[#828FA3]'>Subtasks</Label>
            <div className='space-y-2'>
              {subtasks.map((subtask, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <Input
                    placeholder='e.g. Make coffee'
                    value={subtask.title}
                    onChange={(e) => updateSubtaskTitle(index, e.target.value)}
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeSubtask(index)}
                    className='flex h-10 w-10 items-center justify-center p-0 text-[#828FA3] hover:text-red-500'
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={addSubtask}
              disabled={subtasks.length >= 8}
              className='w-full border-[#635FC7]/25 bg-[#635FC7]/10 text-[#635FC7] hover:bg-[#635FC7]/20 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Plus size={16} className='mr-2' />
              Add New Subtask {subtasks.length >= 8 && '(Max 8)'}
            </Button>
          </div>

          {/* Status */}
          <div className='space-y-2'>
            <Label className='text-sm font-bold text-[#828FA3]'>Status</Label>
            <Select
              value={selectedColumnId}
              onValueChange={setSelectedColumnId}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                {selectedBoard?.columns?.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || isLoading}
          className='w-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90'
        >
          {isLoading ? (
            <div className='flex items-center gap-2'>
              <Image
                src='/spinner.svg'
                alt='Saving...'
                width={16}
                height={16}
                priority
                className='brightness-0 invert'
              />
              Saving Changes...
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

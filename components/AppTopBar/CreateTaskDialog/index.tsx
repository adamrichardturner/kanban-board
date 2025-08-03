import { useState, useEffect } from 'react';
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
import { CreateTaskRequest } from '@/types/kanban';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';
import Image from 'next/image';

interface CreateTaskDialogProps {
  defaultColumnId?: string;
  boardId: string;
  trigger?: React.ReactNode;
}

export function CreateTaskDialog({
  defaultColumnId,
  boardId,
  trigger,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [selectedColumnId, setSelectedColumnId] = useState('');

  const {
    createTask,
    createTaskWithSubtasks,
    isCreatingTask,
    isCreatingTaskWithSubtasks,
  } = useTasks();
  const { selectedBoard } = useSelectedBoard();

  // Set default column when dialog opens or defaultColumnId changes
  useEffect(() => {
    if (open && defaultColumnId) {
      setSelectedColumnId(defaultColumnId);
    }
  }, [open, defaultColumnId]);

  // Get available columns from the selected board
  const availableColumns = selectedBoard?.columns || [];
  const sortedColumns = [...availableColumns].sort(
    (a, b) => a.position - b.position,
  );

  const handleAddSubtask = () => {
    if (subtasks.length < 8) {
      setSubtasks([...subtasks, '']);
    }
  };

  const handleRemoveSubtask = (index: number) => {
    if (subtasks.length > 1) {
      setSubtasks(subtasks.filter((_, i) => i !== index));
    }
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleSubmit = () => {
    if (!title.trim() || !selectedColumnId) return;

    const filteredSubtasks = subtasks
      .filter((subtask) => subtask.trim())
      .map((subtask) => ({ title: subtask.trim() }));

    const taskData: CreateTaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      columnId: selectedColumnId,
      subtasks: filteredSubtasks,
    };

    // Use createTaskWithSubtasks if subtasks are provided for better cache management
    if (filteredSubtasks.length > 0) {
      createTaskWithSubtasks(boardId, taskData);
    } else {
      createTask(boardId, taskData);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setSubtasks(['']);
    setSelectedColumnId(defaultColumnId || '');
    setOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubtasks(['']);
    setSelectedColumnId(defaultColumnId || '');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant='outline'
            className='h-[48px] w-[164px] cursor-pointer rounded-full bg-[#635FC7] text-white transition-colors hover:bg-[#635FC7]/90 hover:text-white'
          >
            + Add New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title' className='text-[#828FA3]'>
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
            <Label htmlFor='description' className='text-[#828FA3]'>
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
            <Label className='text-[#828FA3]'>Subtasks</Label>
            <div className='space-y-2'>
              {subtasks.map((subtask, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <Input
                    placeholder={
                      index === 0
                        ? 'e.g. Make coffee'
                        : 'e.g. Drink coffee & smile'
                    }
                    value={subtask}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => handleRemoveSubtask(index)}
                    disabled={subtasks.length === 1}
                    className='h-10 w-10 p-0 hover:bg-gray-100'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              <Button
                type='button'
                variant='ghost'
                onClick={handleAddSubtask}
                disabled={subtasks.length >= 6}
                className='mt-1 w-full cursor-pointer rounded-full bg-[#635FC7]/10 text-[#635FC7] hover:bg-[#635FC7]/20 hover:text-[#635FC7] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add New Subtask {subtasks.length >= 6 && '(Max 6)'}
              </Button>
            </div>
          </div>

          {/* Column Selection */}
          <div className='space-y-2'>
            <Label className='text-[#828FA3]'>Status</Label>
            <Select
              value={selectedColumnId}
              onValueChange={setSelectedColumnId}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a column' />
              </SelectTrigger>
              <SelectContent>
                {sortedColumns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !title.trim() ||
            !selectedColumnId ||
            isCreatingTask ||
            isCreatingTaskWithSubtasks
          }
          className='w-full rounded-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90'
        >
          {isCreatingTask || isCreatingTaskWithSubtasks ? (
            <div className='flex items-center gap-2'>
              <Image
                src='/spinner.svg'
                alt='Creating...'
                width={16}
                height={16}
                priority
                className='brightness-0 invert'
              />
              Creating...
            </div>
          ) : (
            'Create Task'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

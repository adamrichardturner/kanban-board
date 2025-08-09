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
import { X, Plus } from 'lucide-react';
import { useBoards } from '@/hooks/boards/useBoards';
import Image from 'next/image';

interface CreateNewBoardDialogProps {
  trigger?: React.ReactNode;
}

export function CreateNewBoardDialog({ trigger }: CreateNewBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<string[]>(['Todo', 'Doing', 'Done']);

  const { createBoard, isCreating, boards } = useBoards();

  const handleAddColumn = () => {
    if (columns.length < 6) {
      setColumns([...columns, '']);
    }
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleColumnChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    setColumns(newColumns);
  };

  const handleSubmit = () => {
    if (!boardName.trim()) {
      return;
    }

    // Check if user has reached the maximum number of boards (8)
    if (boards && boards.length >= 8) {
      // Could add a toast notification here if needed
      return;
    }

    const filteredColumns = columns.filter((column) => column.trim());

    createBoard({
      name: boardName.trim(),
      isDefault: false,
      columns: filteredColumns.length > 0 ? filteredColumns : undefined,
    });

    setBoardName('');
    setColumns(['Todo', 'Doing', 'Done']);
    setOpen(false);
  };

  const resetForm = () => {
    setBoardName('');
    setColumns(['Todo', 'Doing', 'Done']);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant='outline'
            className='h-[48px] w-[164px] cursor-pointer rounded-full bg-[#635FC7] text-white transition-colors hover:bg-[#635FC7]/90 hover:text-white'
          >
            + Add New Board
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='inset:4 rounded-lg sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add New Board</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Board Name */}
          <div className='space-y-2'>
            <Label htmlFor='boardName'>Board Name</Label>
            <Input
              id='boardName'
              placeholder='e.g. Web Design'
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className='w-full'
            />
          </div>

          {/* Board Columns */}
          <div className='space-y-2'>
            <Label>Board Columns</Label>
            <div className='space-y-2'>
              {columns.map((column, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <Input
                    placeholder={
                      index === 0
                        ? 'e.g. Todo'
                        : index === 1
                          ? 'e.g. Doing'
                          : 'e.g. Done'
                    }
                    value={column}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => handleRemoveColumn(index)}
                    disabled={columns.length === 1}
                    className='h-10 w-10 p-0 hover:bg-gray-100'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              <Button
                type='button'
                variant='ghost'
                onClick={handleAddColumn}
                disabled={columns.length >= 6}
                className='mt-1 w-full rounded-full text-[#635FC7] hover:bg-[#635FC7]/10 hover:text-[#635FC7] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-[#635FC7] dark:hover:bg-white/90'
              >
                + Add New Column {columns.length >= 6 && '(Max 6)'}
              </Button>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !boardName.trim() || isCreating || (boards && boards.length >= 8)
          }
          className='w-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isCreating ? (
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
          ) : boards && boards.length >= 8 ? (
            'Maximum boards reached (8)'
          ) : (
            'Create New Board'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

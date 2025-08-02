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

interface CreateNewBoardDialogProps {
  trigger?: React.ReactNode;
}

export function CreateNewBoardDialog({ trigger }: CreateNewBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<string[]>(['Todo', 'Doing']);

  const { createBoard, isCreating } = useBoards();

  const handleAddColumn = () => {
    setColumns([...columns, '']);
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

    const filteredColumns = columns.filter((column) => column.trim());

    createBoard({
      name: boardName.trim(),
      isDefault: false,
      columns: filteredColumns.length > 0 ? filteredColumns : undefined,
    });

    setBoardName('');
    setColumns(['Todo', 'Doing']);
    setOpen(false);
  };

  const resetForm = () => {
    setBoardName('');
    setColumns(['Todo', 'Doing']);
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
      <DialogContent className='sm:max-w-md'>
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
                className='w-full text-[#635FC7] hover:bg-[#635FC7]/10 hover:text-[#635FC7]'
              >
                <Plus className='mr-2 h-4 w-4' />+ Add New Column
              </Button>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleSubmit}
          disabled={!boardName.trim() || isCreating}
          className='w-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90'
        >
          {isCreating ? 'Creating...' : 'Create New Board'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

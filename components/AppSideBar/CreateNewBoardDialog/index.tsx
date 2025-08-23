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
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { Reorder } from 'framer-motion';
import { useCreateBoard } from '@/hooks/boards/useCreateBoard';
import { ReorderableColumnRow as SharedReorderableColumnRow } from '@/components/ReorderableColumnRow';

interface CreateNewBoardDialogProps {
  trigger?: React.ReactNode;
}

export function CreateNewBoardDialog({ trigger }: CreateNewBoardDialogProps) {
  const {
    open,
    setOpen,
    boardName,
    setBoardName,
    columns,
    setColumns,
    handleAddColumn,
    handleRemoveColumn,
    handleNameChange,
    handleColorChange,
    handleSubmit,
    resetForm,
    isCreating,
    boards,
  } = useCreateBoard();

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
            <Reorder.Group
              axis='y'
              values={columns}
              onReorder={(next) => {
                setColumns(next);
              }}
              className='space-y-2'
            >
              {columns.map((column, index) => (
                <SharedReorderableColumnRow
                  key={column.id}
                  column={column}
                  index={index}
                  onNameChange={handleNameChange}
                  onRemove={handleRemoveColumn}
                  onColorChange={handleColorChange}
                  placeholder='e.g. Column name'
                />
              ))}
            </Reorder.Group>

            <Button
              type='button'
              variant='ghost'
              onClick={handleAddColumn}
              disabled={columns.length >= 6}
              className='mt-1 w-full rounded-full text-[#635FC7] hover:bg-[#635FC7]/10 hover:text-[#635FC7] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-[#635FC7] dark:hover:bg-white/90'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add New Column {columns.length >= 6 && '(Max 6)'}
            </Button>
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

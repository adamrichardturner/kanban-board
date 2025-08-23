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
import { GripVertical, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { Reorder, useDragControls } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateBoard } from '@/hooks/boards/useCreateBoard';

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
                <CreateReorderableColumnRow
                  key={column.id}
                  column={column}
                  index={index}
                  onNameChange={handleNameChange}
                  onRemove={handleRemoveColumn}
                  onColorChange={handleColorChange}
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

function CreateReorderableColumnRow({
  column,
  index,
  onNameChange,
  onRemove,
  onColorChange,
}: {
  column: { id: string; name: string; color?: string };
  index: number;
  onNameChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onColorChange: (index: number, color: string) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={column}
      dragListener={false}
      dragControls={controls}
      className='flex items-center gap-2'
    >
      <button
        type='button'
        onPointerDown={(e) => controls.start(e)}
        className='h-10 w-8 cursor-grab text-[#828FA3] hover:text-[#635FC7]'
        aria-label='Drag column'
      >
        <GripVertical className='h-4 w-4' />
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='h-9 w-9 rounded-md border border-gray-200'
            style={{ backgroundColor: column.color ?? '#635FC7' }}
            aria-label='Pick column color'
            title='Pick column color'
          />
        </PopoverTrigger>
        <PopoverContent className='w-64' align='start'>
          <Label className='mb-2 block text-xs text-[#828FA3]'>
            Column color
          </Label>
          <div className='grid grid-cols-6 gap-2'>
            {[
              '#635FC7',
              '#FF6B6B',
              '#4ECDC4',
              '#45B7D1',
              '#96CEB4',
              '#FFEAA7',
              '#DDA0DD',
              '#98D8C8',
              '#F7DC6F',
              '#BB8FCE',
              '#85C1E9',
              '#82E0AA',
            ].map((c) => (
              <button
                key={c}
                type='button'
                className='h-7 w-7 rounded-md border'
                style={{ backgroundColor: c }}
                onClick={() => onColorChange(index, c)}
                aria-label={`Select ${c}`}
                title={c}
              />
            ))}
          </div>
          <div className='mt-3 flex items-center gap-2'>
            <Label className='text-xs text-[#828FA3]'>Custom:</Label>
            <input
              type='color'
              value={column.color ?? '#635FC7'}
              onChange={(e) => onColorChange(index, e.target.value)}
              className='h-8 w-10 cursor-pointer rounded border border-gray-200 p-0'
            />
          </div>
        </PopoverContent>
      </Popover>
      <Input
        placeholder='e.g. Column name'
        value={column.name}
        onChange={(e) => onNameChange(index, e.target.value)}
        className='flex-1'
      />
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onRemove(index)}
        className='h-10 w-10 p-0 hover:bg-gray-100'
      >
        <X className='h-4 w-4' />
      </Button>
    </Reorder.Item>
  );
}

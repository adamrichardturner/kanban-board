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
import { Plus } from 'lucide-react';
import { ColorSelector } from '@/components/ui/color-selector';
import { useBoards } from '@/hooks/boards/useBoards';
import { useSelectedBoard } from '@/hooks/boards/useSelectedBoard';

interface CreateColumnDialogProps {
  trigger?: React.ReactNode;
}

export function CreateColumnDialog({ trigger }: CreateColumnDialogProps) {
  const [open, setOpen] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#635FC7');

  const { selectedBoard, selectedBoardId } = useSelectedBoard();
  const { createColumn, isCreatingColumn } = useBoards();

  // Reset handled explicitly on dialog close in onOpenChange

  const handleSubmit = () => {
    if (!columnName.trim() || !selectedBoardId) {
      return;
    }

    // Check if board already has 6 columns (max limit)
    if (selectedBoard?.columns && selectedBoard.columns.length >= 6) {
      return;
    }

    createColumn({
      boardId: selectedBoardId,
      name: columnName.trim(),
      color: selectedColor,
    });

    // Reset form and close dialog
    setColumnName('');
    setSelectedColor('#635FC7');
    setOpen(false);
  };

  const resetForm = () => {
    setColumnName('');
    setSelectedColor('#635FC7');
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
            <Plus className='mr-2 h-4 w-4' />
            Add Column
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Column Name */}
          <div className='space-y-2'>
            <Label htmlFor='columnName' className='text-[#828FA3]'>
              Column Name
            </Label>
            <Input
              id='columnName'
              placeholder='e.g. In Progress'
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className='w-full'
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <ColorSelector
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            label='Column Color'
          />
        </div>

        {/* Create Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !columnName.trim() ||
            isCreatingColumn ||
            (selectedBoard?.columns && selectedBoard.columns.length >= 6)
          }
          className='w-full rounded-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isCreatingColumn ? (
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              Creating...
            </div>
          ) : selectedBoard?.columns && selectedBoard.columns.length >= 6 ? (
            'Maximum columns reached (6)'
          ) : (
            'Create Column'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

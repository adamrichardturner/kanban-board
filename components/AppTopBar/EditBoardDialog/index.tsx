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
import { Plus, EllipsisVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useBoards } from '@/hooks/boards/useBoards';
import { BoardWithColumns } from '@/types';
import Image from 'next/image';
import { ReorderableColumnRow as SharedReorderableColumnRow } from '@/components/ReorderableColumnRow';

interface EditBoardDialogProps {
  board?: BoardWithColumns | null;
  trigger?: React.ReactNode;
}

interface ColumnData {
  id?: string;
  name: string;
  position: number;
  isNew?: boolean;
  color?: string;
}

export function EditBoardDialog({ board, trigger }: EditBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<ColumnData[]>(
    board?.columns.map((col) => ({
      id: col.id,
      name: col.name,
      position: col.position,
      color: col.color,
    })) || [],
  );

  const { updateBoard, isUpdating } = useBoards();

  if (!board) {
    return null;
  }

  const handleAddColumn = () => {
    if (columns.length < 6) {
      const newPosition =
        Math.max(...columns.map((col) => col.position), -1) + 1;
      setColumns([
        ...columns,
        {
          name: '',
          position: newPosition,
          isNew: true,
        },
      ]);
    }
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnNameChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], name: value };
    setColumns(newColumns);
  };

  const handleSubmit = () => {
    if (!boardName.trim()) return;

    const validColumns = columns
      .filter((col) => col.name.trim())
      .map((col, index) => ({
        id: col.id,
        name: col.name.trim(),
        position: index,
        color: col.color,
        isNew: col.isNew,
      }));

    const updateData = {
      name: boardName.trim(),
      columns: validColumns,
    };

    updateBoard(board.id, updateData);
    setOpen(false);
  };

  const resetForm = () => {
    setBoardName(board?.name || '');
    const sortedColumns = [...(board?.columns || [])].sort(
      (a, b) => a.position - b.position,
    );
    setColumns(
      sortedColumns.map((col) => ({
        id: col.id,
        name: col.name,
        position: col.position,
      })),
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (newOpen) {
            setBoardName(board?.name || '');
            const sortedColumns = [...(board?.columns || [])].sort(
              (a, b) => a.position - b.position,
            );
            setColumns(
              sortedColumns.map((col) => ({
                id: col.id,
                name: col.name,
                position: col.position,
                color: col.color,
              })),
            );
          } else {
            resetForm();
          }
        }}
      >
        <DialogTrigger asChild>
          {trigger || (
            <EllipsisVertical className='cursor-pointer text-[#828FA3]' />
          )}
        </DialogTrigger>
        <DialogContent className='inset:4 rounded-lg sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
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
                onReorder={setColumns}
                className='space-y-2'
              >
                {columns.map((column, index) => (
                  <SharedReorderableColumnRow
                    key={column.id ?? `new-${index}-${column.position}`}
                    column={column}
                    index={index}
                    onNameChange={handleColumnNameChange}
                    onRemove={handleRemoveColumn}
                    onColorChange={(idx, color) => {
                      const next = [...columns];
                      next[idx] = { ...next[idx], color };
                      setColumns(next);
                    }}
                    placeholder='e.g. Todo'
                  />
                ))}
              </Reorder.Group>

              <Button
                type='button'
                variant='ghost'
                onClick={handleAddColumn}
                disabled={columns.length >= 6}
                className='w-full text-[#635FC7] hover:bg-[#635FC7]/10 hover:text-[#635FC7] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add New Column {columns.length >= 6 && '(Max 6)'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col gap-2'>
            <Button
              onClick={handleSubmit}
              disabled={!boardName.trim() || isUpdating}
              className='w-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90'
            >
              {isUpdating ? (
                <div className='flex items-center gap-2'>
                  <Image
                    src='/spinner.svg'
                    alt='Saving...'
                    width={16}
                    height={16}
                    priority
                    className='brightness-0 invert'
                  />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

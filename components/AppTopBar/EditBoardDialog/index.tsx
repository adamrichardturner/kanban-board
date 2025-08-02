import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, EllipsisVertical, Trash2 } from 'lucide-react';
import { useBoards } from '@/hooks/boards/useBoards';
import { BoardWithColumns } from '@/types';

interface EditBoardDialogProps {
  board?: BoardWithColumns | null; // Made optional and nullable
  trigger?: React.ReactNode;
}

interface ColumnData {
  id?: string; // undefined for new columns
  name: string;
  position: number;
  isNew?: boolean;
}

export function EditBoardDialog({ board, trigger }: EditBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<ColumnData[]>([]);

  const { updateBoard, deleteBoard, isUpdating, isDeleting } = useBoards();

  // Initialize form data when dialog opens or board changes
  useEffect(() => {
    if (open && board) {
      setBoardName(board.name);
      const sortedColumns = [...(board.columns || [])].sort(
        (a, b) => a.position - b.position,
      );
      setColumns(
        sortedColumns.map((col) => ({
          id: col.id,
          name: col.name,
          position: col.position,
        })),
      );
    }
  }, [open, board]);

  // Don't render if no board is provided (after hooks)
  if (!board) {
    return null;
  }

  const handleAddColumn = () => {
    const newPosition = Math.max(...columns.map((col) => col.position), -1) + 1;
    setColumns([
      ...columns,
      {
        name: '',
        position: newPosition,
        isNew: true,
      },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length > 1) {
      // Prevent removing all columns
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleColumnNameChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], name: value };
    setColumns(newColumns);
  };

  const handleSubmit = () => {
    if (!boardName.trim()) return;

    // Filter out empty column names
    const validColumns = columns.filter((col) => col.name.trim());

    if (validColumns.length === 0) return;

    // Prepare update data
    const updateData = {
      name: boardName.trim(),
      columns: validColumns.map((col, index) => ({
        id: col.id,
        name: col.name.trim(),
        position: index,
        isNew: col.isNew,
      })),
    };

    updateBoard(board.id, updateData);
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteBoard(board.id);
      setDeleteDialogOpen(false);
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
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
          if (!newOpen) resetForm();
        }}
      >
        <DialogTrigger asChild>
          {trigger || (
            <EllipsisVertical className='cursor-pointer text-[#828FA3]' />
          )}
        </DialogTrigger>
        <DialogContent className='sm:max-w-md'>
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
              <div className='space-y-2'>
                {columns.map((column, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Input
                      placeholder='e.g. Todo'
                      value={column.name}
                      onChange={(e) =>
                        handleColumnNameChange(index, e.target.value)
                      }
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
                  <Plus className='mr-2 h-4 w-4' />
                  Add New Column
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col gap-2'>
            <Button
              onClick={handleSubmit}
              disabled={
                !boardName.trim() ||
                columns.filter((col) => col.name.trim()).length === 0 ||
                isUpdating
              }
              className='w-full bg-[#635FC7] text-white hover:bg-[#635FC7]/90'
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>

            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Board
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='sm:max-w-md'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='text-red-600'>
                    Delete this board?
                  </AlertDialogTitle>
                  <AlertDialogDescription className='text-gray-600'>
                    Are you sure you want to delete the '{board.name}' board?
                    This action will remove all columns and tasks and cannot be
                    reversed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex flex-col-reverse gap-2 sm:flex-row'>
                  <AlertDialogCancel className='w-full sm:w-auto'>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className='w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto'
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

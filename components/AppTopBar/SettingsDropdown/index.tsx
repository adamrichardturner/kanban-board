import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical, Edit, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useBoards } from '@/hooks/boards/useBoards';
import { EditBoardDialog } from '../EditBoardDialog';
import { BoardWithColumns } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SettingsDropdownProps {
  board?: BoardWithColumns | null;
}

export function SettingsDropdown({ board }: SettingsDropdownProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const { logout } = useAuth();
  const { deleteBoard, isDeleting } = useBoards();

  // Trigger the edit dialog when editDialogOpen changes to true
  useEffect(() => {
    if (editDialogOpen && editButtonRef.current) {
      editButtonRef.current.click();
      setEditDialogOpen(false); // Reset state after triggering
    }
  }, [editDialogOpen]);

  const handleEditBoard = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteBoard = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBoard = () => {
    if (board) {
      deleteBoard(board.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='rounded-md p-2 transition-colors hover:bg-gray-100'>
            <EllipsisVertical className='h-6 w-6 cursor-pointer text-[#828FA3]' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem
            onClick={handleEditBoard}
            className='cursor-pointer'
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit Board
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteBoard}
            className='cursor-pointer text-red-600 focus:text-red-600'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete Board
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
            <LogOut className='mr-2 h-4 w-4' />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Board Dialog */}
      <EditBoardDialog
        board={board}
        trigger={
          <button
            ref={editButtonRef}
            style={{ display: 'none' }}
            aria-hidden='true'
            type='button'
          />
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{board?.name}&quot;
              board? This action cannot be undone and will remove all columns
              and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBoard}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {isDeleting ? 'Deleting...' : 'Delete Board'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState } from 'react';
import { useBoards } from './useBoards';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

export function useCreateBoard() {
  const [open, setOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<
    {
      id: string;
      name: string;
      color?: string;
    }[]
  >([
    { id: 'new-0', name: 'Todo', color: '#6B7280' },
    { id: 'new-1', name: 'Doing', color: '#F59E0B' },
    { id: 'new-2', name: 'Done', color: '#10B981' },
  ]);

  const { createBoard, isCreating, boards } = useBoards();

  const handleAddColumn = () => {
    if (columns.length >= 6) {
      return;
    }
    const id = nanoid();
    setColumns([...columns, { id, name: '', color: '#635FC7' }]);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length <= 1) {
      return;
    }
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleNameChange = (index: number, value: string) => {
    const next = [...columns];
    next[index] = { ...next[index], name: value };
    setColumns(next);
  };

  const handleColorChange = (index: number, color: string) => {
    const next = [...columns];
    next[index] = { ...next[index], color };
    setColumns(next);
  };

  const handleSubmit = () => {
    if (!boardName.trim()) {
      return;
    }

    if (boards && boards.length >= 8) {
      toast.error('Maximum boards reached (8)');
      return;
    }

    const filteredColumns = columns
      .filter((column) => column.name.trim())
      .map((c) => ({ name: c.name.trim(), color: c.color }));

    createBoard({
      name: boardName.trim(),
      isDefault: false,
      columns: filteredColumns.length > 0 ? filteredColumns : undefined,
    });

    setBoardName('');
    setColumns([
      { id: 'new-0', name: 'Todo', color: '#6B7280' },
      { id: 'new-1', name: 'Doing', color: '#F59E0B' },
      { id: 'new-2', name: 'Done', color: '#10B981' },
    ]);
    setOpen(false);
  };

  const resetForm = () => {
    setBoardName('');
    setColumns([
      { id: 'new-0', name: 'Todo', color: '#6B7280' },
      { id: 'new-1', name: 'Doing', color: '#F59E0B' },
      { id: 'new-2', name: 'Done', color: '#10B981' },
    ]);
  };

  return {
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
  };
}

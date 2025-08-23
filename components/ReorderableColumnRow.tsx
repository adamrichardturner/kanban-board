import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, X } from 'lucide-react';

export type ReorderableColumn = {
  id?: string;
  name: string;
  color?: string;
  position?: number;
  isNew?: boolean;
};

interface ReorderableColumnRowProps {
  column: ReorderableColumn;
  index: number;
  onNameChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onColorChange: (index: number, color: string) => void;
  placeholder?: string;
  palette?: string[];
}

const DEFAULT_PALETTE: string[] = [
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
];

export function ReorderableColumnRow({
  column,
  index,
  onNameChange,
  onRemove,
  onColorChange,
  placeholder = 'e.g. Column name',
  palette = DEFAULT_PALETTE,
}: ReorderableColumnRowProps) {
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
            {palette.map((c) => (
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
        placeholder={placeholder}
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

export default ReorderableColumnRow;

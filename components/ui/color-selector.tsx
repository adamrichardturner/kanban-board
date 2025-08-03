import { useState } from 'react';
import { Label } from '@/components/ui/label';

// Predefined color palette for consistent brand colors
const colorPalette = [
  '#635FC7', // Purple (primary)
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#82E0AA', // Light Green
];

interface ColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorSelector({
  selectedColor,
  onColorChange,
  label = 'Color',
  className = '',
}: ColorSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label with Selected Color Preview */}
      <div className='flex items-center justify-between'>
        <Label className='text-[#828FA3]'>{label}</Label>
        <div className='flex items-center gap-2'>
          <div
            className='h-5 w-5 rounded-full border-2 border-gray-300 shadow-sm transition-all hover:scale-110'
            style={{ backgroundColor: selectedColor }}
            title={`Selected: ${selectedColor}`}
          />
          <span className='font-mono text-xs tracking-wider text-gray-500'>
            {selectedColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Color Palette Grid */}
      <div className='grid grid-cols-6 gap-3 pt-1'>
        {colorPalette.map((color) => (
          <button
            key={color}
            type='button'
            className={`h-9 w-9 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
              selectedColor === color
                ? 'scale-105 border-gray-500 shadow-lg ring-2 ring-gray-400 ring-offset-2'
                : 'border-gray-200 hover:border-gray-400'
            } `}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={color.toUpperCase()}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

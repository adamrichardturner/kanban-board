'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='flex w-full flex-col space-y-4 p-4'>
        <div className='flex w-full items-center justify-center space-x-4 rounded-md bg-[#F4F7FD] p-3 dark:bg-[#20212C]'>
          <Sun className='h-5 w-5 text-[#828FA3]' />
          <div className='relative inline-flex h-6 w-10 items-center rounded-full bg-[#635FC7]'>
            <span className='inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white' />
          </div>
          <Moon className='h-5 w-5 text-[#828FA3]' />
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className='flex w-full flex-col space-y-4 p-4'>
      <div className='flex w-full items-center justify-center space-x-4 rounded-md bg-[#F4F7FD] p-3 dark:bg-[#20212C]'>
        <Sun className='h-5 w-5 text-[#828FA3]' />
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          className='h-[24px] w-[40px] cursor-pointer rounded-full border-0 shadow-none data-[state=checked]:bg-[#635FC7] data-[state=unchecked]:bg-[#635FC7] [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-[20px] [&>span]:data-[state=unchecked]:translate-x-[2px]'
        />
        <Moon className='h-5 w-5 text-[#828FA3]' />
      </div>
    </div>
  );
}

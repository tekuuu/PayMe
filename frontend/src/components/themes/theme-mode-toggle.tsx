'use client';

import { IconBrightness, IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg text-muted-foreground'>
        <IconBrightness size={16} />
      </Button>
    );
  }

  const currentIcon = theme === 'light' ? IconSun : theme === 'dark' ? IconMoon : IconDeviceDesktop;

  const options = [
    { value: 'light', label: 'Light', icon: IconSun },
    { value: 'dark', label: 'Dark', icon: IconMoon },
    { value: 'system', label: 'System', icon: IconDeviceDesktop },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground'>
          {React.createElement(currentIcon, { size: 16 })}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={isActive ? 'font-semibold' : undefined}
            >
              <Icon size={14} />
              <span>{option.label}</span>
              {isActive && (
                <span className='ml-auto text-xs text-muted-foreground'>
                  Active
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

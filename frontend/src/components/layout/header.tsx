"use client";

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export default function Header() {
  const { status, refresh } = useFhevmContext();

  const fheLabel = status === 'ready'
    ? 'FHE Ready'
    : status === 'error'
      ? 'FHE Error'
      : 'FHE Initializing';

  const fheClass = status === 'ready'
    ? 'text-green-600 border-green-500/30 bg-green-500/10 dark:text-green-400 dark:border-green-400/30 dark:bg-green-400/10'
    : status === 'error'
      ? 'text-red-600 border-red-500/30 bg-red-500/10 dark:text-red-400 dark:border-red-400/30 dark:bg-red-400/10'
      : 'text-yellow-600 border-yellow-500/30 bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-400/30 dark:bg-yellow-400/10';

  return (
    <header className='relative flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14'>
      {/* Left side - sidebar trigger */}
      <div className='flex items-center gap-3'>
        <SidebarTrigger className='-ml-1' />
      </div>

      {/* Right side - actions */}
      <div className='flex items-center gap-2'>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${fheClass}`}>
          {fheLabel}
        </span>
        <button
          className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground hover:bg-accent'
          onClick={() => {
            toast.info('Refreshing FHE engine...');
            refresh();
          }}
          title='Refresh FHE'
        >
          <RefreshCw size={16} />
        </button>

        <ThemeModeToggle />
        <UserNav />
      </div>

      {/* Bottom divider line */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />
    </header>
  );
}

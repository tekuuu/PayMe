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
    ? 'text-[var(--status-success)] border-[var(--status-success)]/30 bg-[var(--status-success)]/10'
    : status === 'error'
      ? 'text-[var(--status-error)] border-[var(--status-error)]/30 bg-[var(--status-error)]/10'
      : 'text-[var(--status-warning)] border-[var(--status-warning)]/30 bg-[var(--status-warning)]/10';

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

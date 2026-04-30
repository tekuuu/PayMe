"use client";

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { toast } from 'sonner';

export default function Header() {
  const { status, refresh } = useFhevmContext();

  const fheLabel = status === 'ready'
    ? 'FHE Ready'
    : status === 'error'
      ? 'FHE Error'
      : 'FHE Initializing';

  const fheClass = status === 'ready'
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : status === 'error'
      ? 'text-red-400 border-red-500/30 bg-red-500/10'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  return (
    <header className='flex h-12 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <span className={`hidden md:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${fheClass}`}>
          {fheLabel}
        </span>
        <button
          className='hidden md:inline-flex rounded-md border border-slate-200/10 bg-slate-700/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-slate-600/80'
          onClick={() => {
            toast.info('Refreshing FHE engine...');
            refresh();
          }}
        >
          Refresh FHE
        </button>
        <ThemeModeToggle />
        <UserNav />
      </div>
    </header>
  );
}

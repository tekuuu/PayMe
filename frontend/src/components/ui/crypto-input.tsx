'use client';

import { type ForwardedRef, forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CryptoInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showMaxButton?: boolean;
  onMaxClick?: () => void;
}

const CryptoInput = forwardRef<HTMLInputElement, CryptoInputProps>(
  ({ className, prefix, suffix, showMaxButton, onMaxClick, ...props }, ref) => {
    return (
      <div
        className={cn(
          'group flex items-center rounded-xl bg-muted/40 border border-border/60 px-4 py-3 transition-all duration-200',
          'focus-within:border-primary/50 focus-within:bg-muted/60',
          className
        )}
      >
        {prefix && <div className='mr-3 flex-shrink-0'>{prefix}</div>}
        <input
          ref={ref}
          className='flex-1 bg-transparent text-lg font-semibold tabular-nums outline-none placeholder:text-muted-foreground/40 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          {...props}
        />
        <div className='ml-3 flex items-center gap-2 flex-shrink-0'>
          {showMaxButton && (
            <button
              type='button'
              onClick={onMaxClick}
              className='rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 transition-colors'
            >
              Max
            </button>
          )}
          {suffix}
        </div>
      </div>
    );
  }
);
CryptoInput.displayName = 'CryptoInput';

export { CryptoInput };

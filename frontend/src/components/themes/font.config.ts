import { Inter, Geist, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils/index';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontVariables = cn(
  geist.variable,
  inter.variable,
  jetbrainsMono.variable,
  '[--font-instrument:ui-sans-serif,system-ui]',
  '[--font-noto-mono:ui-monospace,monospace]',
  '[--font-mullish:ui-sans-serif,sans-serif]',
  '[--font-architects-daughter:cursive]',
  '[--font-dm-sans:ui-sans-serif,sans-serif]',
  '[--font-fira-code:ui-monospace,monospace]',
  '[--font-outfit:ui-sans-serif,sans-serif]',
  '[--font-space-mono:ui-monospace,monospace]'
);

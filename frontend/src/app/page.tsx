import Link from 'next/link';
import { IconArrowRight, IconCreditCard, IconBolt } from '@tabler/icons-react';

export default function Page() {
  return (
    <main className='relative min-h-screen overflow-hidden bg-background text-foreground'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl' />
        <div className='absolute -right-20 top-36 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl' />
        <div className='absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl' />
      </div>

      <section className='relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-10 md:px-10 md:pt-16'>
        <div className='mb-10 flex items-center justify-between'>
          <div className='text-lg font-bold tracking-tight text-foreground'>PayMe</div>
          <Link
            href='/dashboard'
            className='inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-transform hover:translate-y-[-1px]'
          >
            Open app
          </Link>
        </div>

        <div className='grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]'>
          <div>
            <h1 className='max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl'>
              Your card.
              <br />
              Your rules.
              <br />
              Private by default.
            </h1>
            <p className='mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg'>
              PayMe lets you fund and spend with a private virtual card built on FHE.
              Amounts stay encrypted while your passkey keeps control in your hands.
            </p>

            <div className='mt-8 flex flex-wrap gap-3'>
              <Link
                href='/dashboard/my-card'
                className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:translate-y-[-1px]'
              >
                Get started
                <IconArrowRight size={16} />
              </Link>
              <Link
                href='/dashboard'
                className='inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent'
              >
                View dashboard
              </Link>
            </div>
          </div>

          <div className='rounded-3xl border border-border/70 bg-card/70 p-6 shadow-xl backdrop-blur'>
            <div className='rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 p-5'>
              <div className='mb-8 flex items-center justify-between'>
                <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  PayMe Private Card
                </span>
                <IconCreditCard size={20} className='text-primary' />
              </div>

              <div className='space-y-3'>
                <div className='text-sm text-muted-foreground'>Encrypted balance</div>
                <div className='text-3xl font-bold tracking-tight'>••••</div>
                <div className='flex items-center gap-2 text-xs text-emerald-500'>
                  <IconBolt size={14} />
                  Passkey-secured smart wallet
                </div>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground'>
              <div className='rounded-xl border border-border bg-background/60 p-3'>Fund</div>
              <div className='rounded-xl border border-border bg-background/60 p-3'>Send</div>
              <div className='rounded-xl border border-border bg-background/60 p-3'>Decrypt</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

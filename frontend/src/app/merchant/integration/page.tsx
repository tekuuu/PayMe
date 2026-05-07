'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Link2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function toAbsoluteAppOrigin() {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return window.location.origin;
}

export default function MerchantIntegrationPage() {
  const { me } = useMe();
  const { state, refresh } = useMerchantControlPlane(me?.account);
  const [periodDays, setPeriodDays] = useState('30');
  const [planName, setPlanName] = useState('Starter');

  const embedUrl = useMemo(() => {
    const merchant = me?.account || '0x0000000000000000000000000000000000000000';
    return `${toAbsoluteAppOrigin()}/embed/checkout?merchant=${merchant}&periodDays=${periodDays}`;
  }, [me?.account, periodDays]);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Integration</h2>
        <p className='text-sm text-muted-foreground'>
          Checkout embed configuration for subscription approval and operational diagnostics.
        </p>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='flex items-center gap-2'>
        <Button variant='outline' className='gap-2' onClick={() => refresh()}>
          <RefreshCw className='h-4 w-4' />
          Refresh
        </Button>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.2fr_1fr]'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 space-y-4'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>Checkout Embed Builder</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                Build an iframe URL for your merchant app to mount for subscription confirmation.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Plan Display Name</label>
                <Input
                  value={planName}
                  onChange={(event) => setPlanName(event.target.value)}
                  className='rounded-xl'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Period Days</label>
                <Input
                  value={periodDays}
                  onChange={(event) => setPeriodDays(event.target.value)}
                  type='number'
                  min='1'
                  className='rounded-xl'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Generated Embed URL</label>
                <div className='flex items-center gap-2'>
                  <Input
                    value={embedUrl}
                    readOnly
                    className='font-mono text-xs rounded-xl'
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => copy(embedUrl, 'Embed URL')}
                    className='flex-shrink-0'
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative p-6 space-y-4'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>Readiness Checks</h3>
              <p className='mt-1 text-xs text-muted-foreground'>Quick preflight checks before going live.</p>
            </div>

            <div className='space-y-3'>
              <div className='flex items-start gap-3 rounded-xl border border-border/40 bg-background/50 p-3'>
                <CheckCircle2 className='h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-xs font-semibold text-foreground'>Merchant Wallet Connected</p>
                  <p className='text-[10px] font-mono text-muted-foreground mt-1 break-all'>{me?.account || 'Not connected'}</p>
                </div>
              </div>
              <div className='flex items-start gap-3 rounded-xl border border-border/40 bg-background/50 p-3'>
                <CheckCircle2 className='h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-xs font-semibold text-foreground'>Control Plane State</p>
                  <p className='text-[10px] text-muted-foreground mt-1'>
                    {state ? `${state.subscriptions.length} subscriptions, ${state.cycles.length} cycles` : 'No state yet'}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3 rounded-xl border border-border/40 bg-background/50 p-3'>
                <Link2 className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-xs font-semibold text-foreground'>Checkout Embed Snippet</p>
                  <code className='mt-2 block rounded-lg bg-muted/50 px-2 py-1.5 text-[10px] font-mono text-muted-foreground break-all'>
                    {`<iframe src="${toAbsoluteAppOrigin()}/embed/checkout?merchant=${me?.account || '0x...'}" />`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='relative p-6 space-y-4'>
          <div>
            <h3 className='text-base font-semibold text-foreground'>Recent Merchant Events</h3>
            <p className='mt-1 text-xs text-muted-foreground'>Useful for debugging integration and billing activity sequencing.</p>
          </div>

          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {(state?.events || []).slice(0, 12).map((event) => (
              <div key={event.id} className='rounded-xl border border-border/40 bg-background/50 px-4 py-3'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-xs font-semibold text-foreground'>{event.type}</p>
                  <p className='text-[10px] text-muted-foreground'>{new Date(event.createdAt).toLocaleString()}</p>
                </div>
                {event.resourceId ? <p className='mt-2 font-mono text-[10px] text-muted-foreground break-all'>{event.resourceId}</p> : null}
              </div>
            ))}
            {(state?.events || []).length === 0 ? (
              <div className='rounded-xl border border-dashed border-border/40 bg-background/30 p-6 text-center text-xs text-muted-foreground'>
                No events yet. Perform a checkout approval or billing action to populate this feed.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

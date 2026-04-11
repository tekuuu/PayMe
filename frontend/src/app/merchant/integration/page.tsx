'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';

function toAbsoluteAppOrigin() {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return window.location.origin;
}

export default function MerchantIntegrationPage() {
  const { me } = useMe();
  const { state } = useMerchantControlPlane(me?.account);
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
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Integration</h2>
        <p className='text-sm text-muted-foreground'>
          Merchant SDK and embed configuration for subscription approval and operational diagnostics.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.2fr_1fr]'>
        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <h3 className='font-semibold'>Checkout Embed Builder</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Build an iframe URL that your merchant app can mount for PayMe passkey subscription confirmation.
          </p>

          <div className='mt-4 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Plan Display Name</label>
              <input
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                className='h-10 w-full rounded-md border bg-background px-3 text-sm'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Period Days</label>
              <input
                value={periodDays}
                onChange={(event) => setPeriodDays(event.target.value)}
                type='number'
                min='1'
                className='h-10 w-full rounded-md border bg-background px-3 text-sm'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Generated Embed URL</label>
              <div className='flex items-center gap-2'>
                <input
                  value={embedUrl}
                  readOnly
                  className='h-10 w-full rounded-md border bg-background px-3 text-xs font-mono'
                />
                <button
                  onClick={() => copy(embedUrl, 'Embed URL')}
                  className='inline-flex h-10 items-center rounded-md border bg-background px-3 text-sm hover:bg-muted'
                >
                  <Copy className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <h3 className='font-semibold'>Readiness Checks</h3>
          <p className='mt-1 text-sm text-muted-foreground'>Quick preflight checks before going live.</p>

          <div className='mt-4 space-y-3 text-sm'>
            <div className='flex items-start gap-3 rounded-md border bg-background p-3'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 text-emerald-600' />
              <div>
                <p className='font-medium'>Merchant Wallet</p>
                <p className='text-xs text-muted-foreground'>{me?.account || 'Not connected'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-md border bg-background p-3'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 text-emerald-600' />
              <div>
                <p className='font-medium'>Control Plane State</p>
                <p className='text-xs text-muted-foreground'>
                  {state ? `${state.subscriptions.length} subscriptions, ${state.cycles.length} cycles` : 'No state yet'}
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-md border bg-background p-3'>
              <Link2 className='mt-0.5 h-4 w-4 text-primary' />
              <div>
                <p className='font-medium'>Recommended Merchant SDK Config</p>
                <code className='mt-1 block rounded bg-muted px-2 py-1 text-[11px]'>
                  {`loadPayMe("${me?.account || '0x...'}", "sepolia", "${toAbsoluteAppOrigin()}")`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <h3 className='font-semibold'>Recent Merchant Events</h3>
        <p className='mt-1 text-sm text-muted-foreground'>Useful for debugging integration and billing activity sequencing.</p>

        <div className='mt-4 space-y-2'>
          {(state?.events || []).slice(0, 12).map((event) => (
            <div key={event.id} className='rounded-md border bg-background px-3 py-2 text-xs'>
              <div className='flex items-center justify-between gap-4'>
                <p className='font-medium'>{event.type}</p>
                <p className='text-muted-foreground'>{new Date(event.createdAt).toLocaleString()}</p>
              </div>
              {event.resourceId ? <p className='mt-1 font-mono text-muted-foreground'>{event.resourceId}</p> : null}
            </div>
          ))}
          {(state?.events || []).length === 0 ? (
            <div className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
              No events yet. Perform a checkout approval or billing action to populate this feed.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

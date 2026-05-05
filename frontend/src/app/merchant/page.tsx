'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Eye, RefreshCw } from 'lucide-react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { formatMicrosToCurrency } from '@/lib/merchant/control-plane-store';
import { useConfidentialTokenBalance } from '@/hooks/use-confidential-token-balance';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { Button } from '@/components/ui/button';
import { SendTokenCard } from '@/components/smart-wallet/send-token-card';
import { ReceiveTokenCard } from '@/components/smart-wallet/receive-token-card';
import { ShieldCard } from '@/components/smart-wallet/shield-card';
import type { Hex } from 'viem';

function metricCard(title: string, value: string, tone?: 'default' | 'danger' | 'warning') {
  const toneClass =
    tone === 'danger'
      ? 'text-rose-500'
      : tone === 'warning'
        ? 'text-amber-500'
        : 'text-foreground';

  return (
    <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5'>
      <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}



export default function MerchantPage() {
  const { me } = useMe();
  const { metrics, recoveryQueue } = useMerchantControlPlane(me?.account);
  const balances = useTokenBalances(me?.account);
  const {
    decryptedValue,
    decryptWithAclSync,
    canDecrypt,
    isDecrypting,
    handleHex,
    refetch: refetchBalance,
    isFetching: isBalanceFetching,
  } = useConfidentialTokenBalance(me?.account as Hex | undefined);

  const [activeAction, setActiveAction] = useState<string | null>(null);

  const mrrText = metrics ? formatMicrosToCurrency(metrics.mrrProxyMicros) : '0';
  const plainUsdcRaw = (balances.usdc.balance as bigint | undefined) ?? 0n;

  return (
    <div className='flex-1 space-y-4 p-6'>
      {/* Header */}
      <div className='space-y-1'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>Merchant Overview</h2>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      {/* Treasury Overview */}
      <div className='max-w-3xl rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
        <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-primary/15 via-transparent to-transparent rounded-l-2xl' />
        <div className='absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent rounded-r-2xl' />
        <div className='relative p-6 min-h-[280px] flex flex-col justify-center'>
          {/* Refresh button */}
          <button
            onClick={async () => {
              await Promise.all([
                refetchBalance?.(),
                balances.refetch?.(),
              ]);
            }}
            disabled={isBalanceFetching}
            className='absolute top-4 right-4 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40 disabled:opacity-40'
            title='Refresh balances'
          >
            <RefreshCw size={16} className={isBalanceFetching ? 'animate-spin' : ''} />
          </button>

          <div className='space-y-6'>
            {/* Plain Assets */}
            <div className='space-y-2'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Plain Assets</p>
              <p className='text-4xl font-bold text-foreground tabular-nums'>${formatMicrosToCurrency(plainUsdcRaw)}</p>
            </div>

            {/* Encrypted Assets */}
            <div className='space-y-2'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Encrypted</p>
              <div className='flex items-center gap-2'>
                <p className='text-4xl font-bold text-blue-500 tabular-nums'>
                  {decryptedValue !== undefined ? `$${formatMicrosToCurrency(decryptedValue)}` : '••••••'}
                </p>
                {decryptedValue === undefined && (
                  <button
                    onClick={() => decryptWithAclSync()}
                    disabled={!canDecrypt || isDecrypting || !handleHex}
                    className='rounded-lg p-2 transition-colors hover:bg-muted/40 disabled:opacity-40'
                  >
                    {isDecrypting ? <Loader2 size={16} className='animate-spin text-muted-foreground' /> : <Eye size={16} className='text-muted-foreground' />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className='max-w-3xl rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden'>
        <div className='px-6 py-4 border-b border-border/40'>
          <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Wallet Actions</p>
        </div>

        {me ? (
          <>
            <div className='flex items-center gap-3 p-6'>
              <Button
                variant='outline'
                className={`flex-1 rounded-full border border-border/60 gap-2 ${activeAction === 'send' ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground' : 'bg-background/50 hover:bg-muted/40'}`}
                onClick={() => setActiveAction(activeAction === 'send' ? null : 'send')}
              >
                Send
              </Button>
              <Button
                variant='outline'
                className={`flex-1 rounded-full border border-border/60 gap-2 ${activeAction === 'receive' ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground' : 'bg-background/50 hover:bg-muted/40'}`}
                onClick={() => setActiveAction(activeAction === 'receive' ? null : 'receive')}
              >
                Receive
              </Button>
              <Button
                variant='outline'
                className={`flex-1 rounded-full border border-border/60 gap-2 ${activeAction === 'shield' ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground' : 'bg-background/50 hover:bg-muted/40'}`}
                onClick={() => setActiveAction(activeAction === 'shield' ? null : 'shield')}
              >
                Shield
              </Button>
            </div>

            {activeAction === 'send' && (
              <div className='border-t border-border/40 bg-background/30 p-6'>
                <SendTokenCard me={me} />
              </div>
            )}

            {activeAction === 'receive' && (
              <div className='border-t border-border/40 bg-background/30 p-6'>
                <ReceiveTokenCard address={me.account as Hex | undefined} />
              </div>
            )}

            {activeAction === 'shield' && (
              <div className='border-t border-border/40 bg-background/30 p-6'>
                <ShieldCard me={me} />
              </div>
            )}
          </>
        ) : (
          <p className='p-6 text-center text-sm text-muted-foreground'>
            Connect your merchant wallet to enable actions.
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className='max-w-3xl grid gap-3 grid-cols-2'>
        {metricCard('Active Subscriptions', String(metrics?.subscriptionsActive || 0))}
        {metricCard(
          'Past Due',
          String(metrics?.subscriptionsPastDue || 0),
          (metrics?.subscriptionsPastDue || 0) > 0 ? 'warning' : 'default'
        )}
        {metricCard(
          'Recovery At Risk',
          String(metrics?.recoveryAtRisk || 0),
          (metrics?.recoveryAtRisk || 0) > 0 ? 'danger' : 'default'
        )}
        {metricCard('MRR Proxy', `${mrrText} cUSDC`)}
      </div>

      {/* Recovery + Quick links */}
      <div className='max-w-3xl space-y-3'>
        <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-foreground'>Needs Attention</h3>
            </div>
            <Link
              href='/merchant/recovery'
              className='inline-flex items-center rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40'
            >
              Open Recovery
              <ArrowRight className='ml-1 h-3.5 w-3.5' />
            </Link>
          </div>

          {recoveryQueue.length === 0 ? (
            <div className='rounded-lg border border-dashed border-border/60 p-10 text-center'>
              <p className='text-sm font-medium text-foreground'>No urgent items</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {recoveryQueue.slice(0, 6).map((item) => (
                <div key={item.cycle.id} className='rounded-lg border border-border/40 bg-background/30 p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-0.5'>
                      <p className='text-sm font-medium text-foreground'>{item.subscription?.customerCardAddress || 'Unknown'}</p>
                      <p className='text-xs text-muted-foreground'>
                        {item.cycle.status.toUpperCase()} · {item.cycle.attemptCount} attempts
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs font-medium text-rose-500'>P{item.priorityScore}</p>
                      <p className='text-[11px] text-muted-foreground'>
                        {item.cycle.nextAttemptAt
                          ? `Retry: ${new Date(item.cycle.nextAttemptAt).toLocaleString()}`
                          : 'No retry scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

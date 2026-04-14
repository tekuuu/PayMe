'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, CreditCard, ShieldCheck, Users, Wallet, Folder, Loader2, Eye } from 'lucide-react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { formatMicrosToCurrency } from '@/lib/merchant/control-plane-store';
import { useConfidentialTokenBalance } from '@/hooks/use-confidential-token-balance';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendTokenCard } from '@/components/smart-wallet/send-token-card';
import { ReceiveTokenCard } from '@/components/smart-wallet/receive-token-card';
import type { Hex } from 'viem';

function metricCard(title: string, value: string, helper: string, tone?: 'default' | 'danger' | 'warning') {
  const toneClass =
    tone === 'danger'
      ? 'text-rose-600'
      : tone === 'warning'
        ? 'text-amber-600'
        : 'text-foreground';

  return (
    <div className='rounded-xl border bg-card p-5 shadow-sm'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className='mt-1 text-xs text-muted-foreground'>{helper}</p>
    </div>
  );
}

function trimAmount(value: string, maxFractionDigits = 4) {
  if (!value) return '0';
  const [whole, fraction = ''] = value.split('.');
  if (!fraction) return whole;
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export default function MerchantPage() {
  const { me } = useMe();
  const { metrics, recoveryQueue, state } = useMerchantControlPlane(me?.account);
  const balances = useTokenBalances(me?.account);
  const {
    decryptedValue,
    decryptWithAclSync,
    canDecrypt,
    isDecrypting,
    handleHex,
    decryptError,
    serverSignerError,
    usingServerSigner,
  } = useConfidentialTokenBalance(me?.account as Hex | undefined);

  const mrrText = metrics ? formatMicrosToCurrency(metrics.mrrProxyMicros) : '0';
  const plainUsdcRaw = (balances.usdc.balance as bigint | undefined) ?? 0n;
  const decryptedCusdcRaw = decryptedValue ?? 0n;
  const stableVisibleRaw = plainUsdcRaw + decryptedCusdcRaw;
  const stableVisibleText = formatMicrosToCurrency(stableVisibleRaw);
  const plainUsdcText = formatMicrosToCurrency(plainUsdcRaw);
  const decryptedText = decryptedValue !== undefined ? formatMicrosToCurrency(decryptedValue) : null;
  const totalBalanceHelper =
    decryptedValue !== undefined
      ? 'Includes plain USDC + decrypted confidential cUSDC.'
      : 'cUSDC is still encrypted. Decrypt to include it in the total.';
  const walletEthText = trimAmount(balances.eth.walletFormatted || '0');
  const depositEthText = trimAmount(balances.eth.depositFormatted || '0');
  const totalEthText = trimAmount(balances.eth.formatted || '0');
  const wethText = trimAmount(balances.weth.formatted || '0');

  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Merchant Overview</h2>
        <p className='text-muted-foreground'>
          Stripe-style operations for subscriptions, billing cycles, recovery, and payouts mapped to PayMe encrypted flows.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Merchant Smart Account</p>
          <p className='mt-2 font-mono text-xs break-all'>{me?.account || 'Not connected'}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Retry Policy</p>
          <p className='mt-2 text-sm'>
            {state
              ? `${state.recoveryPolicy.maxAttempts} attempts over ${state.recoveryPolicy.retryWindowsMinutes.length} windows`
              : 'Not configured'}
          </p>
        </div>
      </div>

      <div className='rounded-2xl border bg-card p-6 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Treasury Snapshot</p>
            <h3 className='mt-1 text-2xl font-semibold tracking-tight'>Total Visible Wallet Balance</h3>
            <p className='mt-3 text-3xl font-bold'>{stableVisibleText} USDC</p>
            <p className='mt-1 text-sm text-muted-foreground'>{totalBalanceHelper}</p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              className='gap-2'
              onClick={() => decryptWithAclSync()}
              disabled={!canDecrypt || isDecrypting || !handleHex}
            >
              {isDecrypting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Eye className='h-4 w-4' />}
              Decrypt cUSDC
            </Button>
          </div>
        </div>

        {usingServerSigner && handleHex ? (
          <div className='mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700'>
            Decrypt performs ACL sync so the relayer signer can read the latest encrypted cUSDC handle.
          </div>
        ) : null}

        <div className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-lg border bg-background p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Plain USDC</p>
            <p className='mt-2 text-2xl font-semibold'>{plainUsdcText} USDC</p>
            <p className='mt-1 text-xs text-muted-foreground'>Public ERC20 balance.</p>
          </div>

          <div className='rounded-lg border bg-background p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Confidential cUSDC</p>
            <p className='mt-2 text-2xl font-semibold'>{decryptedText ? `${decryptedText} cUSDC` : 'Encrypted'}</p>
            <p className='mt-1 text-xs text-muted-foreground'>Decrypt to reveal private balance.</p>
          </div>

          <div className='rounded-lg border bg-background p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Spendable ETH</p>
            <p className='mt-2 text-2xl font-semibold'>{totalEthText} ETH</p>
            <p className='mt-1 text-xs text-muted-foreground'>Wallet ETH + EntryPoint deposit.</p>
          </div>

          <div className='rounded-lg border bg-background p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>WETH</p>
            <p className='mt-2 text-2xl font-semibold'>{wethText} WETH</p>
            <p className='mt-1 text-xs text-muted-foreground'>Wrapped Ether in smart wallet.</p>
          </div>
        </div>

        <div className='mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]'>
          <div className='rounded-lg border bg-background p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>All Wallet Assets</p>
            <div className='mt-3 space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>ETH (wallet)</span>
                <span className='font-medium'>{walletEthText} ETH</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>ETH (EntryPoint deposit)</span>
                <span className='font-medium'>{depositEthText} ETH</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>USDC (plain)</span>
                <span className='font-medium'>{plainUsdcText} USDC</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>WETH</span>
                <span className='font-medium'>{wethText} WETH</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>cUSDC (decrypted)</span>
                <span className='font-medium'>{decryptedText ? `${decryptedText} cUSDC` : 'Encrypted'}</span>
              </div>
            </div>
          </div>

          <div className='rounded-lg border bg-background p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Confidential Handle Status</p>
            <p className='mt-2 font-mono text-xs break-all text-muted-foreground'>{handleHex || 'No encrypted handle yet'}</p>
            {(decryptError || serverSignerError) ? (
              <p className='mt-3 text-xs text-rose-600'>{decryptError || serverSignerError}</p>
            ) : (
              <p className='mt-3 text-xs text-muted-foreground'>
                The encrypted handle updates after confidential balance changes. Decrypt again to refresh visible cUSDC.
              </p>
            )}
          </div>
        </div>

        <div className='mt-6 rounded-xl border bg-background/40 p-4'>
          <div className='mb-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Wallet Actions</p>
            <p className='mt-1 text-sm text-muted-foreground'>Send and receive directly from your merchant wallet on this page.</p>
          </div>

          {me ? (
            <Tabs defaultValue='send' className='space-y-4'>
              <TabsList className='grid h-11 w-full grid-cols-2 rounded-lg bg-muted/50'>
                <TabsTrigger value='send'>Send</TabsTrigger>
                <TabsTrigger value='receive'>Receive</TabsTrigger>
              </TabsList>
              <TabsContent value='send' className='mt-0'>
                <SendTokenCard me={me} />
              </TabsContent>
              <TabsContent value='receive' className='mt-0'>
                <ReceiveTokenCard address={me.account as Hex | undefined} />
              </TabsContent>
            </Tabs>
          ) : (
            <p className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              Connect your merchant wallet to enable send and receive actions.
            </p>
          )}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {metricCard('Active Subscriptions', String(metrics?.subscriptionsActive || 0), 'Current, collecting')}
        {metricCard(
          'Past Due',
          String(metrics?.subscriptionsPastDue || 0),
          'Needs recovery action',
          (metrics?.subscriptionsPastDue || 0) > 0 ? 'warning' : 'default'
        )}
        {metricCard(
          'Recovery At Risk',
          String(metrics?.recoveryAtRisk || 0),
          'Open/uncollectible cycles',
          (metrics?.recoveryAtRisk || 0) > 0 ? 'danger' : 'default'
        )}
        {metricCard('MRR Proxy', `${mrrText} cUSDC`, 'From latest confirmed pulls')}
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.4fr_1fr]'>
        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>Needs Attention</h3>
              <p className='text-sm text-muted-foreground'>Prioritized failed or delayed billing cycles.</p>
            </div>
            <Link
              href='/merchant/recovery'
              className='inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted'
            >
              Open Recovery
              <ArrowRight className='ml-1 h-3.5 w-3.5' />
            </Link>
          </div>

          {recoveryQueue.length === 0 ? (
            <div className='rounded-lg border border-dashed p-10 text-center'>
              <p className='text-sm font-medium'>No urgent recovery items</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Billing failures and retry queues will appear here when collection needs intervention.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {recoveryQueue.slice(0, 6).map((item) => (
                <div key={item.cycle.id} className='rounded-lg border bg-background p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>{item.subscription?.customerCardAddress || 'Unknown card'}</p>
                      <p className='text-xs text-muted-foreground'>
                        {item.cycle.status.toUpperCase()} • Attempts: {item.cycle.attemptCount}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-rose-600'>Priority {item.priorityScore}</p>
                      <p className='text-[11px] text-muted-foreground'>
                        {item.cycle.nextAttemptAt
                          ? `Next: ${new Date(item.cycle.nextAttemptAt).toLocaleString()}`
                          : 'No retry scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <Link href='/merchant/plans' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <Folder className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Plans</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Create monthly/yearly plans and share checkout links.</p>
          </Link>

          <Link href='/merchant/subscriptions' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <Clock3 className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Subscribers</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Agreement ledger, statuses, pause/resume, cancel at period end.</p>
          </Link>

          <Link href='/merchant/billing-cycles' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <CreditCard className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Billing</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Run due charges, inspect attempts, and retry failures.</p>
          </Link>

          <Link href='/merchant/payouts' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <Wallet className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Payouts</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Unwrap cUSDC and keep a settlement ledger.</p>
          </Link>

          <Link href='/merchant/customers' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <Users className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Customers</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Track active cards, risk state, and recent outcomes.</p>
          </Link>

          <Link href='/merchant/contracts' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <ShieldCheck className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Contract Controls</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Low-level chain verification and encrypted handle checks.</p>
          </Link>

          <Link href='/merchant/integration' className='block rounded-xl border bg-card p-5 shadow-sm hover:bg-muted/30'>
            <div className='flex items-center justify-between'>
              <Clock3 className='h-5 w-5 text-primary' />
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
            </div>
            <h3 className='mt-3 font-semibold'>Integration</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Embed URL setup, SDK config, and event diagnostics.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

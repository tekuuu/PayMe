'use client';

import { useState } from 'react';
import { useMe } from '@/providers/auth-provider';
import { PRIVATE_CARD_ABI, PUBLIC_CLIENT } from '@/config/constants';
import { Address, isAddress } from 'viem';
import { toast } from 'sonner';
import { BadgeCheck, ShieldCheck, Search, Clock3, Wallet, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type VerificationResult = {
  cardAddress: Address;
  owner: Address;
  cusdc: Address;
  periodSeconds: bigint;
  lastReset: bigint;
  hasSubscription: boolean;
  encryptedLimitHandle: `0x${string}`;
  encryptedSpentHandle: `0x${string}`;
};

export default function MerchantContractsPage() {
  const { me } = useMe();
  const [customerCard, setCustomerCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const isCardAddressValid = isAddress(customerCard);

  const runVerification = async () => {
    if (!me?.account) {
      toast.error('Please sign in with your merchant wallet first.');
      return;
    }

    if (!isAddress(customerCard)) {
      toast.error('Enter a valid customer card address.');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const cardAddress = customerCard as Address;

      const [owner, cusdc, sub] = await Promise.all([
        PUBLIC_CLIENT.readContract({
          address: cardAddress,
          abi: PRIVATE_CARD_ABI,
          functionName: 'owner'
        }) as Promise<Address>,
        PUBLIC_CLIENT.readContract({
          address: cardAddress,
          abi: PRIVATE_CARD_ABI,
          functionName: 'cUSDC'
        }) as Promise<Address>,
        PUBLIC_CLIENT.readContract({
          address: cardAddress,
          abi: PRIVATE_CARD_ABI,
          functionName: 'subscriptions',
          args: [me.account]
        }) as Promise<readonly [`0x${string}`, `0x${string}`, bigint, bigint]>
      ]);

      const [encryptedLimitHandle, encryptedSpentHandle, periodSeconds, lastReset] = sub;
      const hasSubscription = encryptedLimitHandle !== '0x0000000000000000000000000000000000000000000000000000000000000000';

      setResult({
        cardAddress,
        owner,
        cusdc,
        periodSeconds,
        lastReset,
        hasSubscription,
        encryptedLimitHandle,
        encryptedSpentHandle
      });

      toast.success('Card verified on-chain.');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.shortMessage || error?.message || 'Unable to verify customer card contract.');
    } finally {
      setLoading(false);
    }
  };

  const lastResetText = result
    ? result.lastReset > 0n
      ? new Date(Number(result.lastReset) * 1000).toLocaleString()
      : 'Not initialized'
    : '-';

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>Contract Controls</h2>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='relative p-6'>
          <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Active Merchant Account</p>
          <p className='mt-3 font-mono text-sm break-all text-foreground font-semibold'>{me?.account || 'Not connected'}</p>
        </div>
      </div>

      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='relative p-6 space-y-4'>
          <div>
            <h3 className='text-base font-semibold text-foreground'>Verify Customer Card Subscription</h3>
            <p className='mt-1 text-xs text-muted-foreground'>
              Check whether a customer card has an active subscription allowance for your merchant wallet before running billing.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Customer Private Card Address</label>
              <Input
                value={customerCard}
                onChange={(e) => setCustomerCard(e.target.value.trim())}
                placeholder='0x...'
                autoComplete='off'
                spellCheck={false}
                className='rounded-xl'
              />
              {customerCard && !isCardAddressValid && (
                <p className='text-xs text-amber-600'>Enter a valid EVM address (0x...).</p>
              )}
            </div>

            <Button
              onClick={runVerification}
              disabled={loading || !customerCard || !isCardAddressValid}
              className='w-full gap-2'
            >
              <Search className='h-4 w-4' />
              {loading ? 'Verifying...' : 'Verify On-Chain'}
            </Button>
          </div>
        </div>
      </div>

      {result && (
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
            <div className='relative p-6 space-y-4'>
              <h3 className='text-base font-semibold text-foreground'>Card Metadata</h3>
              <div className='space-y-3 text-sm'>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Card Address</p>
                  <p className='mt-2 font-mono text-xs text-foreground break-all'>{result.cardAddress}</p>
                </div>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Owner Address</p>
                  <p className='mt-2 font-mono text-xs text-foreground break-all'>{result.owner}</p>
                </div>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>cUSDC Token</p>
                  <p className='mt-2 font-mono text-xs text-foreground break-all'>{result.cusdc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur relative overflow-hidden group'>
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
            <div className='relative p-6 space-y-4'>
              <h3 className='text-base font-semibold text-foreground'>Subscription State</h3>

              <div className='rounded-xl border border-border/40 bg-background/50 p-4 flex items-start gap-3'>
                {result.hasSubscription ? (
                  <>
                    <BadgeCheck className='h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-semibold text-emerald-600'>Active allowance found</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>For this merchant</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck className='h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-semibold text-amber-600'>No active allowance</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>For this merchant</p>
                    </div>
                  </>
                )}
              </div>

              <div className='space-y-3 text-sm'>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Period (seconds)</p>
                  <p className='mt-2 font-mono text-xs font-semibold text-foreground tabular-nums'>{result.periodSeconds.toString()}</p>
                </div>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Last Reset</p>
                  <p className='mt-2 text-xs font-semibold text-foreground'>{lastResetText}</p>
                </div>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Encrypted Limit Handle</p>
                  <p className='mt-2 font-mono text-[10px] text-foreground break-all'>{result.encryptedLimitHandle}</p>
                </div>
                <div className='rounded-xl border border-border/40 bg-background/50 p-3'>
                  <p className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground'>Encrypted Spent Handle</p>
                  <p className='mt-2 font-mono text-[10px] text-foreground break-all'>{result.encryptedSpentHandle}</p>
                </div>
              </div>

              <p className='text-xs text-muted-foreground inline-flex items-start gap-2 pt-2'>
                <Wallet className='h-3.5 w-3.5 mt-0.5 flex-shrink-0' />
                Handles are encrypted FHE references; values are intentionally hidden from merchants.
              </p>

              <div className='flex flex-wrap gap-2 pt-4 border-t border-border/40'>
                <Link
                  href='/merchant/customers'
                  className='flex-1 inline-flex items-center justify-center rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/40'
                >
                  View Customers
                </Link>
                <Link
                  href='/merchant/billing-cycles'
                  className='flex-1 inline-flex items-center justify-center rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/40'
                >
                  View Billing
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

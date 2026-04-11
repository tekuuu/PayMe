'use client';

import { useState } from 'react';
import { useMe } from '@/providers/auth-provider';
import { PRIVATE_CARD_ABI, PUBLIC_CLIENT } from '@/config/constants';
import { Address, isAddress } from 'viem';
import { toast } from 'sonner';
import { BadgeCheck, ShieldCheck, Search, Clock3, Wallet } from 'lucide-react';
import Link from 'next/link';

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
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Contract Controls</h2>
        <p className='text-sm text-muted-foreground'>
          Verify card ownership and subscription permission state before triggering billing operations.
        </p>
      </div>

      <div className='rounded-xl border bg-card p-4'>
        <p className='text-xs uppercase tracking-wide text-muted-foreground'>Active Merchant Account</p>
        <p className='mt-2 font-mono text-xs break-all'>{me?.account || 'Not connected'}</p>
      </div>

      <div className='rounded-xl border bg-card text-card-foreground shadow'>
        <div className='p-6 pb-2'>
          <h3 className='font-semibold leading-none tracking-tight'>Verify Customer Card Subscription</h3>
          <p className='mt-2 text-sm text-muted-foreground'>
            Check whether a customer card has an active subscription allowance for your merchant wallet before running billing.
          </p>
        </div>

        <div className='p-6 pt-4 space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Customer Private Card Address</label>
            <input
              value={customerCard}
              onChange={(e) => setCustomerCard(e.target.value.trim())}
              className='w-full rounded-md border bg-transparent px-3 py-2 text-sm'
              placeholder='0x...'
              autoComplete='off'
              spellCheck={false}
            />
            {customerCard && !isCardAddressValid && (
              <p className='text-xs text-amber-600'>Enter a valid EVM address (0x...).</p>
            )}
          </div>

          <button
            onClick={runVerification}
            disabled={loading || !customerCard || !isCardAddressValid}
            className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            <Search className='mr-2 h-4 w-4' />
            {loading ? 'Verifying...' : 'Verify On-Chain'}
          </button>
        </div>
      </div>

      {result && (
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-xl border bg-card text-card-foreground shadow'>
            <div className='p-6 space-y-4'>
              <h3 className='font-semibold leading-none tracking-tight'>Card Metadata</h3>
              <div className='space-y-3 text-sm'>
                <div className='flex items-start justify-between gap-4'>
                  <span className='text-muted-foreground'>Card</span>
                  <span className='font-mono text-right'>{result.cardAddress}</span>
                </div>
                <div className='flex items-start justify-between gap-4'>
                  <span className='text-muted-foreground'>Owner</span>
                  <span className='font-mono text-right'>{result.owner}</span>
                </div>
                <div className='flex items-start justify-between gap-4'>
                  <span className='text-muted-foreground'>cUSDC Token</span>
                  <span className='font-mono text-right'>{result.cusdc}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-xl border bg-card text-card-foreground shadow'>
            <div className='p-6 space-y-4'>
              <h3 className='font-semibold leading-none tracking-tight'>Subscription State</h3>

              <div className='flex items-center gap-2'>
                {result.hasSubscription ? (
                  <>
                    <BadgeCheck className='h-5 w-5 text-emerald-500' />
                    <span className='text-sm font-medium text-emerald-600'>Active allowance found for this merchant</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className='h-5 w-5 text-amber-500' />
                    <span className='text-sm font-medium text-amber-600'>No active allowance for this merchant</span>
                  </>
                )}
              </div>

              <div className='space-y-3 text-sm'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-muted-foreground inline-flex items-center gap-1'>
                    <Clock3 className='h-4 w-4' /> Period (seconds)
                  </span>
                  <span className='font-mono'>{result.periodSeconds.toString()}</span>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-muted-foreground'>Last Reset</span>
                  <span className='text-right'>{lastResetText}</span>
                </div>
                <div className='flex items-start justify-between gap-4'>
                  <span className='text-muted-foreground'>Encrypted Limit Handle</span>
                  <span className='font-mono text-right break-all max-w-[70%]'>{result.encryptedLimitHandle}</span>
                </div>
                <div className='flex items-start justify-between gap-4'>
                  <span className='text-muted-foreground'>Encrypted Spent Handle</span>
                  <span className='font-mono text-right break-all max-w-[70%]'>{result.encryptedSpentHandle}</span>
                </div>
              </div>

              <p className='text-xs text-muted-foreground inline-flex items-start gap-2'>
                <Wallet className='h-3.5 w-3.5 mt-0.5' />
                Handles are encrypted FHE references; values are intentionally not visible to the merchant.
              </p>

              <div className='flex flex-wrap gap-2 pt-2'>
                <Link
                  href='/merchant/customers'
                  className='inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted'
                >
                  Open Customers
                </Link>
                <Link
                  href='/merchant/billing-cycles'
                  className='inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted'
                >
                  Open Billing Cycles
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

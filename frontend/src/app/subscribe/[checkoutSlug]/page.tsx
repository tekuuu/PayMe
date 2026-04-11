'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { encodeFunctionData, Hex, keccak256, parseUnits, stringToHex, toHex } from 'viem';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { usePrivateCard } from '@/hooks/use-private-card';
import { CHAIN, PRIVATE_CARD_ABI } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { decodeCheckoutSlug } from '@/lib/merchant/checkout-slug';
import { registerSubscriptionApproval, formatMicrosToCurrency } from '@/lib/merchant/control-plane-store';
import { Button } from '@/components/ui/button';

function generateSubscriptionRef(merchantAddress: string, cardAddress: string, planRef: string) {
  try {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      return `0x${Array.from(bytes).map((entry) => entry.toString(16).padStart(2, '0')).join('')}` as Hex;
    }
  } catch {
    // fallback below
  }

  return keccak256(
    stringToHex(`${merchantAddress}|${cardAddress}|${planRef}|${Date.now()}|${Math.random()}`)
  ) as Hex;
}

export default function SubscribeCheckoutPage() {
  const router = useRouter();
  const params = useParams<{ checkoutSlug: string }>();
  const slug = params?.checkoutSlug;

  const payload = useMemo(() => (typeof slug === 'string' ? decodeCheckoutSlug(slug) : null), [slug]);

  const { me } = useMe();
  const { instance, status: fheStatus } = useFhevmContext();
  const { selectedCardAddress: cardAddress, hasCard, isCreating, createCard } = usePrivateCard(me || null);
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

  const [maxAllowance, setMaxAllowance] = useState(() => {
    if (!payload) return '';
    try {
      return formatMicrosToCurrency(payload.amountRefMicros);
    } catch {
      return '';
    }
  });
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!payload) {
      toast.error('Invalid checkout link');
      return;
    }
    if (!me) {
      toast.error('Please login first');
      return;
    }
    if (!cardAddress) {
      toast.error('Create or select a private card first');
      return;
    }
    if (!instance) {
      toast.error(fheStatus === 'loading' ? 'Crypto engine is still booting up' : 'Crypto engine not ready');
      return;
    }
    if (!maxAllowance || Number(maxAllowance) <= 0) {
      toast.error('Max allowance must be greater than zero');
      return;
    }

    let userOpHash: string | undefined;
    try {
      setIsApproving(true);

      const amountRaw = parseUnits(String(maxAllowance), 6);
      const periodSeconds = BigInt(Math.max(60, Math.floor(payload.billingIntervalSeconds)));
      const subscriptionRef = generateSubscriptionRef(payload.merchantAddress, cardAddress, payload.planRef);

      const encryptedInput = instance.createEncryptedInput(cardAddress, me.account as Hex);
      encryptedInput.add64(amountRaw);
      const { handles } = await encryptedInput.encrypt();

      smartWallet.init();
      const call = {
        dest: cardAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: PRIVATE_CARD_ABI,
          functionName: 'approveSubscriptionRef',
          args: [
            payload.merchantAddress as Hex,
            payload.planRef as Hex,
            subscriptionRef,
            BigInt(toHex(handles[0])),
            periodSeconds,
          ],
        }),
      };

      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: me.keyId,
      });

      userOpHash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash: userOpHash });

      if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
        throw new Error('Subscription approval reverted during execution.');
      }

      const amountHandle = toHex(handles[0], { size: 32 });
      registerSubscriptionApproval({
        merchantAddress: payload.merchantAddress as Hex,
        customerCardAddress: cardAddress,
        customerSmartWallet: me.account,
        planId: payload.planId,
        planRef: payload.planRef,
        subscriptionRef,
        planName: payload.name,
        amountRef: amountRaw.toString(),
        amountHandle,
        periodSeconds: Number(periodSeconds),
      });

      toast.success('Subscription approved');
      router.push('/dashboard/subscriptions');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve subscription');
    } finally {
      setIsApproving(false);
    }
  };

  if (!payload) {
    return (
      <div className='mx-auto max-w-2xl space-y-6 p-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Checkout link not recognized</h1>
        <p className='text-sm text-muted-foreground'>
          This link is malformed or expired. Ask the merchant for a fresh checkout link.
        </p>
        <Link href='/' className='text-sm underline'>
          Return home
        </Link>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl space-y-6 p-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Subscribe</h1>
        <p className='text-sm text-muted-foreground'>
          You will approve an encrypted cUSDC allowance on your Private Card. Timing guards are UI-first for now.
        </p>
      </div>

      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Plan</p>
            <p className='text-lg font-semibold'>{payload.name}</p>
            {payload.description ? <p className='text-sm text-muted-foreground'>{payload.description}</p> : null}
          </div>
          <div className='text-right'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Price</p>
            <p className='text-lg font-semibold'>{formatMicrosToCurrency(payload.amountRefMicros)} cUSDC</p>
            <p className='text-xs text-muted-foreground capitalize'>{payload.interval}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          <div className='rounded-lg border bg-background p-4'>
            <p className='text-sm font-medium'>Merchant</p>
            <p className='mt-1 break-all font-mono text-xs text-muted-foreground'>{payload.merchantAddress}</p>
          </div>
          <div className='rounded-lg border bg-background p-4'>
            <p className='text-sm font-medium'>Your Card</p>
            <p className='mt-1 break-all font-mono text-xs text-muted-foreground'>{cardAddress || 'Not selected'}</p>
          </div>
        </div>

        <div className='mt-6 space-y-2'>
          <label className='text-sm font-medium'>Max Allowance Per Period (cUSDC)</label>
          <input
            value={maxAllowance}
            onChange={(e) => setMaxAllowance(e.target.value)}
            type='number'
            min='0'
            step='0.000001'
            className='h-10 w-full rounded-md border bg-background px-3 text-sm'
          />
          <p className='text-xs text-muted-foreground'>
            Default equals the plan price. You can raise this limit (still encrypted) to allow upgrades or usage-based extras later.
          </p>
        </div>

        {!hasCard ? (
          <div className='mt-6 rounded-lg border border-dashed p-4'>
            <p className='text-sm font-medium'>No Private Card yet</p>
            <p className='mt-1 text-xs text-muted-foreground'>Create a card before approving this subscription.</p>
            <div className='mt-3'>
              <Button onClick={() => createCard()} disabled={isCreating} className='gap-2'>
                {isCreating ? <Loader2 className='h-4 w-4 animate-spin' /> : <ShieldCheck className='h-4 w-4' />}
                Create Private Card
              </Button>
            </div>
          </div>
        ) : (
          <div className='mt-6 flex flex-wrap items-center gap-3'>
            <Button onClick={handleApprove} disabled={isApproving || !me || !instance || !cardAddress} className='gap-2'>
              {isApproving ? <Loader2 className='h-4 w-4 animate-spin' /> : <ShieldCheck className='h-4 w-4' />}
              Approve Subscription
            </Button>
            <Link href='/dashboard/subscriptions' className='text-sm underline text-muted-foreground'>
              View my subscriptions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

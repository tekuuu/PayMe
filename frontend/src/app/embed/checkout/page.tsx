'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CHAIN, PRIVATE_CARD_ABI } from '@/config/constants';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { useMe } from '@/providers/auth-provider';
import { usePrivateCard } from '@/hooks/use-private-card';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { registerSubscriptionApproval } from '@/lib/merchant/control-plane-store';
import { encodeFunctionData, Hex, isAddress, keccak256, parseUnits, stringToHex, toHex } from 'viem';

type SubscriptionPayload = {
  merchantAddress?: string;
  amount?: string | number;
  periodDays?: string | number;
};

type ParentMessage = {
  type?: string;
  payload?: SubscriptionPayload;
};

function safeOriginFromReferrer(referrer: string): string {
  try {
    return new URL(referrer).origin;
  } catch {
    return '*';
  }
}

function randomRef(seed: string) {
  try {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      return `0x${Array.from(bytes).map((entry) => entry.toString(16).padStart(2, '0')).join('')}` as Hex;
    }
  } catch {
    // fallback below
  }
  return keccak256(stringToHex(`${seed}|${Date.now()}|${Math.random()}`)) as Hex;
}

export default function EmbedCheckoutPage() {
  const searchParams = useSearchParams();
  const merchant = searchParams.get('merchant');
  const periodDaysFromUrl = searchParams.get('periodDays');
  const { me } = useMe();
  const { instance, status: fheStatus, error: fheError } = useFhevmContext();
  const { selectedCardAddress: cardAddress } = usePrivateCard(me || null);
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);
  const targetOrigin = useMemo(
    () => (typeof document === 'undefined' ? '*' : safeOriginFromReferrer(document.referrer)),
    []
  );

  const [status, setStatus] = useState('Waiting for merchant request...');

  useEffect(() => {
    const postToParent = (message: Record<string, unknown>) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, targetOrigin);
      }
    };

    // Tell the merchant app that iframe is alive and ready to receive requests, but ONLY when FHE is fully ready!
    if (fheStatus === 'ready' && instance) {
      postToParent({ type: 'PAYME_IFRAME_READY' });
    }

    const onMessage = async (event: MessageEvent<ParentMessage>) => {
      if (targetOrigin !== '*' && event.origin !== targetOrigin) return;

      if (event.data?.type !== 'INITIATE_SUBSCRIPTION') return;

      const payload = event.data.payload ?? {};
      const requestedMerchant = payload.merchantAddress;

      if (!merchant) {
        setStatus('Failed: missing merchant in iframe URL');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Missing merchant query param in embed URL.'
        });
        return;
      }

      if (!isAddress(merchant)) {
        setStatus('Failed: invalid merchant in iframe URL');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Merchant query parameter is not a valid address.'
        });
        return;
      }

      if (!requestedMerchant || requestedMerchant.toLowerCase() !== merchant.toLowerCase()) {
        setStatus('Failed: merchant mismatch');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Merchant address mismatch between parent request and embed URL.'
        });
        return;
      }

      if (!me) {
        setStatus('Failed: passkey wallet not connected');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Passkey wallet is not connected in PayMe frontend. Please login first.'
        });
        return;
      }

      if (!cardAddress) {
        setStatus('Failed: no private card selected');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'No private card found. Create/select a private card before checkout.'
        });
        return;
      }

      if (!instance) {
        if (fheStatus === 'loading') {
          setStatus('App received your request. Booting up crypto engine... Please wait 5 seconds and click Confirm again.');
          postToParent({
            type: 'SUBSCRIPTION_ERROR',
            error: 'Crypto engine is still booting up. Please try clicking Confirm again in a few seconds.'
          });
          return;
        }

        setStatus(`Failed: FHE engine not ready (Status: ${fheStatus}, Error: ${fheError?.message || 'none'})`);
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: `Crypto engine is failed to initialize (Status: ${fheStatus}). Please check your connection or reload.`
        });
        return;
      }

      const amountInput = payload.amount;
      if (amountInput === undefined || amountInput === null || Number(amountInput) <= 0) {
        setStatus('Failed: invalid amount');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Invalid amount. Amount must be greater than zero.'
        });
        return;
      }

      let amountRaw: bigint;
      let periodSeconds: bigint;
      try {
        amountRaw = parseUnits(String(amountInput), 6);
        const periodDaysInput =
          payload.periodDays !== undefined
            ? Number(payload.periodDays)
            : periodDaysFromUrl
              ? Number(periodDaysFromUrl)
              : 30;
        periodSeconds = BigInt(Math.floor(periodDaysInput * 86400));
      } catch {
        setStatus('Failed: amount parsing error');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Invalid amount or billing period format.'
        });
        return;
      }

      if (amountRaw <= 0n || periodSeconds <= 0n) {
        setStatus('Failed: invalid values');
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: 'Amount and billing period must be greater than zero.'
        });
        return;
      }

      try {
        setStatus('Preparing encrypted approval...');

        const encryptedInput = instance.createEncryptedInput(cardAddress, me.account as Hex);
        encryptedInput.add64(amountRaw);
        const { handles } = await encryptedInput.encrypt();
        const planRef = randomRef(`plan:${merchant}:${amountRaw.toString()}:${periodSeconds.toString()}`);
        const subscriptionRef = randomRef(`sub:${merchant}:${cardAddress}:${planRef}`);

        setStatus('Building user operation...');
        smartWallet.init();

        const call = {
          dest: cardAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: PRIVATE_CARD_ABI,
            functionName: 'approveSubscriptionRef',
            args: [merchant as Hex, planRef, subscriptionRef, BigInt(toHex(handles[0])), periodSeconds],
          }),
        };

        const userOp = await builder.buildUserOp({
          calls: [call],
          keyId: me.keyId,
        });

        setStatus('Awaiting passkey signature...');
        const hash = await smartWallet.sendUserOperation({ userOp });

        postToParent({
          type: 'SUBSCRIPTION_PENDING',
          txHash: hash,
        });

        setStatus('Waiting for on-chain confirmation...');
        const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

        if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
          throw new Error('Subscription approval reverted during execution.');
        }

        const txHash = (receipt.receipt?.transactionHash as string | undefined) ?? hash;
        registerSubscriptionApproval({
          merchantAddress: merchant as Hex,
          customerCardAddress: cardAddress,
          customerSmartWallet: me.account,
          planRef,
          subscriptionRef,
          amountRef: amountRaw.toString(),
          periodSeconds: Number(periodSeconds),
        });

        setStatus('Success: subscription approved');
        postToParent({
          type: 'SUBSCRIPTION_SUCCESS',
          receipt: {
            transactionHash: txHash,
            userOpHash: hash,
            cardAddress,
            merchant,
            amount: amountRaw.toString(),
            periodSeconds: periodSeconds.toString(),
          },
        });
      } catch (error: any) {
        const message = error?.message || 'Subscription approval failed.';
        setStatus(`Failed: ${message}`);
        postToParent({
          type: 'SUBSCRIPTION_ERROR',
          error: message,
        });
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [builder, cardAddress, instance, me, merchant, periodDaysFromUrl, targetOrigin, fheStatus, fheError]);

  return (
    <main className='flex min-h-screen items-center justify-center bg-transparent p-4 text-foreground'>
      <div className='w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='mb-6 text-center'>
          <h1 className='text-lg font-bold'>PayMe Secure Checkout</h1>
          <p className='text-sm text-muted-foreground'>Review your subscription details</p>
        </div>

        <div className='space-y-4'>
          {/* Subscription Info */}
          <div className='rounded-lg bg-muted p-4 text-sm'>
            <div className='flex justify-between border-b border-border pb-2'>
              <span className='font-medium text-muted-foreground'>Merchant</span>
              <span className='truncate pl-4 font-mono'>{merchant ? `${merchant.slice(0, 8)}...${merchant.slice(-6)}` : 'missing'}</span>
            </div>
          </div>

          {/* Card Info */}
          <div>
            <h3 className='mb-2 text-sm font-medium'>Payment Method</h3>
            {!me ? (
              <div className='rounded-lg border border-dashed border-border p-4 text-center'>
                <p className='text-sm text-muted-foreground'>You are not logged in.</p>
                <a
                  href='/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-2 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                >
                  Log in to PayMe
                </a>
              </div>
            ) : !cardAddress ? (
              <div className='rounded-lg border border-dashed border-destructive p-4 text-center text-destructive'>
                <p className='text-sm'>No Private Card found.</p>
                <a
                  href='/dashboard/my-card'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-2 inline-block rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground'
                >
                  Create a Card
                </a>
              </div>
            ) : (
              <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-black p-5 text-white shadow-md'>
                <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl'></div>
                <div className='relative z-10 flex flex-col justify-between h-full space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-medium uppercase tracking-wider text-slate-400'>Private Card</span>
                    <svg className='h-6 w-6 opacity-80' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' />
                    </svg>
                  </div>
                  <div>
                    <div className='font-mono text-lg tracking-widest text-slate-200'>
                      •••• •••• •••• {cardAddress.slice(-4).toUpperCase()}
                    </div>
                    <div className='mt-1 text-xs text-slate-500 font-mono'>
                      {cardAddress.slice(0, 10)}...{cardAddress.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Tracker */}
          {status !== 'Waiting for merchant request...' && (
            <div className='mt-6 rounded-lg border border-border bg-slate-50/50 p-3 text-center dark:bg-slate-900/50'>
              <p className='text-sm font-medium text-primary'>{status}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

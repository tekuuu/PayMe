'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { encodeFunctionData, getAddress, Hex, isAddress, keccak256, parseUnits, stringToHex, toHex, zeroAddress } from 'viem';
import { Loader2, ShieldCheck, CreditCard, Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { usePrivateCard } from '@/hooks/use-private-card';
import {
  CHAIN,
  PRIVATE_CARD_ABI,
  PUBLIC_CLIENT,
  SUBSCRIPTION_PLAN_REGISTRY_ABI,
  SUBSCRIPTION_PLAN_REGISTRY_ADDRESS,
} from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
import { describeExecutionRevertReason } from '@/lib/smart-wallet/revert-decode';
import { decodeCheckoutSlug } from '@/lib/merchant/checkout-slug';
import { registerSubscriptionApproval, formatMicrosToCurrency, recordCustomerActivity, confirmCustomerActivity, addConfirmedActivity } from '@/lib/merchant/control-plane-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function generateSubscriptionRef(merchantAddress: string, cardAddress: string) {
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
    stringToHex(`${merchantAddress}|${cardAddress}|${Date.now()}|${Math.random()}`)
  ) as Hex;
}

function generateOpaqueApprovalPlanRef(merchantAddress: string, cardAddress: string, subscriptionRef: string) {
  return keccak256(stringToHex(`approval|${merchantAddress}|${cardAddress}|${subscriptionRef}|${Date.now()}|${Math.random()}`)) as Hex;
}

function formatUserOpExecutionError(receipt: any, fallback: string) {
  const rawReason =
    receipt?.receipt?.revertReason ||
    receipt?.reason ||
    receipt?.error ||
    receipt?.message;
  const reason = describeExecutionRevertReason(rawReason);

  if (reason && String(reason).trim().length > 0) {
    return `${fallback} Reason: ${String(reason)}`;
  }

  return fallback;
}

export default function SubscribeCheckoutPage() {
  const router = useRouter();
  const params = useParams<{ checkoutSlug: string }>();
  const slug = params?.checkoutSlug;

  const payload = useMemo(() => (typeof slug === 'string' ? decodeCheckoutSlug(slug) : null), [slug]);

  const { me } = useMe();
  const { instance, status: fheStatus, refresh: refreshFhe, error: fheError } = useFhevmContext();
  const { hasCard, isCreating, createCard, attachCardByAddress, resolveCard } = usePrivateCard(me || null);
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

  const [inputCardAddress, setInputCardAddress] = useState('');
  const [isResolvingCard, setIsResolvingCard] = useState(false);
  const [manualCardAddress, setManualCardAddress] = useState<Hex | null>(null);

  const cardAddress = manualCardAddress;

  const [maxAllowance, setMaxAllowance] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [chainPlan, setChainPlan] = useState<{
    merchant: Hex;
    periodSeconds: number;
    priceMicros: string;
    active: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!payload) {
        setPlanError('Invalid checkout link');
        setChainPlan(null);
        return;
      }

      if (!/^0x[0-9a-fA-F]{40}$/.test(SUBSCRIPTION_PLAN_REGISTRY_ADDRESS) || SUBSCRIPTION_PLAN_REGISTRY_ADDRESS === zeroAddress) {
        setPlanError('Subscription registry is not configured.');
        setChainPlan(null);
        return;
      }

      setIsPlanLoading(true);
      setPlanError(null);
      try {
        const record = (await PUBLIC_CLIENT.readContract({
          address: SUBSCRIPTION_PLAN_REGISTRY_ADDRESS as Hex,
          abi: SUBSCRIPTION_PLAN_REGISTRY_ABI,
          functionName: 'getPlan',
          args: [payload.planRef as Hex],
        })) as {
          merchant: Hex;
          periodSeconds: bigint;
          priceMicros: bigint;
          termsHash: Hex;
          active: boolean;
          createdAt: bigint;
          updatedAt: bigint;
        };

        if (!record.merchant || record.merchant === zeroAddress) {
          throw new Error('Plan not found on-chain.');
        }

        const expectedMerchant = getAddress(payload.merchantAddress as Hex);
        const chainMerchant = getAddress(record.merchant as Hex);
        if (expectedMerchant !== chainMerchant) {
          throw new Error('Checkout link merchant does not match on-chain plan owner.');
        }

        if (!record.active) {
          throw new Error('This plan is archived on-chain.');
        }

        if (!cancelled) {
          setChainPlan({
            merchant: chainMerchant as Hex,
            periodSeconds: Number(record.periodSeconds),
            priceMicros: record.priceMicros.toString(),
            active: !!record.active,
          });
          setMaxAllowance(formatMicrosToCurrency(record.priceMicros.toString()));
        }
      } catch (e: any) {
        if (!cancelled) {
          setChainPlan(null);
          setPlanError(e?.message || 'Failed to load plan from blockchain.');
        }
      } finally {
        if (!cancelled) {
          setIsPlanLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const handleManualCardAttach = async () => {
    if (!inputCardAddress || !isAddress(inputCardAddress)) {
      toast.error('Please enter a valid card address');
      return;
    }

    setIsResolvingCard(true);
    try {
      const resolved = await resolveCard(inputCardAddress);
      if (resolved) {
        setManualCardAddress(resolved.address);
        toast.success(`Card ${resolved.address.slice(0, 6)}... linked`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Could not verify card address');
    } finally {
      setIsResolvingCard(false);
    }
  };

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
    if (!chainPlan) {
      toast.error(planError || 'Plan data is not loaded from blockchain');
      return;
    }
    if (!chainPlan.active) {
      toast.error('This plan is not active on-chain');
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

      const cardOwner = (await PUBLIC_CLIENT.readContract({
        address: cardAddress as Hex,
        abi: PRIVATE_CARD_ABI,
        functionName: 'owner',
      })) as Hex;

      const signingAccount = getAddress(cardOwner) as Hex;

      const amountRaw = parseUnits(String(maxAllowance), 6);
      const periodSeconds = BigInt(Math.max(60, Math.floor(chainPlan.periodSeconds)));
      const subscriptionRef = generateSubscriptionRef(chainPlan.merchant, cardAddress);
      // Privacy hardening: do not put canonical registry planRef into card subscription approvals.
      const approvalPlanRef = generateOpaqueApprovalPlanRef(chainPlan.merchant, cardAddress, subscriptionRef);

      const encryptedInput = instance.createEncryptedInput(cardAddress, signingAccount);
      encryptedInput.add64(amountRaw);
      const { handles, inputProof } = await encryptedInput.encrypt();
      const inputProofHex = `0x${Array.from(inputProof).map((byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex;

      smartWallet.init();
      const call = {
        dest: cardAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: PRIVATE_CARD_ABI,
          functionName: 'subscribeAndChargeRefWithProof',
          args: [
            chainPlan.merchant as Hex,
            approvalPlanRef,
            subscriptionRef,
            toHex(handles[0], { size: 32 }),
            inputProofHex,
            periodSeconds,
          ],
        }),
      };

      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: me.keyId,
        sender: signingAccount,
        publicKey: [BigInt(me.pubKey.x), BigInt(me.pubKey.y)],
      });

      // Ensure the smart wallet has enough gas for the prefund (AA21 Fix)
      await ensureUserOpPrefund({
        account: signingAccount,
        userOp,
      });

      userOpHash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash: userOpHash });

      if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
        throw new Error(formatUserOpExecutionError(receipt, 'Subscription approval reverted during execution.'));
      }

      const amountHandle = toHex(handles[0], { size: 32 });
      addConfirmedActivity(cardAddress, {
        type: 'subscribe',
        amount: maxAllowance,
        token: 'cUSDC',
        merchantAddress: chainPlan.merchant as string,
        planName: payload.name || 'Plan',
        txHash: receipt.receipt?.transactionHash as string | undefined,
        userOpHash,
      });
      registerSubscriptionApproval({
        merchantAddress: chainPlan.merchant as Hex,
        customerCardAddress: cardAddress,
        customerSmartWallet: signingAccount,
        planId: payload.planId,
        planRef: approvalPlanRef,
        subscriptionRef,
        planName: payload.name || 'Plan',
        amountRef: amountRaw.toString(),
        amountHandle,
        periodSeconds: Number(periodSeconds),
        activateImmediately: true,
      });

      toast.success('Subscription activated');
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

  if (planError) {
    return (
      <div className='mx-auto max-w-2xl space-y-6 p-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Unable to subscribe</h1>
        <p className='text-sm text-muted-foreground'>{planError}</p>
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
            <p className='text-lg font-semibold'>{payload.name || 'Merchant Plan'}</p>
            <p className='text-sm text-muted-foreground'>Details are intentionally minimized for privacy.</p>
          </div>
          <div className='text-right'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>Price</p>
            <p className='text-lg font-semibold'>
              {chainPlan ? formatMicrosToCurrency(chainPlan.priceMicros) : formatMicrosToCurrency(payload.amountRefMicros || '0')} cUSDC
            </p>
            <p className='text-xs text-muted-foreground capitalize'>
              {chainPlan
                ? `${Math.round(chainPlan.periodSeconds / 86400)} day cycle`
                : payload.interval}
            </p>
          </div>
        </div>

        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          <div className='rounded-lg border bg-background p-4'>
            <p className='text-sm font-medium'>Merchant</p>
            <p className='mt-1 break-all font-mono text-xs text-muted-foreground'>{payload.merchantAddress}</p>
          </div>
          <div className='rounded-lg border bg-background p-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium'>Your Card</p>
              {cardAddress && (
                <button
                  onClick={() => {
                    setManualCardAddress(null);
                    setInputCardAddress('');
                  }}
                  className='text-[10px] text-muted-foreground underline'
                >
                  Change
                </button>
              )}
            </div>
            {cardAddress ? (
              <p className='mt-1 break-all font-mono text-xs text-muted-foreground'>{cardAddress}</p>
            ) : (
              <p className='mt-1 text-xs text-destructive italic'>No card linked yet</p>
            )}
          </div>
        </div>

        <div className='mt-6 space-y-4'>
          {!cardAddress && (
            <div className='space-y-2 rounded-lg border bg-muted/30 p-4'>
              <p className='text-sm font-medium'>Link your PayMe Private Card</p>
              <p className='text-xs text-muted-foreground'>
                Enter your card address. This acts like your card number for the confidential network.
              </p>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <CreditCard className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='0x...'
                    className='pl-9'
                    value={inputCardAddress}
                    onChange={(e) => setInputCardAddress(e.target.value)}
                  />
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleManualCardAttach}
                  disabled={isResolvingCard || !isAddress(inputCardAddress)}
                >
                  {isResolvingCard ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
                </Button>
              </div>
            </div>
          )}

          {/* Hidden "Max Allowance" to simplify user experience, defaulting to the plan price */}
          <div className='hidden'>
            <Input
              value={maxAllowance}
              onChange={(e) => setMaxAllowance(e.target.value)}
              type='number'
            />
          </div>
        </div>

        {!cardAddress && !hasCard && (
          <div className='mt-6 rounded-lg border border-dashed p-4 bg-muted/20'>
            <p className='text-sm font-medium'>No Private Card detected</p>
            <p className='mt-1 text-xs text-muted-foreground'>Create a card to start subscribing to private services.</p>
            <div className='mt-3'>
              <Button onClick={() => createCard()} disabled={isCreating || isPlanLoading} className='gap-2'>
                {isCreating ? <Loader2 className='h-4 w-4 animate-spin' /> : <ShieldCheck className='h-4 w-4' />}
                Create Private Card
              </Button>
            </div>
          </div>
        )}

        {(cardAddress || hasCard) && (
          <div className='mt-6 flex flex-col gap-3'>
            <Button
              onClick={handleApprove}
              disabled={isApproving || isPlanLoading || !chainPlan || !me || !instance || !cardAddress}
              className='gap-2 w-full md:w-auto'
            >
              {isApproving ? <Loader2 className='h-4 w-4 animate-spin' /> : <ShieldCheck className='h-4 w-4' />}
              Approve Subscription
            </Button>
            
            <div className='flex flex-col gap-2'>
              {!me && (
                <p className='text-xs text-destructive flex items-center gap-1.5'>
                  <span className='h-1 w-1 rounded-full bg-destructive' />
                  Please sign in to your smart wallet first
                </p>
              )}

              {me && (
                <div className='flex items-center gap-2'>
                  {fheStatus === 'loading' || fheStatus === 'initializing' ? (
                    <p className='text-xs text-amber-600 flex items-center gap-1.5'>
                      <RefreshCw className='h-3 w-3 animate-spin' />
                      Encryption engine is starting up...
                    </p>
                  ) : fheStatus === 'ready' ? (
                    <p className='text-xs text-emerald-600 flex items-center gap-1.5'>
                      <CheckCircle2 className='h-3 w-3' />
                      Encryption engine ready
                    </p>
                  ) : (
                    <div className='flex flex-col gap-1'>
                      <p className='text-xs text-destructive flex items-center gap-1.5'>
                        <AlertCircle className='h-3 w-3' />
                        Encryption engine failed to start
                      </p>
                      {fheError && <p className='text-[10px] text-destructive/80 ml-4.5 max-w-xs break-words'>{fheError.message || String(fheError)}</p>}
                    </div>
                  )}
                  
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 rounded-full'
                    onClick={() => refreshFhe()}
                    title='Refresh Encryption Engine'
                  >
                    <RefreshCw className={`h-3 w-3 ${fheStatus === 'loading' ? 'animate-spin text-muted-foreground' : 'text-primary'}`} />
                  </Button>
                </div>
              )}

              {me && instance && !cardAddress && (
                <p className='text-xs text-amber-600 flex items-center gap-1.5'>
                  <span className='h-1 w-1 rounded-full bg-amber-600' />
                  Please enter your card address above
                </p>
              )}
              {me && instance && cardAddress && !chainPlan && !isPlanLoading && (
                <p className='text-xs text-destructive flex items-center gap-1.5'>
                  <span className='h-1 w-1 rounded-full bg-destructive' />
                  Plan data not found on-chain
                </p>
              )}
            </div>

            <Link href='/dashboard/subscriptions' className='text-sm underline text-muted-foreground w-fit'>
              View my subscriptions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

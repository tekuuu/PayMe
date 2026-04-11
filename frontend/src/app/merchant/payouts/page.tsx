'use client';

import { useMemo, useState } from 'react';
import { encodeFunctionData, Hex, parseUnits, toHex } from 'viem';
import { Download, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { CHAIN, CUSDC_WRAPPER_ADDRESS } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import {
  beginSettlement,
  finalizeSettlementFailure,
  finalizeSettlementSuccess,
  formatMicrosToCurrency,
} from '@/lib/merchant/control-plane-store';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';

const WRAPPER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'euint64', name: 'amount', type: 'bytes32' },
    ],
    name: 'unwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function MerchantPayoutsPage() {
  const { me } = useMe();
  const { instance } = useFhevmContext();
  const { state, refresh } = useMerchantControlPlane(me?.account);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

  const totalSettledMicros = useMemo(() => {
    let total = 0n;
    for (const settlement of state?.settlements || []) {
      if (settlement.status !== 'confirmed') continue;
      try {
        total += BigInt(settlement.amountRef);
      } catch {
        continue;
      }
    }
    return total;
  }, [state?.settlements]);

  const handleWithdraw = async () => {
    if (!me?.account) {
      toast.error('Please sign in first');
      return;
    }
    if (!instance) {
      toast.error('FHE engine not ready');
      return;
    }
    if (!withdrawAmount) {
      toast.error('Enter amount to unwrap');
      return;
    }

    let settlementId: string | null = null;
    let userOpHash: string | undefined;

    try {
      setIsWithdrawing(true);
      const amountRaw = parseUnits(withdrawAmount.toString(), 6);
      const settlement = beginSettlement({
        merchantAddress: me.account,
        amountRef: amountRaw.toString(),
      });
      settlementId = settlement.settlementId;

      const encryptedInput = instance.createEncryptedInput(CUSDC_WRAPPER_ADDRESS, me.account as Hex);
      encryptedInput.add64(amountRaw);
      const { handles } = await encryptedInput.encrypt();

      smartWallet.init();
      const call = {
        dest: CUSDC_WRAPPER_ADDRESS as Hex,
        value: 0n,
        data: encodeFunctionData({
          abi: WRAPPER_ABI,
          functionName: 'unwrap',
          args: [me.account as Hex, me.account as Hex, toHex(handles[0], { size: 32 })],
        }),
      };

      const userOp = await builder.buildUserOp({
        calls: [call],
        keyId: me.keyId,
      });

      userOpHash = await smartWallet.sendUserOperation({ userOp });
      toast.success('Payout submitted', { description: userOpHash });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash: userOpHash });
      if (!receipt || !receipt.success || receipt.receipt?.status !== '0x1') {
        throw new Error('On-chain payout failed');
      }

      finalizeSettlementSuccess({
        merchantAddress: me.account,
        settlementId: settlement.settlementId,
        userOpHash,
        txHash: receipt.receipt?.transactionHash as string | undefined,
      });
      refresh();
      setWithdrawAmount('');
      toast.success('cUSDC unwrapped to USDC');
    } catch (error: any) {
      const message = error?.message || 'Payout failed';
      if (settlementId && me?.account) {
        finalizeSettlementFailure({
          merchantAddress: me.account,
          settlementId,
          userOpHash,
          errorMessage: message,
        });
        refresh();
      }
      toast.error(message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Payouts</h2>
        <p className='text-sm text-muted-foreground'>
          Settlement-only workspace for converting collected cUSDC into merchant-usable USDC.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Merchant Wallet</p>
          <p className='mt-2 font-mono text-xs break-all'>{me?.account || 'Not connected'}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Settlements</p>
          <p className='mt-2 text-2xl font-semibold'>{state?.settlements.length || 0}</p>
        </div>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>Confirmed Payout Volume</p>
          <p className='mt-2 text-2xl font-semibold'>{formatMicrosToCurrency(totalSettledMicros)} cUSDC</p>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-[1fr_1.2fr]'>
        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <h3 className='font-semibold'>Unwrap to Mainnet USDC</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Executes confidential wrapper `unwrap(from,to,encryptedAmount)` from your smart wallet.
          </p>

          <div className='mt-5 space-y-3'>
            <label className='text-sm font-medium'>Amount (cUSDC)</label>
            <input
              type='number'
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              min='0'
              step='0.000001'
              placeholder='250.00'
              className='h-10 w-full rounded-md border bg-background px-3 text-sm'
            />

            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || !me?.account || !instance || isWithdrawing}
              className='inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
            >
              {isWithdrawing ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Download className='mr-2 h-4 w-4' />}
              Unwrap Funds
            </button>
          </div>
        </div>

        <div className='rounded-xl border bg-card shadow-sm'>
          <div className='p-4'>
            <h3 className='font-semibold'>Payout Ledger</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                <tr>
                  <th className='px-4 py-3 font-medium'>Settlement</th>
                  <th className='px-4 py-3 font-medium'>Amount</th>
                  <th className='px-4 py-3 font-medium'>Status</th>
                  <th className='px-4 py-3 font-medium'>Created</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {(state?.settlements || []).length === 0 ? (
                  <tr>
                    <td className='px-4 py-8 text-center text-muted-foreground' colSpan={4}>
                      No payouts yet.
                    </td>
                  </tr>
                ) : (
                  (state?.settlements || []).map((settlement) => (
                    <tr key={settlement.id}>
                      <td className='px-4 py-3 font-mono text-xs'>{settlement.id}</td>
                      <td className='px-4 py-3'>{formatMicrosToCurrency(settlement.amountRef)} cUSDC</td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                            settlement.status === 'confirmed'
                              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700'
                              : settlement.status === 'failed'
                                ? 'border-rose-500/30 bg-rose-500/15 text-rose-700'
                                : 'border-slate-500/30 bg-slate-500/15 text-slate-700'
                          }`}
                        >
                          {settlement.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-xs text-muted-foreground'>{new Date(settlement.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground'>
        <p className='flex items-center gap-2'>
          <Wallet className='h-4 w-4' />
          Amounts remain encrypted on-chain; this ledger records requested payout references and execution outcomes.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState, type FormEvent, useCallback, useEffect } from 'react';
import { CHAIN, CUSDC_WRAPPER_ADDRESS } from '@/config/constants';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { useConfidentialTokenBalance } from '@/hooks/use-confidential-token-balance';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
import { Me } from '@/providers/auth-provider';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { useFHEDecrypt, useInMemoryStorage } from '@/lib/fhevm-sdk/react';
import { Button } from '@/components/ui/button';
import { CryptoInput } from '@/components/ui/crypto-input';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, ArrowRightLeft, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { encodeFunctionData, Hex, parseUnits, toHex, bytesToHex, isAddress } from 'viem';
import { describeExecutionRevertReason } from '@/lib/smart-wallet/revert-decode';
import { recordCustomerActivity, confirmCustomerActivity, addConfirmedActivity } from '@/lib/merchant/control-plane-store';
import { toast } from 'sonner';

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

const WRAPPER_ABI = [
  {
    name: 'wrap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'unwrap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'encryptedAmount', type: 'bytes32' },
      { name: 'inputProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'finalizeUnwrap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'burntAmount', type: 'bytes32' },
      { name: 'burntAmountCleartext', type: 'uint64' },
      { name: 'decryptionProof', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

const UNWRAP_REQUESTED_TOPIC = '0x77d02d353c5629272875d11f1b34ec4c65d7430b075575b78cd2502034c469ee';
const UNWRAP_REQUESTED_LEGACY_TOPIC = '0x4700c1726b4198077cd40320a32c45265a1910521eb0ef713dd1d8412413d7fc';

function withGasFloors(
  userOp: any,
  floors: { callGasLimit: bigint; verificationGasLimit: bigint; preVerificationGas: bigint }
) {
  return {
    ...userOp,
    callGasLimit: toHex(maxBigInt([BigInt(userOp.callGasLimit), floors.callGasLimit])),
    verificationGasLimit: toHex(maxBigInt([BigInt(userOp.verificationGasLimit), floors.verificationGasLimit])),
    preVerificationGas: toHex(maxBigInt([BigInt(userOp.preVerificationGas), floors.preVerificationGas])),
  };
}

function sanitizeErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();
  
  // Network/timeout errors - these are common and should be clear
  if (lower.includes('timed out') || lower.includes('took too long') || lower.includes('timeout')) {
    return 'Network request timed out. Please check your connection and try again.';
  }
  
  // User cancelled
  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return 'Transaction was cancelled.';
  }
  
  // AA-specific errors
  if (lower.includes('aa21') || lower.includes('aa22') || lower.includes('aa23') || lower.includes('aa31')) {
    return 'Smart wallet prefund issue. Please try again.';
  }
  
  // Topup failures - preserve the original reason
  if (lower.includes('top-up') || lower.includes('top up') || lower.includes('topup')) {
    const reason = raw.split(/top.?up/i)[1];
    if (reason && reason.trim().length > 0) {
      return `Failed to fund smart wallet: ${reason.trim().slice(0, 100)}`;
    }
    return 'Failed to fund smart wallet. Please try again.';
  }
  
  // Revert errors
  if (lower.includes('execution reverted') || lower.includes('reverted')) {
    const revertMatch = raw.match(/revert(?:ed)?[:\s]+(.{1,80})/i);
    if (revertMatch) {
      return `Transaction reverted: ${revertMatch[1].trim()}`;
    }
    return 'Transaction reverted on chain.';
  }
  
  // Gas estimation
  if (lower.includes('gas estimation') || (lower.includes('gas') && lower.includes('estimate'))) {
    return 'Gas estimation failed. Try again or contact support.';
  }
  
  // Nonce issues
  if (lower.includes('nonce')) {
    return 'Nonce mismatch. Please refresh the page and try again.';
  }
  
  // Fallback: truncate only if extremely long, but preserve substance
  if (raw.length > 200) {
    // Try to extract the most meaningful part (first sentence or clause)
    const firstSentence = raw.split(/[.!?]\s/)[0];
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence.trim() + '...';
    }
    return raw.slice(0, 200).trim() + '...';
  }
  
  return raw;
}

function maxBigInt(values: bigint[]) {
  let best = values[0] ?? 0n;
  for (const value of values) {
    if (value > best) best = value;
  }
  return best;
}

type PendingUnwrap = {
  decryptHandle: Hex;
  unwrapRequestId?: Hex;
  amount: string;
  amountRaw: bigint;
  timestamp: number;
};

export function ShieldCard({ me }: { me: Me }) {
  const balances = useTokenBalances(me.account);
  const { decryptedValue, handleHex, refetch: refetchBalance } = useConfidentialTokenBalance(me.account);
  const { instance } = useFhevmContext();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);

  const [isShielding, setIsShielding] = useState(true);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [pendingUnwrap, setPendingUnwrap] = useState<PendingUnwrap | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [lastMode, setLastMode] = useState<'shield' | 'unshield'>('shield');
  const [serverSignerAddress, setServerSignerAddress] = useState<Hex | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('payme_pending_unwrap');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          // Validate: must have decryptHandle, otherwise clear stale data
          if (!parsed.decryptHandle || !parsed.decryptHandle.startsWith('0x') || parsed.decryptHandle.length !== 66) {
            console.warn('[Unwrap] Stale pending data detected, clearing');
            localStorage.removeItem('payme_pending_unwrap');
            setPendingUnwrap(null);
          } else {
            setPendingUnwrap({ ...parsed, amountRaw: BigInt(parsed.amountRaw) });
          }
        }
      } catch {
        localStorage.removeItem('payme_pending_unwrap');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSigner = async () => {
      try {
        const res = await fetch('/api/fhe/sign-user-decrypt', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.address && isAddress(data.address)) {
          setServerSignerAddress(data.address as Hex);
        }
      } catch {
        // ignore
      }
    };
    loadSigner();
    return () => { cancelled = true; };
  }, []);

  const serverSigner = useMemo(() => {
    if (!serverSignerAddress) return undefined;
    return {
      getAddress: async () => serverSignerAddress,
      signTypedData: async (domain: any, types: any, value: any) => {
        const primaryType = Object.keys(types || {}).find((k) => k !== 'EIP712Domain');
        if (!primaryType) throw new Error('Missing EIP-712 primary type');
        const res = await fetch('/api/fhe/sign-user-decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, types, primaryType, message: value }),
        });
        if (!res.ok) throw new Error('Server signer rejected');
        const data = await res.json();
        if (!data?.signature) throw new Error('Invalid signature');
        return data.signature;
      },
    } as any;
  }, [serverSignerAddress]);

  const finalizeRequests = useMemo(() => {
    if (!pendingUnwrap) return undefined;
    return [{ handle: pendingUnwrap.decryptHandle, contractAddress: CUSDC_WRAPPER_ADDRESS as Hex }];
  }, [pendingUnwrap]);

  const {
    decrypt: decryptBurntHandle,
    results: decryptResults,
    error: decryptError,
    canDecrypt: canFinalizeDecrypt,
  } = useFHEDecrypt({
    instance,
    ethersSigner: serverSigner,
    fhevmDecryptionSignatureStorage,
    chainId: CHAIN.id,
    requests: finalizeRequests,
  });

  const usdcBalanceRaw = balances.usdc.balance as bigint | undefined;
  const cusdcBalanceText = decryptedValue !== undefined ? (Number(decryptedValue) / 1_000_000).toFixed(2) : 'Encrypted';

  const savePendingUnwrap = (unwrap: PendingUnwrap) => {
    const serialized = { ...unwrap, amountRaw: unwrap.amountRaw.toString() };
    localStorage.setItem('payme_pending_unwrap', JSON.stringify(serialized));
    setPendingUnwrap(unwrap);
  };

  const clearPendingUnwrap = () => {
    localStorage.removeItem('payme_pending_unwrap');
    setPendingUnwrap(null);
  };

  const setMaxAmount = () => {
    if (isShielding) {
      if (usdcBalanceRaw) {
        setAmount((Number(usdcBalanceRaw) / 1_000_000).toString());
      }
    } else {
      if (cusdcBalanceText !== 'Encrypted') {
        setAmount(cusdcBalanceText);
      }
    }
  };

  const handleFinalize = useCallback(async () => {
    if (!pendingUnwrap) {
      toast.error('Nothing to finalize');
      return;
    }

    if (!instance) {
      toast.error('FHE engine not ready');
      return;
    }

    // Validate handle before attempting decryption
    const decryptHandle = pendingUnwrap.decryptHandle;
    if (!decryptHandle || !decryptHandle.startsWith('0x') || decryptHandle.length !== 66) {
      console.error('[Finalize] Invalid decrypt handle:', decryptHandle);
      toast.error('Invalid pending unwrap data. Please clear and try again.');
      clearPendingUnwrap();
      return;
    }

    setIsFinalizing(true);
    setStep('finalize');
    setError(null);
    setRawError(null);

    // Yield to browser so React can render the loading state
    await new Promise((r) => setTimeout(r, 0));

    try {
      smartWallet.init();

      // Use publicDecrypt - the wrapper marks the burned handle for public decryption
      console.log('[Finalize] Decrypting handle:', decryptHandle);

      const decryptResult = await instance.publicDecrypt([decryptHandle]);

      const decryptedVal = decryptResult.clearValues[decryptHandle];
      const decryptionProof = decryptResult.decryptionProof;

      if (decryptedVal === undefined || typeof decryptedVal !== 'bigint') {
        throw new Error('Public decryption returned invalid value');
      }

      console.log('[Finalize] Decrypted value:', decryptedVal);
      console.log('[Finalize] Decryption proof length:', decryptionProof?.length);

      // Build finalize call - use unwrapRequestId if available, otherwise decryptHandle
      const finalizeCall = {
        dest: CUSDC_WRAPPER_ADDRESS as Hex,
        value: 0n,
        data: encodeFunctionData({
          abi: WRAPPER_ABI,
          functionName: 'finalizeUnwrap',
          args: [pendingUnwrap.unwrapRequestId || pendingUnwrap.decryptHandle, decryptedVal, decryptionProof],
        }),
      };

      let finalizeUserOp = await builder.buildUserOp({
        calls: [finalizeCall],
        keyId: me.keyId,
      });

      finalizeUserOp = withGasFloors(finalizeUserOp, {
        callGasLimit: 400_000n,
        verificationGasLimit: 700_000n,
        preVerificationGas: 120_000n,
      });

      setStep('fund');
      await ensureUserOpPrefund({
        account: me.account as Hex,
        userOp: finalizeUserOp,
      });

      setStep('finalize');

      const hash = await smartWallet.sendUserOperation({ userOp: finalizeUserOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

      if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
        const rawReason = receipt?.receipt?.revertReason || receipt?.reason || 'unknown';
        const reason = describeExecutionRevertReason(rawReason) || rawReason;
        throw new Error(`Finalize failed: ${reason}`);
      }

      clearPendingUnwrap();
      await refetchBalance();
      
      const txHash = receipt.receipt?.transactionHash as string | undefined;
      if (txHash) {
        setLastMode('unshield');
        setSuccessTxHash(txHash);
        const sender = me.account as Hex;
        confirmCustomerActivity(sender, '', txHash, receipt.userOpHash as string | undefined);
        addConfirmedActivity(sender, {
          type: 'unshield',
          amount: pendingUnwrap.amount,
          token: 'cUSDC',
          txHash,
          userOpHash: receipt.userOpHash as string | undefined,
        });
      }
      
      toast.success(`${pendingUnwrap.amount} USDC received!`);
    } catch (err: any) {
      console.error('Finalize error:', err);
      const rawMsg = err.message || 'Finalize failed';
      const friendly = sanitizeErrorMessage(rawMsg);
      setError(friendly);
      setRawError(rawMsg !== friendly ? rawMsg : null);
      toast.error(friendly);
    } finally {
      setIsFinalizing(false);
      setStep(null);
    }
  }, [pendingUnwrap, instance, builder, me, refetchBalance]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setRawError(null);
    setStep(null);

    const sender = me.account as Hex;
    console.log('[Shield] Starting', isShielding ? ' shield' : 'unshield', 'amount:', amount);

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (isShielding && !usdcBalanceRaw) {
      setError('No USDC balance to shield.');
      return;
    }

    if (!isShielding && (!instance || !handleHex)) {
      setError('cUSDC handle not found or FHE engine not ready.');
      return;
    }

    const amountRaw = parseUnits(amount, 6);

    if (isShielding && amountRaw > (usdcBalanceRaw ?? 0n)) {
      setError('Insufficient USDC balance.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStep(isShielding ? 'prepare' : 'prepare');
      smartWallet.init();

      // Yield to browser so React can render the loading state
      await new Promise((r) => setTimeout(r, 0));

      if (isShielding) {
        setStep('approve');

        const approveCall = {
          dest: USDC_ADDRESS as Hex,
          value: 0n,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [CUSDC_WRAPPER_ADDRESS as Hex, amountRaw],
          }),
        };

        let approveUserOp = await builder.buildUserOp({
          calls: [approveCall],
          keyId: me.keyId,
        });

        approveUserOp = withGasFloors(approveUserOp, {
          callGasLimit: 240_000n,
          verificationGasLimit: 700_000n,
          preVerificationGas: 120_000n,
        });

        setStep('fund');
        await ensureUserOpPrefund({
          account: me.account as Hex,
          userOp: approveUserOp,
        });

        setStep('approve');

        const approveHash = await smartWallet.sendUserOperation({ userOp: approveUserOp });
        const approveReceipt = await smartWallet.waitForUserOperationReceipt({ hash: approveHash });

        if (!approveReceipt || approveReceipt.success === false || approveReceipt.receipt?.status !== '0x1') {
          throw new Error('Approve reverted');
        }

        setStep('wrap');
        await new Promise((r) => setTimeout(r, 1500));

        const balanceAfterApprove = await builder.publicClient.readContract({
          address: USDC_ADDRESS as Hex,
          abi: [{
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ type: 'uint256' }],
          }],
          functionName: 'balanceOf',
          args: [sender as Hex],
        }) as bigint;

        if (balanceAfterApprove < amountRaw) {
          throw new Error('USDC balance too low after approve.');
        }

        const wrapCall = {
          dest: CUSDC_WRAPPER_ADDRESS as Hex,
          value: 0n,
          data: encodeFunctionData({
            abi: WRAPPER_ABI,
            functionName: 'wrap',
            args: [me.account as Hex, amountRaw],
          }),
        };

        let wrapUserOp = await builder.buildUserOp({
          calls: [wrapCall],
          keyId: me.keyId,
        });

        wrapUserOp = withGasFloors(wrapUserOp, {
          callGasLimit: 800_000n,
          verificationGasLimit: 1_600_000n,
          preVerificationGas: 220_000n,
        });

        setStep('fund');
        await ensureUserOpPrefund({
          account: me.account as Hex,
          userOp: wrapUserOp,
        });

        setStep('wrap');

        const wrapHash = await smartWallet.sendUserOperation({ userOp: wrapUserOp });
        const wrapReceipt = await smartWallet.waitForUserOperationReceipt({ hash: wrapHash });

        if (!wrapReceipt || wrapReceipt.success === false || wrapReceipt.receipt?.status !== '0x1') {
          throw new Error('Wrap reverted');
        }

        const txHash = wrapReceipt.receipt?.transactionHash as string | undefined;
        if (!txHash) {
          throw new Error('Transaction confirmed but transaction hash is missing in receipt.');
        }

        setLastMode('shield');
        setSuccessTxHash(txHash);
        setError(null);
        setRawError(null);
        toast.success(`Successfully shielded ${amount} USDC → cUSDC`);
        confirmCustomerActivity(sender, '', txHash, wrapHash);
        addConfirmedActivity(sender, {
          type: 'shield',
          amount: amount,
          token: 'USDC',
          txHash,
          userOpHash: wrapHash,
        });
      } else {
        if (!instance) {
          throw new Error('FHE engine not ready');
        }

        setStep('encrypt');

        const encryptedInput = instance.createEncryptedInput(CUSDC_WRAPPER_ADDRESS, sender as Hex);
        encryptedInput.add64(amountRaw);
        const { handles, inputProof } = await encryptedInput.encrypt();

        setStep('unwrap');

        const burntHandle = toHex(handles[0], { size: 32 });

        const unwrapCall = {
          dest: CUSDC_WRAPPER_ADDRESS as Hex,
          value: 0n,
          data: encodeFunctionData({
            abi: WRAPPER_ABI,
            functionName: 'unwrap',
            args: [me.account as Hex, me.account as Hex, burntHandle, bytesToHex(inputProof)],
          }),
        };

        let unwrapUserOp = await builder.buildUserOp({
          calls: [unwrapCall],
          keyId: me.keyId,
        });

        unwrapUserOp = withGasFloors(unwrapUserOp, {
          callGasLimit: 1_500_000n,
          verificationGasLimit: 2_500_000n,
          preVerificationGas: 400_000n,
        });

        setStep('fund');
        await ensureUserOpPrefund({
          account: me.account as Hex,
          userOp: unwrapUserOp,
        });

        setStep('unwrap');

        const unwrapHash = await smartWallet.sendUserOperation({ userOp: unwrapUserOp });
        const unwrapReceipt = await smartWallet.waitForUserOperationReceipt({ hash: unwrapHash });

        if (!unwrapReceipt || unwrapReceipt.success === false || unwrapReceipt.receipt?.status !== '0x1') {
          const rawReason = unwrapReceipt?.receipt?.revertReason || unwrapReceipt?.reason || 'unknown';
          const reason = describeExecutionRevertReason(rawReason) || rawReason;
          throw new Error(`Unwrap failed: ${reason}`);
        }

        // Parse UnwrapRequested event from logs to get the decryptable handle
        // AA user op receipts have logs at both top level and nested in .receipt
        const userOpLogs = Array.isArray(unwrapReceipt?.logs) ? unwrapReceipt.logs : [];
        const txReceiptLogs = Array.isArray(unwrapReceipt?.receipt?.logs) ? unwrapReceipt.receipt.logs : [];
        const logs = txReceiptLogs.length > 0 ? txReceiptLogs : userOpLogs;
        
        console.log('[Unwrap] User op logs count:', userOpLogs.length);
        console.log('[Unwrap] Tx receipt logs count:', txReceiptLogs.length);
        console.log('[Unwrap] Using logs source:', txReceiptLogs.length > 0 ? 'receipt' : 'userOp');
        console.log('[Unwrap] Total logs to search:', logs.length);
        
        // If no logs found, try to get the transaction receipt directly
        if (logs.length === 0 && unwrapReceipt?.receipt?.transactionHash) {
          console.log('[Unwrap] No logs in user op receipt, fetching transaction receipt...');
          try {
            const txReceipt = await builder.publicClient.getTransactionReceipt({
              hash: unwrapReceipt.receipt.transactionHash,
            });
            console.log('[Unwrap] Got tx receipt with', txReceipt.logs.length, 'logs');
            logs.push(...txReceipt.logs);
          } catch (err) {
            console.error('[Unwrap] Failed to get tx receipt:', err);
          }
        }
        
        // Try to find and parse UnwrapRequested event from wrapper contract logs
        let foundEvent: { unwrapRequestId?: Hex; encryptedAmount: Hex } | null = null;
        for (const log of logs) {
          if (!log.topics || log.topics.length === 0) continue;
          
          const topic0 = log.topics[0] as Hex;
          const isMatch = topic0 === UNWRAP_REQUESTED_TOPIC || topic0 === UNWRAP_REQUESTED_LEGACY_TOPIC;
          
          console.log('[Unwrap] Log - topics count:', log.topics.length, 'topic0:', topic0, 'isUnwrapEvent:', isMatch);
          console.log('[Unwrap] Log - address:', log.address, 'data:', log.data);
          
          // Match our target topic
          if (isMatch) {
            console.log('[Unwrap] Found UnwrapRequested event! Full log:', JSON.stringify(log, null, 2));
            
            // Upgraded event: 3 topics (signature + receiver + unwrapRequestId), data = encryptedAmount
            if (log.topics.length === 3) {
              foundEvent = {
                unwrapRequestId: log.topics[2] as Hex,
                encryptedAmount: log.data as Hex,
              };
            }
            // Legacy event: 2 topics (signature + receiver), data = encryptedAmount  
            else if (log.topics.length === 2) {
              foundEvent = {
                encryptedAmount: log.data as Hex,
              };
            }
            // Single topic - this means event has no indexed params beyond signature
            // In this case, the entire payload might be in data
            else if (log.topics.length === 1) {
              // Data should contain: receiver (32 bytes) + amount/unwrapRequestId (32 bytes)
              console.log('[Unwrap] Single-topic event, parsing data...');
              if (log.data && log.data.length >= 130) {
                // Last 32 bytes should be the handle
                const handleData = log.data.slice(-66) as Hex;
                foundEvent = {
                  encryptedAmount: handleData,
                };
                console.log('[Unwrap] Extracted handle from data:', handleData);
              }
            }
            
            console.log('[Unwrap] Parsed event result:', foundEvent);
            if (foundEvent) break;
          }
        }

        const decryptHandle = foundEvent?.encryptedAmount;
        const unwrapRequestId = foundEvent?.unwrapRequestId;

        console.log('[Unwrap] Found decrypt handle:', decryptHandle);
        console.log('[Unwrap] Found unwrapRequestId:', unwrapRequestId);

        if (!decryptHandle) {
          console.error('[Unwrap] Available topic hashes for comparison:');
          console.error('[Unwrap] UNWRAP_REQUESTED_TOPIC:', UNWRAP_REQUESTED_TOPIC);
          console.error('[Unwrap] UNWRAP_REQUESTED_LEGACY_TOPIC:', UNWRAP_REQUESTED_LEGACY_TOPIC);
          console.error('[Unwrap] All log topics in receipt:', logs.map((l: any) => l.topics?.[0]));
          throw new Error('Could not find UnwrapRequested event in transaction logs. Check console for debug info.');
        }

        savePendingUnwrap({
          decryptHandle,
          unwrapRequestId,
          amount,
          amountRaw,
          timestamp: Date.now(),
        });

        await refetchBalance();
        toast.info(`cUSDC burned. Click "Finalize" to receive ${amount} USDC.`);
        setAmount('');
      }
    } catch (err: any) {
      const rawMsg = err.message || 'Transaction failed';
      const friendly = sanitizeErrorMessage(rawMsg);
      setError(friendly);
      setRawError(rawMsg !== friendly ? rawMsg : null);
      toast.error(friendly);
    } finally {
      setIsSubmitting(false);
      setStep(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {/* Shield/Unshield toggle */}
      <div className='flex items-center justify-between rounded-xl bg-muted/40 border border-border/60 px-4 py-3'>
        <div className='flex items-center gap-3'>
          <ArrowRightLeft size={18} className='text-primary' />
          <div>
            <p className='text-sm font-medium'>{isShielding ? 'Shield' : 'Unshield'}</p>
            <p className='text-xs text-muted-foreground'>
              {isShielding ? 'USDC → cUSDC' : 'cUSDC → USDC'}
            </p>
          </div>
        </div>
        <Switch
          checked={isShielding}
          onCheckedChange={(val) => {
            setIsShielding(val);
            setSuccessTxHash(null);
            setAmount('');
          }}
          className='data-[state=checked]:bg-primary'
        />
      </div>

      {/* Balances */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='rounded-xl bg-muted/40 border border-border/60 p-3'>
          <p className='text-[11px] text-muted-foreground'>USDC</p>
          <p className='text-sm font-semibold tabular-nums mt-0.5'>{balances.usdc.formatted}</p>
        </div>
        <div className='rounded-xl bg-muted/40 border border-border/60 p-3'>
          <p className='text-[11px] text-muted-foreground'>cUSDC</p>
          <p className='text-sm font-semibold tabular-nums mt-0.5'>{cusdcBalanceText}</p>
        </div>
      </div>

      {/* Pending Unwrap Banner */}
      {pendingUnwrap && !successTxHash && (
        <div className='rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Clock size={16} className='text-amber-500' />
              <p className='text-sm font-medium text-amber-500'>Pending Finalization</p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='rounded-full text-amber-500/60 hover:bg-amber-500/20 text-xs h-7'
                onClick={clearPendingUnwrap}
              >
                Clear
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='rounded-full border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-xs'
                onClick={handleFinalize}
                disabled={isFinalizing}
              >
                {isFinalizing ? (
                  <>
                    <Loader2 size={12} className='animate-spin mr-1' />
                    Finalizing...
                  </>
                ) : (
                  'Finalize'
                )}
              </Button>
            </div>
          </div>
          <p className='text-xs text-amber-500/70'>
            {pendingUnwrap.amount} cUSDC burned. Click Finalize to receive USDC.
          </p>
          {pendingUnwrap.timestamp && (
            <p className='text-[10px] text-amber-500/50'>
              Created: {new Date(pendingUnwrap.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Success State */}
      {successTxHash && (
        <div className='flex flex-col items-center gap-3 py-6 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10'>
            <CheckCircle2 className='h-6 w-6 text-emerald-500' />
          </div>
          <p className='text-sm font-medium text-foreground'>
            {lastMode === 'shield' ? 'Shield Successful' : 'Unshield Successful'}
          </p>
          <a
            href={`${CHAIN.blockExplorers?.default.url}/tx/${successTxHash}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs text-primary underline underline-offset-2 hover:no-underline'
          >
            View on explorer
          </a>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full mt-2'
            onClick={() => {
              setSuccessTxHash(null);
              setAmount('');
              setError(null);
              setRawError(null);
            }}
          >
            {lastMode === 'shield' ? 'Shield Again' : 'Unshield Again'}
          </Button>
        </div>
      )}

      {/* Amount */}
      {!pendingUnwrap && !successTxHash && (
        <div className='space-y-1.5'>
          <label className='text-xs font-medium text-muted-foreground'>
            Amount
          </label>
          <CryptoInput
            type='number'
            min='0'
            step='any'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='0.00'
            suffix={
              <span className='text-sm font-semibold text-foreground'>
                {isShielding ? 'USDC' : 'cUSDC'}
              </span>
            }
            showMaxButton
            onMaxClick={setMaxAmount}
            required
          />
        </div>
      )}

      {/* Step indicator */}
      {step && (
        <div className='flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary'>
          <Loader2 size={14} className='animate-spin' />
          {step === 'prepare' && 'Preparing transaction...'}
          {step === 'approve' && 'Approving USDC...'}
          {step === 'fund' && 'Funding wallet gas...'}
          {step === 'wrap' && 'Wrapping to cUSDC...'}
          {step === 'encrypt' && 'Encrypting amount...'}
          {step === 'unwrap' && 'Submitting unwrap...'}
          {step === 'finalize' && 'Finalizing...'}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='space-y-2'>
          <div className='flex items-start gap-2 rounded-lg bg-rose-500/10 px-3 py-2.5 text-xs text-rose-500'>
            <AlertCircle size={14} className='shrink-0 mt-0.5' />
            <span className='break-words leading-snug flex-1'>{error}</span>
          </div>
          {rawError && (
            <details className='rounded-lg bg-muted/30 border border-border/60 text-[11px]'>
              <summary className='cursor-pointer px-3 py-2 text-muted-foreground hover:text-foreground transition-colors'>
                View full error details
              </summary>
              <pre className='px-3 pb-2 pt-0 overflow-x-auto text-rose-400 whitespace-pre-wrap break-all max-h-32 overflow-y-auto'>
                {rawError}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Submit */}
      {!pendingUnwrap && !successTxHash && (
        <Button
          type='submit'
          disabled={isSubmitting || !amount}
          className='w-full rounded-lg h-10 font-medium gap-2'
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className='animate-spin' />
              Processing...
            </>
          ) : (
            isShielding ? 'Shield USDC' : 'Unshield cUSDC'
          )}
        </Button>
      )}
    </form>
  );
}

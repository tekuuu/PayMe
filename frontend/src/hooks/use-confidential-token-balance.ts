'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReadContract } from 'wagmi';
import { Hex, encodeFunctionData, isAddress, toHex, zeroAddress } from 'viem';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { useFHEDecrypt, useInMemoryStorage } from '@/lib/fhevm-sdk/react';
import { useWagmiEthers } from '@/hooks/use-wagmi-ethers';
import { useMe } from '@/providers/auth-provider';
import { CHAIN, CUSDC_WRAPPER_ADDRESS } from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
import { describeExecutionRevertReason } from '@/lib/smart-wallet/revert-decode';

const WRAPPER_READ_ABI = [
  {
    name: 'confidentialBalanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'bytes32' }],
  },
] as const;

const WRAPPER_WRITE_ABI = [
  {
    name: 'syncBalanceAcl',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'grantee', type: 'address' },
    ],
    outputs: [],
  },
] as const;

// Route changes remount components, so keep decrypted balance in module memory.
// This cache resets on full page refresh, matching the expected UX.
const runtimeDecryptedBalanceCache = new Map<string, bigint>();

function normalizeBalanceHandle(value: unknown): Hex | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    if (value === '0x' + '0'.repeat(64) || value === '0x0') return undefined;
    return value as Hex;
  }
  if (typeof value === 'bigint') {
    if (value === 0n) return undefined;
    return toHex(value, { size: 32 }) as Hex;
  }
  return undefined;
}

function cacheKeyForOwner(owner: Hex | undefined): string | undefined {
  return owner ? owner.toLowerCase() : undefined;
}

export function useConfidentialTokenBalance(ownerAddress: Hex | undefined) {
  const { me } = useMe();
  const builder = useMemo(() => new UserOpBuilder(CHAIN), []);
  const { instance } = useFhevmContext();
  const { ethersSigner, chainId } = useWagmiEthers();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const [stickyDecryptedValue, setStickyDecryptedValue] = useState<bigint | undefined>(undefined);
  const [pendingHandleForDecrypt, setPendingHandleForDecrypt] = useState<Hex | undefined>(undefined);

  const [serverSignerAddress, setServerSignerAddress] = useState<Hex | undefined>(undefined);
  const [serverSignerError, setServerSignerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSignerAddress = async () => {
      try {
        const res = await fetch('/api/fhe/sign-user-decrypt', { method: 'GET' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Decrypt signer endpoint failed (${res.status})`);
        }

        const data = await res.json();
        if (!cancelled && data?.address && isAddress(data.address)) {
          setServerSignerAddress(data.address as Hex);
          setServerSignerError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setServerSignerAddress(undefined);
          setServerSignerError(err?.message || 'Decrypt signer unavailable');
        }
      }
    };

    loadSignerAddress();

    return () => {
      cancelled = true;
    };
  }, []);

  const serverSigner = useMemo(() => {
    if (!serverSignerAddress) return undefined;

    return {
      getAddress: async () => serverSignerAddress,
      signTypedData: async (domain: any, types: any, value: any) => {
        const primaryType = Object.keys(types || {}).find((k) => k !== 'EIP712Domain');
        if (!primaryType) {
          throw new Error('Missing EIP-712 primary type for decrypt signing');
        }

        const res = await fetch('/api/fhe/sign-user-decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain,
            types,
            primaryType,
            message: value,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Server decrypt signer rejected request');
        }

        const data = await res.json();
        if (!data?.signature || typeof data.signature !== 'string') {
          throw new Error('Invalid signature response from server signer');
        }

        return data.signature;
      },
    } as any;
  }, [serverSignerAddress]);

  const decryptionSigner = serverSigner ?? ethersSigner;
  const callerAddress = ownerAddress || (me?.account as Hex | undefined);

  const { data: balanceHandle, refetch, isFetching } = useReadContract({
    address: CUSDC_WRAPPER_ADDRESS as Hex,
    abi: WRAPPER_READ_ABI,
    functionName: 'confidentialBalanceOf',
    args: [callerAddress ?? zeroAddress],
    query: {
      enabled: !!callerAddress,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  });

  const usingServerSigner = !!serverSignerAddress;

  const handleHex = useMemo(() => {
    return normalizeBalanceHandle(balanceHandle);
  }, [balanceHandle]);

  const requests = useMemo(() => {
    if (!handleHex) return undefined;
    return [{ handle: handleHex, contractAddress: CUSDC_WRAPPER_ADDRESS as Hex }];
  }, [handleHex]);

  const { decrypt, isDecrypting, results, error: decryptError, canDecrypt } = useFHEDecrypt({
    instance,
    ethersSigner: decryptionSigner,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests,
  });

  const decryptedValue = useMemo(() => {
    if (!handleHex) return undefined;
    const exact = results[handleHex];
    if (typeof exact !== 'undefined') return exact as bigint;
    const normalized = handleHex.toLowerCase();
    const match = Object.entries(results).find(([k]) => k.toLowerCase() === normalized);
    return match ? (match[1] as bigint) : undefined;
  }, [handleHex, results]);

  const ownerCacheKey = useMemo(() => cacheKeyForOwner(callerAddress), [callerAddress]);

  useEffect(() => {
    if (!ownerCacheKey) {
      setStickyDecryptedValue(undefined);
      return;
    }

    setStickyDecryptedValue(runtimeDecryptedBalanceCache.get(ownerCacheKey));
  }, [ownerCacheKey]);

  useEffect(() => {
    if (!ownerCacheKey || decryptedValue === undefined) return;

    runtimeDecryptedBalanceCache.set(ownerCacheKey, decryptedValue);
    setStickyDecryptedValue(decryptedValue);
  }, [decryptedValue, ownerCacheKey]);

  const effectiveDecryptedValue = decryptedValue ?? stickyDecryptedValue;

  const syncDecryptSignerAcl = useCallback(async () => {
    if (!usingServerSigner || !serverSignerAddress || !callerAddress) {
      return;
    }

    if (!me?.account || !me?.keyId) {
      throw new Error('Wallet session is not ready for ACL sync. Please re-login and retry.');
    }

    smartWallet.init();

    const call = {
      dest: CUSDC_WRAPPER_ADDRESS as Hex,
      value: 0n,
      data: encodeFunctionData({
        abi: WRAPPER_WRITE_ABI,
        functionName: 'syncBalanceAcl',
        args: [serverSignerAddress],
      }),
    };

    const userOp = await builder.buildUserOp({
      calls: [call],
      keyId: me.keyId,
      sender: me.account as Hex,
      publicKey: [BigInt(me.pubKey.x), BigInt(me.pubKey.y)],
    });

    await ensureUserOpPrefund({
      account: me.account as Hex,
      userOp,
    });

    const hash = await smartWallet.sendUserOperation({ userOp });
    const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

    if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
      const rawReason =
        receipt?.receipt?.revertReason ||
        receipt?.reason ||
        receipt?.error ||
        receipt?.message;
      const reason = describeExecutionRevertReason(rawReason) || String(rawReason || 'unknown');
      throw new Error(
        `Failed to authorize wallet decrypt signer: ${reason}. Ensure wrapper supports syncBalanceAcl(address) and NEXT_PUBLIC_CUSDC_WRAPPER_ADDRESS points to the upgraded deployment.`
      );
    }
  }, [
    usingServerSigner,
    serverSignerAddress,
    callerAddress,
    me?.account,
    me?.keyId,
    me?.pubKey.x,
    me?.pubKey.y,
    builder,
  ]);

  const decryptWithAclSync = useCallback(async () => {
    setPendingHandleForDecrypt(undefined);

    const firstRead = await refetch();

    if (usingServerSigner) {
      await syncDecryptSignerAcl();
    }

    const secondRead = await refetch();
    const latestHandle =
      normalizeBalanceHandle(secondRead.data) ??
      normalizeBalanceHandle(firstRead.data);

    if (!latestHandle) {
      return;
    }

    setPendingHandleForDecrypt(latestHandle);

  }, [refetch, syncDecryptSignerAcl, usingServerSigner]);

  useEffect(() => {
    if (!pendingHandleForDecrypt || !handleHex) {
      return;
    }

    if (pendingHandleForDecrypt.toLowerCase() !== handleHex.toLowerCase()) {
      return;
    }

    if (!canDecrypt || isDecrypting) {
      return;
    }

    setPendingHandleForDecrypt(undefined);
    decrypt();
  }, [canDecrypt, decrypt, handleHex, isDecrypting, pendingHandleForDecrypt]);

  return {
    handleHex,
    decryptedValue: effectiveDecryptedValue,
    latestDecryptedValue: decryptedValue,
    canDecrypt,
    decrypt,
    decryptWithAclSync,
    syncDecryptSignerAcl,
    isDecrypting,
    decryptError: decryptError ? String(decryptError) : null,
    refetch,
    isFetching,
    serverSignerError,
    usingServerSigner,
    decryptionSignerAddress: usingServerSigner ? serverSignerAddress : undefined,
  };
}


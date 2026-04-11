'use client';

import { useEffect, useMemo, useState } from 'react';
import { useReadContract } from 'wagmi';
import { Hex, isAddress, toHex, zeroAddress } from 'viem';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { useFHEDecrypt, useInMemoryStorage } from '@/lib/fhevm-sdk/react';
import { useWagmiEthers } from '@/hooks/use-wagmi-ethers';
import { useMe } from '@/providers/auth-provider';
import { CUSDC_WRAPPER_ADDRESS } from '@/config/constants';

const WRAPPER_READ_ABI = [
  {
    name: 'confidentialBalanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'bytes32' }],
  },
] as const;

export function useConfidentialTokenBalance(ownerAddress: Hex | undefined) {
  const { me } = useMe();
  const { instance } = useFhevmContext();
  const { ethersSigner, chainId } = useWagmiEthers();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

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

  const decryptionSigner = ethersSigner ?? serverSigner;
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

  const handleHex = useMemo(() => {
    if (!balanceHandle) return undefined;
    if (typeof balanceHandle === 'string') {
      if (balanceHandle === '0x' + '0'.repeat(64) || balanceHandle === '0x0') return undefined;
      return balanceHandle as Hex;
    }
    if (typeof balanceHandle === 'bigint') {
      if (balanceHandle === 0n) return undefined;
      return toHex(balanceHandle, { size: 32 }) as Hex;
    }
    return undefined;
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

  return {
    handleHex,
    decryptedValue,
    canDecrypt,
    decrypt,
    isDecrypting,
    decryptError: decryptError ? String(decryptError) : null,
    refetch,
    isFetching,
    serverSignerError,
    decryptionSignerAddress: ethersSigner ? undefined : serverSignerAddress,
  };
}


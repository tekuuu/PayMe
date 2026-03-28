"use client";

import { useMemo, useEffect, useState, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { Hex, isAddress, zeroAddress, toHex } from 'viem';
import { PRIVATE_CARD_ABI } from '@/config/constants';
import { useFhevmContext } from '@/providers/fhevm-provider';
import { useFHEDecrypt, useInMemoryStorage } from '@/lib/fhevm-sdk/react';
import { useWagmiEthers } from './use-wagmi-ethers';
import { useMe } from '@/providers/auth-provider';

const WRAPPER_READ_ABI = [
    {
        name: 'confidentialBalanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'bytes32' }]
    }
] as const;

export function useConfidentialBalance(cardAddress: Hex | undefined, ownerAddress: Hex | undefined) {
    const { me } = useMe();
    const { instance } = useFhevmContext();
    const { ethersSigner, chainId } = useWagmiEthers();
    const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

    const callerAddress = ownerAddress || (me?.account as Hex | undefined);
    const [serverSignerAddress, setServerSignerAddress] = useState<Hex | undefined>(undefined);
    const [serverSignerError, setServerSignerError] = useState<string | null>(null);

    const [cachedHandle, setCachedHandle] = useState<string | undefined>(undefined);
    const [cachedDecryptedValue, setCachedDecryptedValue] = useState<bigint | undefined>(undefined);

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

    // Relayer user-decrypt currently requires secp256k1/65-byte ECDSA signatures.
    const decryptionSigner = ethersSigner ?? serverSigner;

    const { data: cardCusdcAddress } = useReadContract({
        address: cardAddress,
        abi: PRIVATE_CARD_ABI,
        functionName: 'cUSDC',
        query: {
            enabled: !!cardAddress && cardAddress !== zeroAddress,
        }
    });

    // Read encrypted handle directly from wrapper, same pattern as reference project.
    const { data: balanceHandle, refetch } = useReadContract({
        address: cardAddress as Hex,
        abi: [{ name: 'getEncryptedBalance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }],
        functionName: 'getEncryptedBalance',
        args: [],
        // ensure read contract uses owner address so the `Only wallet` guard passes
        account: callerAddress,
        query: {
            enabled: !!cardAddress && !!callerAddress,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        }
    });

    const requests = useMemo(() => {
        if (!cardCusdcAddress || !balanceHandle) return undefined;

        let handleHex: string | undefined;

        if (typeof balanceHandle === 'bigint') {
            if (balanceHandle === 0n) return undefined;
            handleHex = toHex(balanceHandle, { size: 32 });
        } else if (typeof balanceHandle === 'string') {
            if (balanceHandle === '0x' + '0'.repeat(64) || balanceHandle === '0x0') return undefined;
            handleHex = balanceHandle;
        }

        if (!handleHex) return undefined;

        return [{ handle: handleHex, contractAddress: cardAddress as Hex }];
    }, [cardAddress, cardCusdcAddress, balanceHandle]);

    // 2. Decrypt the balance handle
    const {
        decrypt,
        isDecrypting,
        results,
        error: decryptError,
        canDecrypt
    } = useFHEDecrypt({
        instance,
        ethersSigner: decryptionSigner,
        fhevmDecryptionSignatureStorage,
        chainId,
        requests
    });

    const decryptedValue = useMemo(() => {
        if (!balanceHandle) return undefined;

        const balanceKey =
            typeof balanceHandle === 'string'
                ? balanceHandle
                : toHex(balanceHandle, { size: 32 });

        const exact = results[balanceKey];
        if (typeof exact !== 'undefined') return exact as bigint;

        const normalizedKey = balanceKey.toLowerCase();
        const normalizedMatch = Object.entries(results).find(([k]) => k.toLowerCase() === normalizedKey);
        if (!normalizedMatch) return undefined;

        return normalizedMatch[1] as bigint;
    }, [balanceHandle, results]);

    useEffect(() => {
        if (!balanceHandle) {
            setCachedHandle(undefined);
            setCachedDecryptedValue(undefined);
            if (typeof window !== 'undefined' && cardAddress) {
                window.localStorage.removeItem(`payme.decryptedBalance.${cardAddress}`);
            }
            return;
        }

        const handleHex = typeof balanceHandle === 'string'
            ? balanceHandle
            : toHex(balanceHandle, { size: 32 });

        // Always try to restore from localStorage when handle changes
        if (typeof window !== 'undefined' && cardAddress && handleHex) {
            const persisted = window.localStorage.getItem(`payme.decryptedBalance.${cardAddress}`);
            if (persisted) {
                try {
                    const parsed = JSON.parse(persisted);
                    if (parsed && parsed.handle === handleHex && typeof parsed.value === 'string') {
                        setCachedDecryptedValue(BigInt(parsed.value));
                    } else if (cachedHandle !== handleHex) {
                        setCachedDecryptedValue(undefined);
                    }
                } catch {
                    setCachedDecryptedValue(undefined);
                }
            } else if (cachedHandle !== handleHex) {
                setCachedDecryptedValue(undefined);
            }
        } else if (cachedHandle !== handleHex) {
            setCachedDecryptedValue(undefined);
        }

        if (cachedHandle !== handleHex) {
            setCachedHandle(handleHex);
        }
    }, [balanceHandle, cachedHandle, cardAddress]);

    useEffect(() => {
        if (decryptedValue !== undefined && decryptedValue !== cachedDecryptedValue) {
            setCachedDecryptedValue(decryptedValue);
            // Persist to localStorage
            if (typeof window !== 'undefined' && cardAddress && balanceHandle) {
                const handleHex = typeof balanceHandle === 'string' ? balanceHandle : toHex(balanceHandle, { size: 32 });
                window.localStorage.setItem(
                    `payme.decryptedBalance.${cardAddress}`,
                    JSON.stringify({ handle: handleHex, value: decryptedValue.toString() })
                );
            }
        }
    }, [decryptedValue, cachedDecryptedValue, cardAddress, balanceHandle]);

    const effectiveValue = cachedDecryptedValue ?? decryptedValue;

    const formattedBalance = useMemo(() => {
        if (effectiveValue === undefined) return '••••';
        return (Number(effectiveValue) / 1000000).toFixed(2); // Assuming 6 decimals for cUSDC
    }, [effectiveValue]);

    return {
        balanceHandle: balanceHandle as string | undefined,
        hasEncryptedHandle:
            !!balanceHandle &&
            !(
                (typeof balanceHandle === 'bigint' && balanceHandle === 0n) ||
                (typeof balanceHandle === 'string' && (balanceHandle === '0x' + '0'.repeat(64) || balanceHandle === '0x0'))
            ),
        cachedDecryptedValue,
        cachedHandle,
        effectiveValue,
        wrapperAddress: cardCusdcAddress as Hex | undefined,
        hasSigner: !!decryptionSigner,
        decryptSignerAddress: serverSignerAddress,
        usingServerSigner: !ethersSigner && !!serverSigner,
        serverSignerError,
        hasFheInstance: !!instance,
        decryptedValue,
        formattedBalance,
        isDecrypting,
        canDecrypt,
        decrypt,
        refresh: refetch,
        decryptError
    };
}

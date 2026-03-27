'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { decodeEventLog, encodeFunctionData, Hex, zeroAddress } from 'viem';
import {
    CARD_FACTORY_ABI,
    PRIVATE_CARD_ABI,
    PRIVATE_CARD_FACTORY_ADDRESS,
    CHAIN
} from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { Me } from '@/providers/auth-provider';
import { toast } from 'sonner';

export function usePrivateCard(me: Me | null) {
    const builder = useMemo(() => new UserOpBuilder(CHAIN), []);
    const [isCreating, setIsCreating] = useState(false);

    const { data: cardAddressList, isLoading, refetch } = useReadContract({
        address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
        abi: CARD_FACTORY_ABI,
        functionName: 'getCards',
        args: [me?.account as Hex],
        query: {
            enabled: !!me?.account && me.account !== zeroAddress,
            staleTime: 5000,
        }
    });

    const { data: cardAddressSingle } = useReadContract({
        address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
        abi: CARD_FACTORY_ABI,
        functionName: 'getCard',
        args: [me?.account as Hex],
        query: {
            enabled: !!me?.account && me.account !== zeroAddress,
            staleTime: 5000,
        },
    });

    const cardAddresses = Array.isArray(cardAddressList)
        ? (cardAddressList as Hex[])
        : cardAddressSingle && cardAddressSingle !== zeroAddress
            ? [(cardAddressSingle as Hex)]
            : [];
    const [selectedCardIndex, setSelectedCardIndex] = useState(0);
    const selectedCardAddress = cardAddresses.length > 0 ? cardAddresses[selectedCardIndex] : undefined;
    const hasCard = cardAddresses.length > 0;

    useEffect(() => {
        if (cardAddresses.length === 0) {
            setSelectedCardIndex(0);
            return;
        }
        if (selectedCardIndex >= cardAddresses.length) {
            setSelectedCardIndex(0);
        }
    }, [cardAddresses, selectedCardIndex]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).appBuilder = builder;
            (window as any).appCardAddresses = cardAddresses;
            (window as any).appSelectedCardAddress = selectedCardAddress;
        }
    }, [builder, cardAddresses, selectedCardAddress]);

    const createCard = useCallback(async () => {
        if (!me) return;

        setIsCreating(true);
        try {
            // Top-up is handled during initial wallet creation; skip here.
            smartWallet.init();

            // 1. Encode the createCard call
            const call = {
                dest: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
                value: 0n,
                data: encodeFunctionData({
                    abi: CARD_FACTORY_ABI,
                    functionName: 'createCard',
                    args: []
                })
            };

            // 3. Build UserOperation
            const userOp = await builder.buildUserOp({
                calls: [call],
                keyId: me.keyId
            });

            // 4. Send and wait for receipt
            const hash = await smartWallet.sendUserOperation({ userOp });
            const receipt = await smartWallet.waitForUserOperationReceipt({ hash });

            console.log('[createCard] userOp receipt:', receipt);

            if (!receipt || receipt.success === false || receipt.receipt?.status !== '0x1') {
                const reason = receipt?.receipt?.revertReason || 'unknown';
                throw new Error(`UserOperation failed to execute: success=${receipt?.success ?? 'null'} status=${receipt?.receipt?.status ?? 'null'} reason=${reason}`);
            }

            // Persist receipt for debugging and try to decode CardCreated from logs immediately.
            try {
                if (typeof window !== 'undefined') {
                    try { window.localStorage.setItem('payme.lastCreateReceipt', JSON.stringify(receipt)); } catch {}
                }

                const logs = Array.isArray(receipt?.logs) ? receipt.logs : [];
                for (const log of logs) {
                    if (!log?.address) continue;
                    if (log.address.toLowerCase() !== (PRIVATE_CARD_FACTORY_ADDRESS as string).toLowerCase()) continue;
                    try {
                        const decoded = decodeEventLog({ abi: CARD_FACTORY_ABI, data: log.data, topics: log.topics });
                        console.log('[createCard] decoded log:', decoded);
                        if (decoded?.eventName === 'CardCreated') {
                            const created = decoded.args?.card as Hex | undefined;
                            if (created && created !== zeroAddress) {
                                try { if (typeof window !== 'undefined') window.localStorage.setItem('payme.lastCreatedCard', created); } catch {}
                                await refetch();
                                console.log('[createCard] card created at (from log)', created);
                                toast.success("Private Card successfully created!");
                                return;
                            }
                        }
                    } catch (e) {
                        console.warn('[createCard] failed to decode log', e);
                    }
                }
            } catch (e) {
                console.warn('[createCard] receipt handling error', e);
            }

            // Poll the factory for the created card address (fallback for slow RPC/indexing).
            let found: string | null = null;
            for (let i = 0; i < 20; i++) {
                try {
                    const fresh = await builder.publicClient.readContract({
                        address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
                        abi: CARD_FACTORY_ABI,
                        functionName: 'getCard',
                        args: [me.account as Hex],
                    }) as Hex;

                    console.log(`[createCard] poll #${i} getCard ->`, fresh);
                    if (fresh && fresh !== zeroAddress) {
                        found = fresh as string;
                        break;
                    }
                } catch (e) {
                    console.warn('[createCard] poll error', e);
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            if (found) {
                await refetch();
                console.log('[createCard] card created at', found);
                toast.success("Private Card successfully created!");
            } else {
                console.warn('[createCard] card address not found after polling');
                await refetch();
                toast.success("Private Card created (pending index). Please refresh if it does not appear.");
            }
        } catch (error: any) {
            console.error("Failed to create card:", error);
            toast.error(error?.message || "Failed to create Private Card");
        } finally {
            setIsCreating(false);
        }
    }, [me, builder, refetch]);

    return {
        cardAddresses,
        selectedCardAddress,
        selectedCardIndex,
        setSelectedCardIndex,
        hasCard,
        isLoading,
        isCreating,
        createCard,
        refresh: refetch
    };
}

'use client';

import { useMemo, useState, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { encodeFunctionData, Hex, zeroAddress } from 'viem';
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

    const { data: cardAddress, isLoading, refetch } = useReadContract({
        address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
        abi: CARD_FACTORY_ABI,
        functionName: 'getCard',
        args: [me?.account as Hex],
        query: {
            enabled: !!me?.account && me.account !== zeroAddress,
        }
    });

    const hasCard = !!cardAddress && cardAddress !== zeroAddress;

    const createCard = useCallback(async () => {
        if (!me) return;

        setIsCreating(true);
        try {
            const topUpResp = await fetch('/api/users/topup', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ account: me.account })
            });

            const topUpResult = await topUpResp.json();
            if (!topUpResp.ok) {
                throw new Error(topUpResult?.error || 'Failed to top up smart wallet for prefund');
            }

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
            await smartWallet.waitForUserOperationReceipt({ hash });

            toast.success("Private Card successfully created!");
            await refetch();
        } catch (error: any) {
            console.error("Failed to create card:", error);
            toast.error(error?.message || "Failed to create Private Card");
        } finally {
            setIsCreating(false);
        }
    }, [me, builder, refetch]);

    return {
        cardAddress: cardAddress as Hex | undefined,
        hasCard,
        isLoading,
        isCreating,
        createCard,
        refresh: refetch
    };
}

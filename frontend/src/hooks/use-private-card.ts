'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { decodeEventLog, encodeFunctionData, getAddress, Hex, isAddress, toHex, zeroAddress } from 'viem';
import {
    CARD_FACTORY_ABI,
    ENTRYPOINT_ADDRESS,
    PRIVATE_CARD_ABI,
    PRIVATE_CARD_FACTORY_ADDRESS,
    CHAIN
} from '@/config/constants';
import { smartWallet } from '@/lib/smart-wallet';
import { UserOpBuilder } from '@/lib/smart-wallet/service/userOps';
import { UserOperationAsHex } from '@/lib/smart-wallet/service/userOps/types';
import { ensureUserOpPrefund } from '@/lib/smart-wallet/service/userOps/prefund';
import { describeExecutionRevertReason } from '@/lib/smart-wallet/revert-decode';
import { Me } from '@/providers/auth-provider';
import { toast } from 'sonner';

type StoredLinkedCard = {
    address: Hex;
    owner: Hex;
    addedAt: string;
};

export type PrivateCardListItem = {
    address: Hex;
    owner: Hex;
    origin: 'owned' | 'imported';
};

export type PrivateCardSearchResult = {
    address: Hex;
    owner: Hex;
    isOwned: boolean;
    isLinked: boolean;
    isHidden: boolean;
};

function sameAddress(left?: string, right?: string) {
    return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

function normalizeAddress(address: string): Hex {
    return getAddress(address) as Hex;
}

function uniqueAddresses(addresses: Hex[]): Hex[] {
    const seen = new Set<string>();
    const unique: Hex[] = [];

    for (const address of addresses) {
        const normalized = normalizeAddress(address);
        const key = normalized.toLowerCase();
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        unique.push(normalized);
    }

    return unique;
}

function linkedCardsStorageKey(account: Hex) {
    return `payme.linkedCards.${account.toLowerCase()}`;
}

function hiddenCardsStorageKey(account: Hex) {
    return `payme.hiddenCards.${account.toLowerCase()}`;
}

function maxBigInt(values: bigint[]) {
    let best = values[0] ?? 0n;
    for (const value of values) {
        if (value > best) best = value;
    }
    return best;
}

function isRetryableUserOpGasError(error: unknown) {
    const message = String((error as any)?.message || '').toLowerCase();
    return (
        message.includes('aa40') ||
        message.includes('over verificationgaslimit') ||
        message.includes('aa23') ||
        message.includes('reverted (or oog)') ||
        message.includes('preverificationgas is not enough')
    );
}

function hardenCreateCardUserOpGas(userOp: UserOperationAsHex): UserOperationAsHex {
    const call = BigInt(userOp.callGasLimit);
    const verification = BigInt(userOp.verificationGasLimit);
    const pre = BigInt(userOp.preVerificationGas);
    return {
        ...userOp,
        callGasLimit: toHex(maxBigInt([call, 400_000n])),
        verificationGasLimit: toHex(maxBigInt([verification, 1_100_000n])),
        preVerificationGas: toHex(maxBigInt([pre, 170_000n])),
    };
}

function bumpCreateCardUserOpGas(userOp: UserOperationAsHex): UserOperationAsHex {
    const call = BigInt(userOp.callGasLimit);
    const verification = BigInt(userOp.verificationGasLimit);
    const pre = BigInt(userOp.preVerificationGas);
    const bump = (value: bigint, bps: bigint, extra: bigint) =>
        ((value * (10_000n + bps) + 9_999n) / 10_000n) + extra;

    return {
        ...userOp,
        callGasLimit: toHex(maxBigInt([bump(call, 3500n, 60_000n), 500_000n])),
        verificationGasLimit: toHex(maxBigInt([bump(verification, 7000n, 200_000n), 1_400_000n])),
        preVerificationGas: toHex(maxBigInt([bump(pre, 4000n, 20_000n), 190_000n])),
    };
}

const ENTRYPOINT_REVERT_EVENT_ABI = [
    {
        anonymous: false,
        type: 'event',
        name: 'UserOperationRevertReason',
        inputs: [
            { indexed: true, name: 'userOpHash', type: 'bytes32' },
            { indexed: true, name: 'sender', type: 'address' },
            { indexed: false, name: 'nonce', type: 'uint256' },
            { indexed: false, name: 'revertReason', type: 'bytes' },
        ],
    },
] as const;

function extractCreatedCardFromReceipt(receipt: any): Hex | undefined {
    const logs = Array.isArray(receipt?.logs) ? receipt.logs : [];

    for (const log of logs) {
        if (!log?.address) continue;
        if (log.address.toLowerCase() !== (PRIVATE_CARD_FACTORY_ADDRESS as string).toLowerCase()) continue;

        try {
            const decoded = decodeEventLog({ abi: CARD_FACTORY_ABI, data: log.data, topics: log.topics });
            if (decoded?.eventName === 'CardCreated') {
                const created = decoded.args?.card as Hex | undefined;
                if (created && created !== zeroAddress) {
                    return normalizeAddress(created);
                }
            }
        } catch {
            // ignore non-matching logs
        }
    }

    return undefined;
}

function extractUserOpFailureReason(receipt: any): string {
    const directReason =
        receipt?.receipt?.revertReason ||
        receipt?.reason ||
        receipt?.error ||
        receipt?.message;

    const decodedDirectReason = describeExecutionRevertReason(directReason);
    if (decodedDirectReason && decodedDirectReason.trim().length > 0 && decodedDirectReason !== 'unknown') {
        return decodedDirectReason;
    }

    const logs = Array.isArray(receipt?.logs) ? receipt.logs : [];
    for (const log of logs) {
        if (!log?.address) continue;
        if (log.address.toLowerCase() !== ENTRYPOINT_ADDRESS.toLowerCase()) continue;

        try {
            const decoded = decodeEventLog({
                abi: ENTRYPOINT_REVERT_EVENT_ABI,
                data: log.data,
                topics: log.topics,
            });

            if (decoded?.eventName === 'UserOperationRevertReason') {
                const rawReason = decoded.args?.revertReason as Hex | undefined;
                const parsedReason = describeExecutionRevertReason(rawReason);
                if (parsedReason && parsedReason.trim().length > 0) {
                    return parsedReason;
                }

                if (rawReason && rawReason !== '0x') {
                    return rawReason;
                }
            }
        } catch {
            // ignore non-matching logs
        }
    }

    return 'unknown';
}

function readStoredLinkedCards(account?: Hex): StoredLinkedCard[] {
    if (typeof window === 'undefined' || !account) {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(linkedCardsStorageKey(account));
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.flatMap((entry) => {
            if (!entry || typeof entry !== 'object') {
                return [];
            }

            const address = typeof entry.address === 'string' && isAddress(entry.address) ? normalizeAddress(entry.address) : null;
            const owner = typeof entry.owner === 'string' && isAddress(entry.owner) ? normalizeAddress(entry.owner) : null;
            const addedAt = typeof entry.addedAt === 'string' ? entry.addedAt : new Date(0).toISOString();

            if (!address || !owner) {
                return [];
            }

            return [{ address, owner, addedAt }];
        });
    } catch {
        return [];
    }
}

function readStoredHiddenCards(account?: Hex): Hex[] {
    if (typeof window === 'undefined' || !account) {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(hiddenCardsStorageKey(account));
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return uniqueAddresses(
            parsed.flatMap((entry) => (typeof entry === 'string' && isAddress(entry) ? [normalizeAddress(entry)] : []))
        );
    } catch {
        return [];
    }
}

export function usePrivateCard(me: Me | null) {
    const builder = useMemo(() => new UserOpBuilder(CHAIN), []);
    const [isCreating, setIsCreating] = useState(false);
    const [linkedCards, setLinkedCards] = useState<StoredLinkedCard[]>([]);
    const [hiddenCardAddresses, setHiddenCardAddresses] = useState<Hex[]>([]);
    const [selectedCardAddressState, setSelectedCardAddressState] = useState<Hex | undefined>();
    const [hasHydratedLocalCards, setHasHydratedLocalCards] = useState(false);

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

    useEffect(() => {
        if (!me?.account || me.account === zeroAddress) {
            setLinkedCards([]);
            setHiddenCardAddresses([]);
            setSelectedCardAddressState(undefined);
            setHasHydratedLocalCards(false);
            return;
        }

        const normalizedAccount = normalizeAddress(me.account);
        setLinkedCards(readStoredLinkedCards(normalizedAccount));
        setHiddenCardAddresses(readStoredHiddenCards(normalizedAccount));
        setHasHydratedLocalCards(true);
    }, [me?.account]);

    useEffect(() => {
        if (!hasHydratedLocalCards || typeof window === 'undefined' || !me?.account || me.account === zeroAddress) {
            return;
        }

        window.localStorage.setItem(linkedCardsStorageKey(normalizeAddress(me.account)), JSON.stringify(linkedCards));
    }, [hasHydratedLocalCards, linkedCards, me?.account]);

    useEffect(() => {
        if (!hasHydratedLocalCards || typeof window === 'undefined' || !me?.account || me.account === zeroAddress) {
            return;
        }

        window.localStorage.setItem(hiddenCardsStorageKey(normalizeAddress(me.account)), JSON.stringify(hiddenCardAddresses));
    }, [hasHydratedLocalCards, hiddenCardAddresses, me?.account]);

    const ownedCardAddresses = useMemo(() => {
        const fromList = Array.isArray(cardAddressList)
            ? (cardAddressList as Hex[]).filter((address) => !!address && address !== zeroAddress)
            : [];
        const fromSingle =
            cardAddressSingle && cardAddressSingle !== zeroAddress ? [cardAddressSingle as Hex] : [];

        return uniqueAddresses([...fromList, ...fromSingle]);
    }, [cardAddressList, cardAddressSingle]);

    const cards = useMemo(() => {
        const hiddenSet = new Set(hiddenCardAddresses.map((address) => address.toLowerCase()));
        const ownedSet = new Set(ownedCardAddresses.map((address) => address.toLowerCase()));
        const ownedCards: PrivateCardListItem[] = ownedCardAddresses.map((address) => ({
            address,
            owner: normalizeAddress(me?.account || zeroAddress),
            origin: 'owned',
        }));
        const importedCards: PrivateCardListItem[] = linkedCards
            .filter((card) => !ownedSet.has(card.address.toLowerCase()))
            .map((card) => ({
                address: card.address,
                owner: card.owner,
                origin: 'imported',
            }));

        return [...ownedCards, ...importedCards].filter((card) => !hiddenSet.has(card.address.toLowerCase()));
    }, [hiddenCardAddresses, linkedCards, me?.account, ownedCardAddresses]);

    const cardAddresses = useMemo(() => cards.map((card) => card.address), [cards]);
    const selectedCardIndex = useMemo(
        () => cards.findIndex((card) => sameAddress(card.address, selectedCardAddressState)),
        [cards, selectedCardAddressState]
    );
    const selectedCardAddress = selectedCardIndex >= 0 ? cards[selectedCardIndex]?.address : cards[0]?.address;
    const selectedCard = selectedCardIndex >= 0 ? cards[selectedCardIndex] : cards[0];
    const hasCard = cards.length > 0;

    useEffect(() => {
        if (cards.length === 0) {
            setSelectedCardAddressState(undefined);
            return;
        }

        if (!selectedCardAddressState || !cards.some((card) => sameAddress(card.address, selectedCardAddressState))) {
            setSelectedCardAddressState(cards[0].address);
        }
    }, [cards, selectedCardAddressState]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).appBuilder = builder;
            (window as any).appCardAddresses = cardAddresses;
            (window as any).appSelectedCardAddress = selectedCardAddress;
        }
    }, [builder, cardAddresses, selectedCardAddress]);

    const setSelectedCardIndex = useCallback(
        (index: number) => {
            const nextCard = cards[index];
            if (!nextCard) {
                return;
            }

            setSelectedCardAddressState(nextCard.address);
        },
        [cards]
    );

    const resolveCard = useCallback(
        async (addressInput: string) => {
            if (!isAddress(addressInput)) {
                throw new Error('Enter a valid card address.');
            }

            const cardAddress = normalizeAddress(addressInput);

            try {
                const [owner, wrapper] = await Promise.all([
                    builder.publicClient.readContract({
                        address: cardAddress,
                        abi: PRIVATE_CARD_ABI,
                        functionName: 'owner',
                    }) as Promise<Hex>,
                    builder.publicClient.readContract({
                        address: cardAddress,
                        abi: PRIVATE_CARD_ABI,
                        functionName: 'cUSDC',
                    }) as Promise<Hex>,
                ]);

                if (!owner || owner === zeroAddress || !wrapper || wrapper === zeroAddress) {
                    throw new Error('That address is not a usable PayMe card.');
                }

                return {
                    address: cardAddress,
                    owner: normalizeAddress(owner),
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Unable to read that card. Please verify the address.');
            }
        },
        [builder]
    );

    const attachCardByAddress = useCallback(
        async (addressInput: string) => {
            const card = await resolveCard(addressInput);
            const isOwnedCard = ownedCardAddresses.some((address) => sameAddress(address, card.address));

            setHiddenCardAddresses((current) => current.filter((address) => !sameAddress(address, card.address)));
            setLinkedCards((current) => {
                const withoutCard = current.filter((entry) => !sameAddress(entry.address, card.address));

                if (isOwnedCard) {
                    return withoutCard;
                }

                return [
                    ...withoutCard,
                    {
                        address: card.address,
                        owner: card.owner,
                        addedAt: new Date().toISOString(),
                    },
                ];
            });
            setSelectedCardAddressState(card.address);

            toast.success(
                sameAddress(card.owner, me?.account)
                    ? 'Card attached to your list.'
                    : 'Card imported. Owner-only actions stay locked unless you are the card owner.'
            );

            return card;
        },
        [me?.account, ownedCardAddresses, resolveCard]
    );

    const searchCardsByOwner = useCallback(
        async (ownerInput: string): Promise<PrivateCardSearchResult[]> => {
            if (!isAddress(ownerInput)) {
                throw new Error('Enter a valid owner address.');
            }

            const owner = normalizeAddress(ownerInput);
            const results = (await builder.publicClient.readContract({
                address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
                abi: CARD_FACTORY_ABI,
                functionName: 'getCards',
                args: [owner],
            })) as Hex[];

            const addresses = uniqueAddresses(
                (Array.isArray(results) ? results : []).filter((address) => !!address && address !== zeroAddress)
            );

            const ownedSet = new Set(ownedCardAddresses.map((address) => address.toLowerCase()));
            const linkedSet = new Set(linkedCards.map((card) => card.address.toLowerCase()));
            const hiddenSet = new Set(hiddenCardAddresses.map((address) => address.toLowerCase()));

            return addresses.map((address) => {
                const key = address.toLowerCase();

                return {
                    address,
                    owner,
                    isOwned: ownedSet.has(key),
                    isLinked: linkedSet.has(key),
                    isHidden: hiddenSet.has(key),
                };
            });
        },
        [builder, hiddenCardAddresses, linkedCards, ownedCardAddresses]
    );

    const removeCard = useCallback((address: Hex) => {
        const normalizedAddress = normalizeAddress(address);

        setLinkedCards((current) => current.filter((entry) => !sameAddress(entry.address, normalizedAddress)));
        setHiddenCardAddresses((current) => {
            if (current.some((entry) => sameAddress(entry, normalizedAddress))) {
                return current;
            }

            return [...current, normalizedAddress];
        });

        if (sameAddress(selectedCardAddressState, normalizedAddress)) {
            setSelectedCardAddressState(undefined);
        }

        toast.success('Card removed from this device list.');
    }, [selectedCardAddressState]);

    const createCard = useCallback(async () => {
        if (!me) return;

        setIsCreating(true);
        try {
            const baselineOwnedSet = new Set(ownedCardAddresses.map((address) => address.toLowerCase()));
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
            const baseUserOp = await builder.buildUserOp({
                calls: [call],
                keyId: me.keyId
            });

            const submit = async (candidate: UserOperationAsHex) => {
                await ensureUserOpPrefund({
                    account: me.account as Hex,
                    userOp: candidate,
                });
                const hash = await smartWallet.sendUserOperation({ userOp: candidate });
                return smartWallet.waitForUserOperationReceipt({ hash });
            };

            const userOp = hardenCreateCardUserOpGas(baseUserOp);
            let receipt: any;
            let usedFallbackGas = false;
            try {
                receipt = await submit(userOp);
            } catch (error) {
                if (!isRetryableUserOpGasError(error)) {
                    throw error;
                }
                usedFallbackGas = true;
                receipt = await submit(bumpCreateCardUserOpGas(userOp));
            }

            console.log('[createCard] userOp receipt:', receipt);

            if (typeof window !== 'undefined') {
                try { window.localStorage.setItem('payme.lastCreateReceipt', JSON.stringify(receipt)); } catch { void 0; }
            }

            const applyCreatedCard = async (createdCard: Hex) => {
                try { if (typeof window !== 'undefined') window.localStorage.setItem('payme.lastCreatedCard', createdCard); } catch { void 0; }
                setHiddenCardAddresses((current) => current.filter((address) => !sameAddress(address, createdCard)));
                setLinkedCards((current) => current.filter((entry) => !sameAddress(entry.address, createdCard)));
                setSelectedCardAddressState(normalizeAddress(createdCard));
                await refetch();
                console.log('[createCard] card created at', createdCard);
                toast.success('Private Card successfully created!');
            };

            const createdFromReceipt = extractCreatedCardFromReceipt(receipt);
            if (createdFromReceipt) {
                await applyCreatedCard(createdFromReceipt);
                return;
            }

            const receiptLooksFailed = !receipt || receipt.success === false || receipt.receipt?.status !== '0x1';
            if (receiptLooksFailed && !usedFallbackGas) {
                const bumpedUserOp = bumpCreateCardUserOpGas(userOp);
                const bumpedReceipt = await submit(bumpedUserOp);
                console.log('[createCard] userOp receipt (fallback gas):', bumpedReceipt);

                if (typeof window !== 'undefined') {
                    try { window.localStorage.setItem('payme.lastCreateReceipt', JSON.stringify(bumpedReceipt)); } catch { void 0; }
                }

                receipt = bumpedReceipt;
                const createdFromFallbackReceipt = extractCreatedCardFromReceipt(bumpedReceipt);
                if (createdFromFallbackReceipt) {
                    await applyCreatedCard(createdFromFallbackReceipt);
                    return;
                }
            }

            // Poll the factory for the created card address (fallback for slow RPC/indexing).
            let found: string | null = null;
            for (let i = 0; i < 20; i++) {
                try {
                    const freshCards = await builder.publicClient.readContract({
                        address: PRIVATE_CARD_FACTORY_ADDRESS as Hex,
                        abi: CARD_FACTORY_ABI,
                        functionName: 'getCards',
                        args: [me.account as Hex],
                    }) as Hex[];
                    const freshUniqueCards = uniqueAddresses(
                        (Array.isArray(freshCards) ? freshCards : []).filter((address) => !!address && address !== zeroAddress)
                    );

                    const newCard = freshUniqueCards.find((address) => !baselineOwnedSet.has(address.toLowerCase()));

                    console.log(`[createCard] poll #${i} getCards ->`, freshCards);
                    if (newCard) {
                        found = newCard as string;
                        break;
                    }
                } catch (e) {
                    console.warn('[createCard] poll error', e);
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            if (found) {
                setHiddenCardAddresses((current) => current.filter((address) => !sameAddress(address, found || undefined)));
                setLinkedCards((current) => current.filter((entry) => !sameAddress(entry.address, found || undefined)));
                setSelectedCardAddressState(normalizeAddress(found));
                await refetch();
                console.log('[createCard] card created at', found);
                toast.success("Private Card successfully created!");
            } else {
                const reason = extractUserOpFailureReason(receipt);
                throw new Error(
                    `UserOperation failed to execute: success=${receipt?.success ?? 'null'} status=${receipt?.receipt?.status ?? 'null'} reason=${reason}`
                );
            }
        } catch (error: any) {
            console.error("Failed to create card:", error);
            toast.error(error?.message || "Failed to create Private Card");
        } finally {
            setIsCreating(false);
        }
    }, [me, builder, refetch, ownedCardAddresses]);

    return {
        cards,
        cardAddresses,
        selectedCardAddress,
        selectedCard,
        selectedCardIndex,
        setSelectedCardIndex,
        setSelectedCardAddress: setSelectedCardAddressState,
        hasCard,
        isLoading,
        isCreating,
        createCard,
        attachCardByAddress,
        searchCardsByOwner,
        removeCard,
        resolveCard,
        refresh: refetch
    };
}

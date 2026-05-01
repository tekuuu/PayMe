'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    IconLock,
    IconPlus,
    IconSearch,
    IconShieldCheck,
    IconTrash,
    IconLink
} from '@tabler/icons-react';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { CardOverview } from '@/components/smart-wallet/card-overview';
import { CreateCardEmptyState } from '@/components/smart-wallet/create-card-empty-state';
import { Hex } from 'viem';
import { PrivateCardSearchResult, usePrivateCard } from '@/hooks/use-private-card';
import { toast } from 'sonner';

function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function MyCardPage() {
    const { me } = useMe();
    const {
        cards,
        selectedCardAddress,
        selectedCard,
        setSelectedCardAddress,
        hasCard,
        isLoading,
        isCreating,
        createCard,
        attachCardByAddress,
        searchCardsByOwner,
        removeCard,
    } = usePrivateCard(me || null);
    const [manualCardAddress, setManualCardAddress] = useState('');
    const [searchOwnerAddress, setSearchOwnerAddress] = useState('');
    const [searchResults, setSearchResults] = useState<PrivateCardSearchResult[]>([]);
    const [isAttaching, setIsAttaching] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isImportingResult, setIsImportingResult] = useState<string | null>(null);

    useEffect(() => {
        if (!me?.account) {
            return;
        }

        setSearchOwnerAddress(me.account);
        setSearchResults([]);
        setManualCardAddress('');
    }, [me?.account]);

    const selectedCardLabel = useMemo(() => {
        if (!selectedCard) {
            return null;
        }

        return selectedCard.origin === 'owned' ? 'Owned' : 'Imported';
    }, [selectedCard]);

    const handleAttachByAddress = async () => {
        if (!manualCardAddress.trim()) {
            toast.error('Enter a card address to import.');
            return;
        }

        setIsAttaching(true);
        try {
            await attachCardByAddress(manualCardAddress.trim());
            setManualCardAddress('');
            setSearchResults((current) =>
                current.map((result) =>
                    result.address.toLowerCase() === manualCardAddress.trim().toLowerCase()
                        ? { ...result, isLinked: true, isHidden: false }
                        : result
                )
            );
        } catch (error: any) {
            toast.error(error?.message || 'Unable to attach that card.');
        } finally {
            setIsAttaching(false);
        }
    };

    const handleSearchByOwner = async () => {
        if (!searchOwnerAddress.trim()) {
            toast.error('Enter an owner address to search.');
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchCardsByOwner(searchOwnerAddress.trim());
            setSearchResults(results);

            if (results.length === 0) {
                toast.info('No cards were found for that owner address.');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Unable to search that owner.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleImportSearchResult = async (cardAddress: Hex) => {
        setIsImportingResult(cardAddress);
        try {
            await attachCardByAddress(cardAddress);
            setSearchResults((current) =>
                current.map((result) =>
                    result.address.toLowerCase() === cardAddress.toLowerCase()
                        ? { ...result, isLinked: true, isHidden: false }
                        : result
                )
            );
        } catch (error: any) {
            toast.error(error?.message || 'Unable to import that card.');
        } finally {
            setIsImportingResult(null);
        }
    };

    const handleRemoveSelectedCard = () => {
        if (!selectedCardAddress) {
            toast.error('Select a card first.');
            return;
        }

        removeCard(selectedCardAddress);
        setSearchResults((current) =>
            current.map((result) =>
                result.address.toLowerCase() === selectedCardAddress.toLowerCase()
                    ? { ...result, isHidden: true, isLinked: false }
                    : result
            )
        );
    };

    if (!me) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-6'>
                <div className='p-6 bg-primary/5 rounded-full animate-pulse'>
                    <IconLock size={64} className='text-primary/40' />
                </div>
                <div className='space-y-2 max-w-sm'>
                    <h2 className='text-2xl font-bold tracking-tight text-foreground'>
                        Secure Vault Locked
                    </h2>
                    <p className='text-muted-foreground text-sm'>
                        Access to your private virtual card requires a Passkey-secured Smart Wallet.
                    </p>
                </div>
                <SmartWalletOnboarding variant='default' className='w-full max-w-[200px]' />
            </div>
        );
    }

    return (
        <div className='flex-1 space-y-6 p-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                    My Card
                </h2>
                <div className='flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500'>
                    <IconShieldCheck size={12} /> Smart Wallet Linked
                </div>
            </div>

            {isLoading ? (
                <div className='flex items-center justify-center p-12'>
                    <span className='animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent' />
                </div>
            ) : (
                <div className='mx-auto max-w-3xl space-y-4'>
                    {hasCard ? (
                        <>
                            {/* Card selector */}
                            <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4'>
                                <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                                    <div className='w-full space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='card-select' className='text-xs font-medium text-muted-foreground'>
                                                Selected Card
                                            </label>
                                            {selectedCardLabel ? (
                                                <Badge variant={selectedCardLabel === 'Owned' ? 'default' : 'secondary'}>
                                                    {selectedCardLabel}
                                                </Badge>
                                            ) : null}
                                        </div>
                                        <select
                                            id='card-select'
                                            className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary/30'
                                            value={selectedCardAddress || ''}
                                            onChange={(e) => setSelectedCardAddress(e.target.value as Hex)}
                                        >
                                            {cards.map((card, index) => (
                                                <option key={card.address} value={card.address}>
                                                    {`${card.origin === 'owned' ? 'Owned' : 'Imported'} ${index + 1} • ${shortenAddress(card.address)}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className='flex flex-col gap-2 sm:flex-row'>
                                        <Button
                                            variant='outline'
                                            onClick={() => createCard()}
                                            disabled={isCreating}
                                            className='gap-2 rounded-full border border-border/60'
                                        >
                                            <IconPlus size={16} />
                                            {isCreating ? 'Creating...' : 'Create Another'}
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            onClick={handleRemoveSelectedCard}
                                            disabled={!selectedCardAddress}
                                            className='gap-2 rounded-full text-muted-foreground hover:text-foreground'
                                        >
                                            <IconTrash size={16} />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Card overview */}
                            <CardOverview cardAddress={selectedCardAddress} />
                        </>
                    ) : (
                        <CreateCardEmptyState onCreate={createCard} isCreating={isCreating} />
                    )}

                    {/* Import / Search section */}
                    <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground mb-4'>
                            Attach or Import
                        </p>
                        <div className='grid gap-4 xl:grid-cols-2'>
                            {/* Attach by address */}
                            <div className='rounded-xl border border-border/40 bg-background/30 p-4 space-y-3'>
                                <h3 className='text-sm font-semibold'>Attach by card address</h3>
                                <div className='flex flex-col gap-2 sm:flex-row'>
                                    <Input
                                        value={manualCardAddress}
                                        onChange={(e) => setManualCardAddress(e.target.value)}
                                        placeholder='0x...'
                                        className='font-mono rounded-lg'
                                    />
                                    <Button
                                        variant='outline'
                                        onClick={handleAttachByAddress}
                                        disabled={isAttaching}
                                        className='gap-2 rounded-full border border-border/60'
                                    >
                                        <IconLink size={16} />
                                        {isAttaching ? 'Attaching...' : 'Attach'}
                                    </Button>
                                </div>
                            </div>

                            {/* Search by owner */}
                            <div className='rounded-xl border border-border/40 bg-background/30 p-4 space-y-3'>
                                <h3 className='text-sm font-semibold'>Search by owner address</h3>
                                <div className='flex flex-col gap-2 sm:flex-row'>
                                    <Input
                                        value={searchOwnerAddress}
                                        onChange={(e) => setSearchOwnerAddress(e.target.value)}
                                        placeholder='Owner wallet address'
                                        className='font-mono rounded-lg'
                                    />
                                    <Button
                                        variant='outline'
                                        onClick={handleSearchByOwner}
                                        disabled={isSearching}
                                        className='gap-2 rounded-full border border-border/60'
                                    >
                                        <IconSearch size={16} />
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Search results */}
                        <div className='mt-6 space-y-3'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-semibold'>Search results</h3>
                                <Badge variant='outline'>{searchResults.length} found</Badge>
                            </div>

                            {searchResults.length > 0 ? (
                                <div className='space-y-2'>
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.address}
                                            className='flex flex-col gap-3 rounded-xl border border-border/40 bg-background/30 p-4 lg:flex-row lg:items-center lg:justify-between'
                                        >
                                            <div className='space-y-2'>
                                                <div className='flex flex-wrap items-center gap-2'>
                                                    <Badge variant={result.isOwned ? 'default' : 'secondary'}>
                                                        {result.isOwned ? 'Owned' : 'External'}
                                                    </Badge>
                                                    {result.isLinked ? <Badge variant='outline'>Linked</Badge> : null}
                                                    {result.isHidden ? <Badge variant='outline'>Hidden locally</Badge> : null}
                                                </div>
                                                <div>
                                                    <p className='font-mono text-sm'>{result.address}</p>
                                                    <p className='font-mono text-xs text-muted-foreground'>
                                                        Owner: {shortenAddress(result.owner)}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant='outline'
                                                className='gap-2 rounded-full border border-border/60'
                                                onClick={() => handleImportSearchResult(result.address)}
                                                disabled={isImportingResult === result.address}
                                            >
                                                <IconLink size={16} />
                                                {isImportingResult === result.address ? 'Importing...' : 'Import'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='rounded-xl border border-dashed border-border/40 bg-muted/20 p-6 text-sm text-muted-foreground text-center'>
                                    Run a search to list cards, or attach one directly.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

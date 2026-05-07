'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    IconLock,
    IconPlus,
    IconSearch,
    IconTrash,
    IconLink
} from '@tabler/icons-react';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { CardOverview } from '@/components/smart-wallet/card-overview';
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
    const [activeImportMode, setActiveImportMode] = useState<'attach' | 'search' | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (!me?.account) {
            return;
        }

        setSearchOwnerAddress(me.account);
        setSearchResults([]);
        setManualCardAddress('');
    }, [me?.account]);

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

        setShowDeleteDialog(true);
    };

    const confirmRemoveCard = () => {
        if (!selectedCardAddress) return;

        removeCard(selectedCardAddress);
        setSearchResults((current) =>
            current.map((result) =>
                result.address.toLowerCase() === selectedCardAddress.toLowerCase()
                    ? { ...result, isHidden: true, isLinked: false }
                    : result
            )
        );
        setShowDeleteDialog(false);
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
        <div className='flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6'>
            {/* Header */}
            <div className='space-y-3'>
                <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>
                    My Card
                </h2>
                <div className='h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent' />
            </div>

            {isLoading ? (
                <div className='flex items-center justify-center p-12'>
                    <span className='animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent' />
                </div>
            ) : (
                <div className='mx-auto w-full max-w-3xl space-y-3 sm:space-y-4'>
                    {hasCard ? (
                        <>
                            {/* Card selector + action toolbar */}
                            <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur'>
                                <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3'>
                                    <label htmlFor='card-select' className='text-xs font-medium text-muted-foreground shrink-0 hidden sm:block'>
                                        Selected Card
                                    </label>

                                    <select
                                        id='card-select'
                                        className='h-8 sm:h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring focus:ring-primary/30'
                                        value={selectedCardAddress || ''}
                                        onChange={(e) => setSelectedCardAddress(e.target.value as Hex)}
                                    >
                                        {cards.map((card, index) => (
                                            <option key={card.address} value={card.address}>
                                                {`${card.origin === 'owned' ? 'Owned' : 'Imported'} ${index + 1} — ${shortenAddress(card.address)}`}
                                            </option>
                                        ))}
                                    </select>

                                    <div className='flex items-center gap-1 sm:gap-1.5 shrink-0'>
                                        <Button
                                            size='sm'
                                            onClick={() => createCard()}
                                            disabled={isCreating}
                                            className='gap-1.5 rounded-lg text-xs sm:text-sm'
                                        >
                                            <IconPlus size={14} />
                                            <span className='hidden sm:inline'>{isCreating ? 'Creating…' : 'New Card'}</span>
                                            <span className='sm:hidden'>New</span>
                                        </Button>

                                        <div className='h-5 w-px bg-border/60 hidden sm:block' />

                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setActiveImportMode(activeImportMode === 'attach' ? null : 'attach')}
                                            className={`h-7 sm:h-8 w-7 sm:w-8 rounded-lg p-0 ${activeImportMode === 'attach' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                                            title='Attach by address'
                                        >
                                            <IconLink size={14} />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setActiveImportMode(activeImportMode === 'search' ? null : 'search')}
                                            className={`h-7 sm:h-8 w-7 sm:w-8 rounded-lg p-0 ${activeImportMode === 'search' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                                            title='Search by owner'
                                        >
                                            <IconSearch size={14} />
                                        </Button>

                                        <div className='h-5 w-px bg-border/60 hidden sm:block' />

                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={handleRemoveSelectedCard}
                                            disabled={!selectedCardAddress}
                                            className='h-7 sm:h-8 w-7 sm:w-8 rounded-lg p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                                            title='Remove selected card'
                                        >
                                            <IconTrash size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Import panel - hasCard */}
                            {activeImportMode && (
                                <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden animate-in slide-in-from-top-2 duration-300'>
                                    {activeImportMode === 'attach' && (
                                        <div className='p-3 sm:p-4'>
                                            <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2'>
                                                Attach by card address
                                            </p>
                                            <div className='flex flex-col gap-2 sm:flex-row'>
                                                <Input
                                                    value={manualCardAddress}
                                                    onChange={(e) => setManualCardAddress(e.target.value)}
                                                    placeholder='0x…'
                                                    className='font-mono h-9 rounded-lg'
                                                />
                                                <Button
                                                    size='sm'
                                                    onClick={handleAttachByAddress}
                                                    disabled={isAttaching}
                                                    className='gap-1.5 rounded-lg shrink-0 sm:w-auto w-full'
                                                >
                                                    <IconLink size={14} />
                                                    {isAttaching ? 'Attaching…' : 'Attach'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {activeImportMode === 'search' && (
                                        <div className='space-y-3 p-3 sm:p-4'>
                                            <div>
                                                <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2'>
                                                    Search by owner address
                                                </p>
                                                <div className='flex flex-col gap-2 sm:flex-row'>
                                                    <Input
                                                        value={searchOwnerAddress}
                                                        onChange={(e) => setSearchOwnerAddress(e.target.value)}
                                                        placeholder='Owner wallet address'
                                                        className='font-mono h-9 rounded-lg'
                                                    />
                                                    <Button
                                                        size='sm'
                                                        onClick={handleSearchByOwner}
                                                        disabled={isSearching}
                                                        className='gap-1.5 rounded-lg shrink-0 sm:w-auto w-full'
                                                    >
                                                        <IconSearch size={14} />
                                                        {isSearching ? 'Searching…' : 'Search'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {searchResults.length > 0 && (
                                                <div className='space-y-2'>
                                                    {searchResults.map((result) => (
                                                        <div
                                                            key={result.address}
                                                            className='flex flex-col gap-3 rounded-lg border border-border/40 bg-background/40 p-3'
                                                        >
                                                            <div className='min-w-0 space-y-1'>
                                                                <div className='flex flex-wrap items-center gap-1.5'>
                                                                    <Badge variant={result.isOwned ? 'default' : 'secondary'} className='text-[10px]'>
                                                                        {result.isOwned ? 'Owned' : 'External'}
                                                                    </Badge>
                                                                    {result.isLinked ? <Badge variant='outline' className='text-[10px]'>Linked</Badge> : null}
                                                                    {result.isHidden ? <Badge variant='outline' className='text-[10px]'>Hidden</Badge> : null}
                                                                </div>
                                                                <p className='font-mono text-xs break-all'>{result.address}</p>
                                                                <p className='font-mono text-[11px] text-muted-foreground'>
                                                                    Owner: {shortenAddress(result.owner)}
                                                                </p>
                                                            </div>

                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                className='gap-1.5 rounded-lg w-full sm:w-auto'
                                                                onClick={() => handleImportSearchResult(result.address)}
                                                                disabled={isImportingResult === result.address}
                                                            >
                                                                <IconLink size={14} />
                                                                {isImportingResult === result.address ? 'Importing…' : 'Import'}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.length === 0 && (
                                                <div className='rounded-lg border border-dashed border-border/40 bg-muted/20 p-6 sm:p-8 text-sm text-muted-foreground text-center'>
                                                    No cards found for this owner.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Card overview */}
                            <CardOverview cardAddress={selectedCardAddress} />

                            {/* Delete confirmation dialog */}
                            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Remove this card?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will unlink the card from your session. The card contract remains on-chain and can be re-imported later.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={confirmRemoveCard} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                                            Remove
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    ) : (
                        <>
                            {/* Empty state toolbar */}
                            <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur'>
                                <div className='flex flex-col gap-2 sm:gap-3 p-3 sm:p-4'>
                                    <p className='text-xs font-medium text-muted-foreground'>No active card</p>
                                    <div className='flex items-center gap-2 sm:gap-3'>
                                        <div className='h-8 sm:h-9 min-w-0 flex-1 rounded-lg border border-border/40 bg-muted/30 flex items-center px-3'>
                                            <span className='text-xs sm:text-sm text-muted-foreground/60 truncate'>Create or import a card to begin</span>
                                        </div>

                                        <Button
                                            size='sm'
                                            onClick={() => createCard()}
                                            disabled={isCreating}
                                            className='gap-1.5 rounded-lg text-xs sm:text-sm shrink-0'
                                        >
                                            <IconPlus size={14} />
                                            <span className='hidden sm:inline'>{isCreating ? 'Creating…' : 'New Card'}</span>
                                            <span className='sm:hidden'>New</span>
                                        </Button>

                                        <div className='h-5 w-px bg-border/60 hidden sm:block' />

                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setActiveImportMode(activeImportMode === 'attach' ? null : 'attach')}
                                            className={`h-7 sm:h-8 w-7 sm:w-8 rounded-lg p-0 shrink-0 ${activeImportMode === 'attach' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                                            title='Attach by address'
                                        >
                                            <IconLink size={14} />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setActiveImportMode(activeImportMode === 'search' ? null : 'search')}
                                            className={`h-7 sm:h-8 w-7 sm:w-8 rounded-lg p-0 shrink-0 ${activeImportMode === 'search' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                                            title='Search by owner'
                                        >
                                            <IconSearch size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Import panel - empty state */}
                            {activeImportMode && (
                                <div className='rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden animate-in slide-in-from-top-2 duration-300'>
                                    {activeImportMode === 'attach' && (
                                        <div className='p-3 sm:p-4'>
                                            <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2'>
                                                Attach by card address
                                            </p>
                                            <div className='flex flex-col gap-2 sm:flex-row'>
                                                <Input
                                                    value={manualCardAddress}
                                                    onChange={(e) => setManualCardAddress(e.target.value)}
                                                    placeholder='0x…'
                                                    className='font-mono h-9 rounded-lg'
                                                />
                                                <Button
                                                    size='sm'
                                                    onClick={handleAttachByAddress}
                                                    disabled={isAttaching}
                                                    className='gap-1.5 rounded-lg shrink-0 sm:w-auto w-full'
                                                >
                                                    <IconLink size={14} />
                                                    {isAttaching ? 'Attaching…' : 'Attach'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {activeImportMode === 'search' && (
                                        <div className='space-y-3 p-3 sm:p-4'>
                                            <div>
                                                <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2'>
                                                    Search by owner address
                                                </p>
                                                <div className='flex flex-col gap-2 sm:flex-row'>
                                                    <Input
                                                        value={searchOwnerAddress}
                                                        onChange={(e) => setSearchOwnerAddress(e.target.value)}
                                                        placeholder='Owner wallet address'
                                                        className='font-mono h-9 rounded-lg'
                                                    />
                                                    <Button
                                                        size='sm'
                                                        onClick={handleSearchByOwner}
                                                        disabled={isSearching}
                                                        className='gap-1.5 rounded-lg shrink-0 sm:w-auto w-full'
                                                    >
                                                        <IconSearch size={14} />
                                                        {isSearching ? 'Searching…' : 'Search'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {searchResults.length > 0 && (
                                                <div className='space-y-2'>
                                                    {searchResults.map((result) => (
                                                        <div
                                                            key={result.address}
                                                            className='flex flex-col gap-3 rounded-lg border border-border/40 bg-background/40 p-3'
                                                        >
                                                            <div className='min-w-0 space-y-1'>
                                                                <div className='flex flex-wrap items-center gap-1.5'>
                                                                    <Badge variant={result.isOwned ? 'default' : 'secondary'} className='text-[10px]'>
                                                                        {result.isOwned ? 'Owned' : 'External'}
                                                                    </Badge>
                                                                    {result.isLinked ? <Badge variant='outline' className='text-[10px]'>Linked</Badge> : null}
                                                                    {result.isHidden ? <Badge variant='outline' className='text-[10px]'>Hidden</Badge> : null}
                                                                </div>
                                                                <p className='font-mono text-xs break-all'>{result.address}</p>
                                                                <p className='font-mono text-[11px] text-muted-foreground'>
                                                                    Owner: {shortenAddress(result.owner)}
                                                                </p>
                                                            </div>

                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                className='gap-1.5 rounded-lg w-full sm:w-auto'
                                                                onClick={() => handleImportSearchResult(result.address)}
                                                                disabled={isImportingResult === result.address}
                                                            >
                                                                <IconLink size={14} />
                                                                {isImportingResult === result.address ? 'Importing…' : 'Import'}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.length === 0 && (
                                                <div className='rounded-lg border border-dashed border-border/40 bg-muted/20 p-6 sm:p-8 text-sm text-muted-foreground text-center'>
                                                    No cards found for this owner.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                </div>
            )}
        </div>
    );
}

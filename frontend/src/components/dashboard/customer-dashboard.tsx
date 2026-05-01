'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendTokenCard } from '@/components/smart-wallet/send-token-card';
import { ReceiveTokenCard } from '@/components/smart-wallet/receive-token-card';
import { ShieldCard } from '@/components/smart-wallet/shield-card';
import { useConfidentialTokenBalance } from '@/hooks/use-confidential-token-balance';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { useMe } from '@/providers/auth-provider';
import {
  IconLock,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
  IconCheck,
} from '@tabler/icons-react';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Hex } from 'viem';

function formatMicros(value?: bigint) {
  if (value === undefined) return '-';
  return (Number(value) / 1_000_000).toFixed(2);
}

function formatBalanceDisplay(val: string): string {
  if (!val || val === '0.00') return '0.00';
  const num = parseFloat(val);
  if (isNaN(num) || num === 0) return '0.00';
  if (num < 0.000001) return '< 0.000001';
  const fixed = num.toFixed(6);
  if (num < 0.001) return fixed;
  return parseFloat(fixed).toString();
}

type TokenRow = {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  icon: string;
  encrypted?: boolean;
};

const NETWORKS = [
  {
    id: 'sepolia',
    name: 'Sepolia',
    chainId: 11155111,
    icon: '/assets/icons/networks/sepolia-network.svg',
    status: 'Testnet',
    supported: true,
  },
  {
    id: 'mainnet',
    name: 'Ethereum',
    chainId: 1,
    icon: '/assets/icons/networks/eth-mainnet.svg',
    status: 'Coming soon',
    supported: false,
  },
];

function NetworkSelector() {
  const currentNetwork = NETWORKS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/40'>
          <Image
            src={currentNetwork.icon}
            alt={currentNetwork.name}
            width={16}
            height={16}
            className='rounded-full'
          />
          <span className='text-foreground'>{currentNetwork.name}</span>
          <IconChevronDown size={14} className='text-muted-foreground' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.id}
            disabled={!network.supported}
            className='flex items-center gap-2'
          >
            <Image
              src={network.icon}
              alt={network.name}
              width={16}
              height={16}
              className='rounded-full'
            />
            <span className='flex-1'>{network.name}</span>
            {network.id === currentNetwork.id ? (
              <IconCheck size={14} className='text-primary' />
            ) : (
              <span className='text-xs text-muted-foreground'>
                {network.status}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CustomerDashboardPage() {
  const { me } = useMe();
  const balances = useTokenBalances(me?.account);
  const {
    decryptedValue,
    decryptWithAclSync,
    canDecrypt,
    isDecrypting,
    handleHex,
    decryptError,
    serverSignerError,
    refetch,
    isFetching,
    usingServerSigner,
  } = useConfidentialTokenBalance(me?.account);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!me) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-6'>
        <div className='p-6 bg-primary/5 rounded-full animate-pulse'>
          <IconLock size={64} className='text-primary/40' />
        </div>
        <div className='space-y-2 max-w-sm'>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            Dashboard Locked
          </h2>
          <p className='text-muted-foreground text-sm'>
            Access to your dashboard requires a Passkey-secured Smart Wallet.
          </p>
        </div>
        <SmartWalletOnboarding variant='default' className='w-full max-w-[200px]' />
      </div>
    );
  }

  const tokens: TokenRow[] = [
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      balance: formatBalanceDisplay(balances.eth.formatted),
      icon: '/assets/icons/tokens/eth-svgrepo-com.svg',
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      balance: formatBalanceDisplay(balances.usdc.formatted),
      icon: '/assets/icons/tokens/usdc.svg',
    },
    {
      id: 'weth',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      balance: formatBalanceDisplay(balances.weth.formatted),
      icon: '/assets/icons/tokens/weth.svg',
    },
    {
      id: 'cusdc',
      name: 'Confidential USDC',
      symbol: 'cUSDC',
      balance: decryptedValue !== undefined ? `${formatMicros(decryptedValue)}` : 'Encrypted',
      icon: '/assets/icons/tokens/usdc.svg',
      encrypted: true,
    },
  ];

  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
          Dashboard
        </h2>
        <div className='flex items-center gap-2'>
          <NetworkSelector />
          <Button
            variant='outline'
            className='rounded-full border border-border/60 bg-background/50 px-4 py-2 text-sm'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Asset list */}
      <div className='mx-auto max-w-3xl space-y-2'>
        {tokens.map((token) => {
          const isExpanded = expandedRows.has(token.id);
          const isEncryptedToken = token.id === 'cusdc';
          return (
            <div
              key={token.id}
              className='rounded-xl border border-border/60 bg-card/50 backdrop-blur overflow-hidden'
            >
              <div className='flex items-center justify-between p-4'>
                <button
                  onClick={() => toggleRow(token.id)}
                  className='flex flex-1 items-center gap-3 text-left transition-colors hover:bg-muted/20 rounded-lg -ml-2 pl-2 pr-2 py-1'
                >
                  <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/30'>
                    <Image
                      src={token.icon}
                      alt={token.symbol}
                      width={24}
                      height={24}
                      className='rounded-full'
                    />
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>{token.name}</p>
                    <p className='text-xs text-muted-foreground'>{token.symbol}</p>
                  </div>
                  {token.encrypted && (
                    <span className='ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                      FHE
                    </span>
                  )}
                </button>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-semibold tabular-nums text-foreground'>
                    {token.balance}
                  </span>
                  {isEncryptedToken && (
                    <button
                      onClick={() => decryptWithAclSync()}
                      disabled={!canDecrypt || isDecrypting || !handleHex}
                      className='rounded-lg p-1.5 transition-colors hover:bg-muted/40 disabled:opacity-30 text-muted-foreground hover:text-foreground'
                      title={isDecrypting ? 'Decrypting...' : 'Decrypt balance'}
                    >
                      {isDecrypting ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => toggleRow(token.id)}
                    className='rounded-lg p-1 transition-colors hover:bg-muted/40'
                  >
                    {isExpanded ? (
                      <IconChevronUp size={16} className='text-muted-foreground' />
                    ) : (
                      <IconChevronDown size={16} className='text-muted-foreground' />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className='border-t border-border/40 bg-background/30 p-4'>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-lg border border-border/40 bg-card/50 p-3'>
                      <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                        Type
                      </p>
                      <p className='mt-1 text-sm font-medium'>
                        {token.encrypted ? 'Encrypted (FHE)' : 'Standard'}
                      </p>
                    </div>
                    <div className='rounded-lg border border-border/40 bg-card/50 p-3'>
                      <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                        Balance
                      </p>
                      <p className='mt-1 text-sm font-medium tabular-nums'>
                        {token.balance} {token.symbol}
                      </p>
                    </div>
                    <div className='rounded-lg border border-border/40 bg-card/50 p-3'>
                      <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                        Status
                      </p>
                      <p className='mt-1 text-sm font-medium'>
                        {token.encrypted && !handleHex
                          ? 'Not funded'
                          : token.encrypted
                            ? 'Active'
                            : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(decryptError || serverSignerError) && (
        <p className='text-sm text-rose-500 text-center'>
          {decryptError || serverSignerError}
        </p>
      )}

      {/* Actions */}
      <div className='mx-auto max-w-3xl rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6'>
        <p className='text-xs uppercase tracking-wide text-muted-foreground mb-4'>
          Actions
        </p>
        <Tabs defaultValue='send' className='space-y-4'>
          <TabsList className='inline-flex h-10 w-auto items-center justify-center rounded-full bg-muted/40 p-1'>
            <TabsTrigger
              value='send'
              className='rounded-full px-4 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
            >
              Send
            </TabsTrigger>
            <TabsTrigger
              value='receive'
              className='rounded-full px-4 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
            >
              Receive
            </TabsTrigger>
            <TabsTrigger
              value='shield'
              className='rounded-full px-4 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
            >
              Shield
            </TabsTrigger>
          </TabsList>
          <TabsContent value='send' className='mt-0'>
            <SendTokenCard me={me} />
          </TabsContent>
          <TabsContent value='receive' className='mt-0'>
            <ReceiveTokenCard address={me.account} />
          </TabsContent>
          <TabsContent value='shield' className='mt-0'>
            <ShieldCard me={me} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

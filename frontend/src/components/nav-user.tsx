'use client';

import {
  IconCircleCheck,
  IconBell,
  IconCopy,
  IconCreditCard,
  IconLogout,
  IconSparkles
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useMe } from '@/providers/auth-provider';
import { useTokenBalances } from '@/hooks/use-token-balances';
import { Power } from 'lucide-react';

export function NavUser({
  wallet
}: {
  wallet?: {
    address: string;
    network: string;
    isConnected: boolean;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { me, disconnect } = useMe();
  const [copied, setCopied] = useState(false);
  const balances = useTokenBalances(me?.account);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const truncatedAddress = me?.account
    ? `${me.account.slice(0, 6)}...${me.account.slice(-4)}`
    : 'New Wallet';

  const avatarUrl = me?.account
    ? `https://api.dicebear.com/9.x/identicon/svg?seed=${me.account}`
    : `https://api.dicebear.com/9.x/identicon/svg?seed=placeholder`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full focus-visible:ring-primary/20 p-0'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={avatarUrl} alt="User Avatar" />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
                    {me?.account ? me.account.slice(2, 4).toUpperCase() : '??'}
                  </AvatarFallback>
                </Avatar>
                {me?.account && (
                  <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500 shadow-sm' />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-64 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={10}
            >
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm leading-none font-medium'>
                      {truncatedAddress}
                    </p>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0 hover:bg-muted'
                      onClick={() => me?.account && copyToClipboard(me.account)}
                    >
                      {copied ? (
                        <IconCircleCheck className='h-3 w-3 text-green-500' />
                      ) : (
                        <IconCopy className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                  <p className='text-muted-foreground text-xs leading-none uppercase tracking-wider'>
                    Smart Wallet
                  </p>
                  <div className='flex flex-col space-y-1 mt-2 pt-2 border-t border-border'>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>ETH</span>
                      <span className='font-medium'>{balances.eth.formatted}</span>
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>USDC</span>
                      <span className='font-medium'>{balances.usdc.formatted}</span>
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>WETH</span>
                      <span className='font-medium'>{balances.weth.formatted}</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/dashboard/activity')}>
                  <IconCircleCheck className='mr-3 h-4 w-4' />
                  Activity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/my-card')}>
                  <IconCreditCard className='mr-3 h-4 w-4' />
                  My Card
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <IconSparkles className='mr-3 h-4 w-4' />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => disconnect()}
              >
                <IconLogout className='mr-3 h-4 w-4' />
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{truncatedAddress}</span>
            <span className='truncate text-xs text-muted-foreground uppercase tracking-wider'>Smart Wallet</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

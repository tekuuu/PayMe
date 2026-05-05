'use client';
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
import { useRouter } from 'next/navigation';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { CreditCard, Settings, History, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTokenBalances } from '@/hooks/use-token-balances';

export function UserNav() {
  const router = useRouter();
  const mounted = useIsMounted();
  const { me, disconnect } = useMe();
  const [copied, setCopied] = useState(false);
  const balances = useTokenBalances(me?.account);

  if (!mounted) return null;

  if (!me) {
    return <SmartWalletOnboarding />;
  }

  const truncatedAddress = me.account
    ? `${me.account.slice(0, 6)}...${me.account.slice(-4)}`
    : 'New Wallet';

  const avatarUrl = me.account
    ? `https://api.dicebear.com/9.x/identicon/svg?seed=${me.account}`
    : `https://api.dicebear.com/9.x/identicon/svg?seed=placeholder`;

  const copyAddress = () => {
    if (me?.account) {
      navigator.clipboard.writeText(me.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative flex h-9 items-center gap-2 rounded-full border border-border/40 bg-card/50 px-2 hover:bg-accent'>
          <div className='h-7 w-7 rounded-full overflow-hidden shrink-0 ring-2 ring-indigo-500/50'>
            <img src={avatarUrl} alt='Avatar' className='h-full w-full object-cover' />
          </div>
          <span className='text-xs font-medium max-w-32 truncate'>{truncatedAddress}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-64 rounded-lg'
        align='end'
        sideOffset={8}
        forceMount
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
                onClick={copyAddress}
              >
                {copied ? (
                  <Check className='h-3 w-3 text-emerald-500' />
                ) : (
                  <Copy className='h-3 w-3' />
                )}
              </Button>
            </div>
            <div className='flex flex-col space-y-1 mt-2 pt-2 border-t border-border'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>ETH (total)</span>
                <span className='font-medium'>{balances.eth.formatted}</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Wallet ETH</span>
                <span className='font-medium'>{balances.eth.walletFormatted}</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>AA Deposit</span>
                <span className='font-medium'>{balances.eth.depositFormatted}</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>USDC</span>
                <span className='font-medium'>{balances.usdc.formatted}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/activity')}>
            <History className='mr-2 h-4 w-4 text-muted-foreground' />
            Activity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/my-card')}>
            <CreditCard className='mr-2 h-4 w-4 text-muted-foreground' />
            My Card
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <Settings className='mr-2 h-4 w-4 text-muted-foreground' />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => disconnect()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

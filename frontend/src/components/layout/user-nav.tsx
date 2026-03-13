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
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useRouter } from 'next/navigation';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useMe } from '@/providers/auth-provider';
import SmartWalletOnboarding from '@/components/auth/smart-wallet-onboarding';
import { Power } from 'lucide-react';

export function UserNav() {
  const router = useRouter();
  const mounted = useIsMounted();
  const { me, disconnect } = useMe();

  if (!mounted) return null;

  if (!me) {
    return <SmartWalletOnboarding />;
  }

  const truncatedAddress = me.account
    ? `${me.account.slice(0, 6)}...${me.account.slice(-4)}`
    : 'New Wallet';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full focus-visible:ring-primary/20'>
          <UserAvatarProfile wallet={{ address: me.account || '', isConnected: true }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {truncatedAddress}
            </p>
            <p className='text-muted-foreground text-xs leading-none uppercase tracking-wider'>
              Smart Wallet
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/activity')}>
            Activity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/my-card')}>My Card</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => disconnect()}
        >
          <Power className="mr-2 h-4 w-4" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import {
  IconCircleCheck,
  IconBell,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconSparkles
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export function NavUser({
  wallet
}: {
  wallet: {
    address: string;
    network: string;
    isConnected: boolean;
  };
}) {
  const { isMobile } = useSidebar();

  const truncatedAddress = wallet?.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : 'Not Connected';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='relative flex h-11 w-11 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold'>
                W
                {wallet?.isConnected && (
                  <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500' />
                )}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{truncatedAddress}</span>
                <span className='truncate text-xs text-muted-foreground'>{wallet?.network}</span>
              </div>
              <IconChevronsDown className='ml-auto size-6' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-3 px-1 py-1.5 text-left text-sm'>
                <div className='relative flex h-11 w-11 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold'>
                  W
                  {wallet?.isConnected && (
                    <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500' />
                  )}
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{truncatedAddress}</span>
                  <span className='truncate text-xs text-muted-foreground'>{wallet?.network}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconCreditCard className='mr-3 h-6 w-6' />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconBell className='mr-3 h-6 w-6' />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log('Disconnect clicked')}>
              <IconLogout className='mr-3 h-6 w-6' />
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

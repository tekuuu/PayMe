'use client';
/** @jsxRuntime automatic */
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/config/nav-config';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconUserCircle
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Icons } from '../icons';
import { useAccount, useDisconnect, useChainId } from 'wagmi';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const mounted = useIsMounted();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const network = chainId === 11155111 ? 'Sepolia' : (chainId ? `Chain ${chainId}` : 'Unknown');
  const wallet = isConnected ? { address: address as string, network, isConnected } : null;
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const router = useRouter();
  const filteredItems = navItems;

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  if (!mounted) {
    return (
      <Sidebar collapsible='icon'>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible='icon' className='w-64'>
      <SidebarContent className='overflow-visible w-full'>
        <SidebarGroup>

          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Simple Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-sidebar-accent"
              >
                <UserAvatarProfile
                  className="h-8 w-8 rounded-lg"
                  showInfo
                  wallet={wallet}
                />
                {isOpen && <IconChevronsDown className="ml-auto size-5" />}
              </button>
              {showSidebarMenu && (
                <div className="absolute right-0 mt-2 min-w-[200px] rounded-md bg-popover shadow-lg ring-1 ring-border">
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Not Connected'}</p>
                    <p className="text-xs text-muted-foreground truncate">{wallet?.network || 'Disconnected'}</p>
                  </div>
                  <div className="border-t border-border" />
                  <button
                    onClick={() => {
                      disconnect();
                      setShowSidebarMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-destructive hover:bg-destructive/10"
                  >
                    <IconLogout className="mr-2 h-4 w-4" />
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

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
import { NavUser } from '@/components/nav-user';
import { merchantNavItems as navItems } from '@/config/nav-config';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { Icons } from '../icons';
import Image from 'next/image';

export default function MerchantSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const mounted = useIsMounted();
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
        <div className='flex h-16 items-center justify-center px-4'>
          <Image
            src='/assets/payme.svg'
            alt='PayMe Logo'
            width={140}
            height={35}
            className='hidden group-data-[collapsible=icon]:block'
          />
          <Image
            src='/assets/payme.svg'
            alt='PayMe Logo'
            width={32}
            height={32}
            className='block group-data-[collapsible=icon]:hidden'
          />
        </div>
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
                        onClick={() => router.push(item.url)}
                        tooltip={item.title}
                        isActive={pathname === item.url || pathname.startsWith(item.url)}
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
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

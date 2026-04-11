import MerchantSidebar from '@/components/layout/merchant-sidebar';
import Header from '@/components/layout/header';
import DashboardGuard from '@/components/auth/dashboard-guard';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'PayMe Merchant Portal',
  description: 'Merchant dashboard for private FHE payments',
  robots: {
    index: false,
    follow: false
  }
};

export default async function MerchantLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MerchantSidebar />
      <SidebarInset>
        <Header />
        <DashboardGuard requiredAccountType='business'>{children}</DashboardGuard>
      </SidebarInset>
    </SidebarProvider>
  );
}

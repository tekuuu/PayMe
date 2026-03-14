'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to My Card page as the main landing page
    router.replace('/dashboard/my-card');
  }, [router]);

  return null; // Don't render anything while redirecting
}

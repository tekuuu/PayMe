import PageContainer from '@/components/layout/page-container';
import React from 'react';

export default function DashboardPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex flex-col space-y-4'>
          <h2 className='text-3xl font-bold tracking-tight'>Overview</h2>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Placeholder for future dashboard cards */}
            <div className='rounded-xl border bg-card text-card-foreground shadow-sm p-6'>
              <h3 className='text-sm font-medium'>Total Payroll</h3>
              <div className='text-2xl font-bold'>$0.00</div>
            </div>
            <div className='rounded-xl border bg-card text-card-foreground shadow-sm p-6'>
              <h3 className='text-sm font-medium'>Active Employees</h3>
              <div className='text-2xl font-bold'>0</div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

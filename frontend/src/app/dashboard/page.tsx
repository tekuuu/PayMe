'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCreditCard } from '@tabler/icons-react';
import React from 'react';

export default function DashboardPage() {
  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-6 p-4 md:p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2 border-b pb-4'>
          <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card className='relative overflow-hidden border bg-card/50 transition-shadow hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>$0.00</div>
              <p className='text-xs text-muted-foreground mt-1'>
                0% growth
              </p>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden border bg-card/50 transition-shadow hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>$0.00</div>
              <p className='text-xs text-muted-foreground mt-1'>
                0% change
              </p>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden border bg-card/50 transition-shadow hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>Active Subs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-muted-foreground mt-1'>
                No active renewals
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-4 overflow-hidden border bg-card/50'>
            <CardHeader>
              <CardTitle>Spending Highlights</CardTitle>
              <CardDescription>
                A visualized breakdown of your monthly activity.
              </CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='h-[200px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg m-4 mt-0 bg-muted/20'>
                Analytics visualization pipeline (Secure Enclave)
              </div>
            </CardContent>
          </Card>

          <Card className='col-span-3 overflow-hidden border bg-card/50'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>My Card</CardTitle>
                <IconCreditCard className='h-4 w-4 text-muted-foreground' />
              </div>
              <CardDescription>
                Your virtual private card details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-xl bg-slate-950 p-6 text-white shadow-lg border border-white/10'>
                <div className='flex justify-between items-start mb-12'>
                  <IconCreditCard className='text-primary' size={24} />
                  <span className='text-[10px] font-mono opacity-50 uppercase tracking-[0.2em]'>Secure Private Card</span>
                </div>
                <div className='space-y-4'>
                  <div className='text-xl font-mono tracking-[0.2em]'>•••• •••• •••• ••••</div>
                  <div className='flex justify-between items-end'>
                    <div className="space-y-1">
                      <span className='text-[10px] opacity-40 uppercase block'>Card Holder</span>
                      <span className="text-sm font-medium tracking-tight">NOT LINKED</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

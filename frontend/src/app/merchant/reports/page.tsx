'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMicrosToCurrency } from '@/lib/merchant/control-plane-store';
import { Download, FileText, Loader2 } from 'lucide-react';
import { fetchActivitiesFromApi } from '@/lib/merchant/control-plane-store';

type ReportType = 'plans' | 'subscriptions' | 'cycles' | 'activities';

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v).replaceAll('"', '""')}"`;
  return [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MerchantReportsPage() {
  const { me } = useMe();
  const { state, isHydrated, refresh } = useMerchantControlPlane(me?.account);
  const [reportType, setReportType] = useState<ReportType>('plans');
  const [isExporting, setIsExporting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    if (reportType === 'activities' && me?.account) {
      setIsLoadingActivities(true);
      fetchActivitiesFromApi(me.account).then((data) => {
        setActivities(data);
        setIsLoadingActivities(false);
      });
    }
  }, [reportType, me?.account]);

  const planColumns = ['Name', 'Interval', 'Amount (cUSDC)', 'Status', 'Checkout Slug', 'Created'];
  const planRows = useMemo(() => {
    return (state?.plans || []).map((p) => [
      p.name,
      p.interval,
      formatMicrosToCurrency(p.amountRefMicros || '0'),
      p.status,
      `/subscribe/${p.checkoutSlug}`,
      new Date(p.createdAt).toLocaleDateString(),
    ]);
  }, [state?.plans]);

  const subColumns = ['Card Address', 'Status', 'Period End', 'Next Charge', 'Plan ID'];
  const subRows = useMemo(() => {
    return (state?.subscriptions || []).map((s) => [
      s.customerCardAddress,
      s.status,
      s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '-',
      s.nextChargeAt ? new Date(s.nextChargeAt).toLocaleDateString() : '-',
      s.planId,
    ]);
  }, [state?.subscriptions]);

  const cycleColumns = ['ID', 'Subscription', 'Status', 'Attempts', 'Failure Class', 'Created'];
  const cycleRows = useMemo(() => {
    return (state?.cycles || []).map((c) => [
      c.id,
      c.subscriptionId,
      c.status,
      String(c.attemptCount),
      c.lastFailureClass || '-',
      new Date(c.createdAt).toLocaleDateString(),
    ]);
  }, [state?.cycles]);

  const activityColumns = ['Date', 'Type', 'Status', 'Amount', 'Token', 'TX Hash'];
  const activityRows = useMemo(() => {
    return activities.map((a: any) => [
      a.createdAt ? new Date(a.createdAt).toLocaleString() : '-',
      a.type,
      a.status,
      a.amount || '-',
      a.token || '-',
      a.txHash || '-',
    ]);
  }, [activities]);

  const handleExport = () => {
    setIsExporting(true);
    try {
      let headers: string[], rows: string[][];
      let filename: string;

      switch (reportType) {
        case 'plans':
          headers = planColumns;
          rows = planRows;
          filename = `payme-plans-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case 'subscriptions':
          headers = subColumns;
          rows = subRows;
          filename = `payme-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case 'cycles':
          headers = cycleColumns;
          rows = cycleRows;
          filename = `payme-billing-cycles-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case 'activities':
          headers = activityColumns;
          rows = activityRows;
          filename = `payme-activities-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
      }

      downloadCSV(filename, toCSV(headers, rows));
    } finally {
      setIsExporting(false);
    }
  };

  const previewRows = (() => {
    switch (reportType) {
      case 'plans': return { headers: planColumns, rows: planRows };
      case 'subscriptions': return { headers: subColumns, rows: subRows };
      case 'cycles': return { headers: cycleColumns, rows: cycleRows };
      case 'activities': return { headers: activityColumns, rows: activityRows };
    }
  })();

  const previewCount = (() => {
    switch (reportType) {
      case 'plans': return planRows.length;
      case 'subscriptions': return subRows.length;
      case 'cycles': return cycleRows.length;
      case 'activities': return activityRows.length;
    }
  })();

  return (
    <div className='flex-1 space-y-4 p-6'>
      <div className='space-y-1'>
        <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>Reports</h2>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='grid gap-6 xl:grid-cols-[300px_1fr]'>
        <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur p-6 relative overflow-hidden group h-fit'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
          <div className='relative space-y-4'>
            <div>
              <h3 className='font-semibold'>Export Data</h3>
              <p className='mt-1 text-xs text-muted-foreground'>Select report type and download CSV</p>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Report Type</label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='plans'>Plans</SelectItem>
                  <SelectItem value='subscriptions'>Subscriptions</SelectItem>
                  <SelectItem value='cycles'>Billing Cycles</SelectItem>
                  <SelectItem value='activities'>Customer Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} disabled={isExporting || previewCount === 0} className='w-full gap-2'>
              {isExporting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
              Export CSV
            </Button>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur p-6 relative overflow-hidden group'>
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
            <div className='relative'>
              <div className='flex items-center gap-2 mb-4'>
                <FileText className='h-5 w-5 text-primary' />
                <h3 className='font-semibold'>Preview</h3>
                <span className='text-xs text-muted-foreground ml-auto'>{previewCount} rows</span>
              </div>

              {previewRows.rows.length === 0 ? (
                <div className='rounded-lg border border-dashed border-border/40 p-10 text-center text-sm text-muted-foreground'>
                  No data available for this report type.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-border/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                        {previewRows.headers.map((h) => (
                          <th key={h} className='px-3 py-2 font-medium'>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border/20'>
                      {previewRows.rows.slice(0, 20).map((row, i) => (
                        <tr key={i} className='text-xs hover:bg-muted/20'>
                          {row.map((cell, j) => (
                            <td key={j} className='px-3 py-2 font-mono truncate max-w-[200px]'>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.rows.length > 20 && (
                    <p className='mt-2 text-center text-[11px] text-muted-foreground'>
                      Showing 20 of {previewRows.rows.length} rows. Export to see all.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Copy, Plus, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatMicrosToCurrency, archivePlanTemplate, createPlanTemplate, updatePlanTemplate } from '@/lib/merchant/control-plane-store';
import type { MerchantPlan, PlanInterval } from '@/lib/merchant/types';

function toAbsoluteAppOrigin() {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return window.location.origin;
}

function intervalToSeconds(interval: PlanInterval) {
  if (interval === 'yearly') return 365 * 86400;
  return 30 * 86400;
}

export default function MerchantPlansPage() {
  const { me } = useMe();
  const { state, isHydrated } = useMerchantControlPlane(me?.account);

  const plans = useMemo(() => {
    const list = [...(state?.plans || [])];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state?.plans]);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('Starter');
  const [description, setDescription] = useState('');
  const [interval, setInterval] = useState<PlanInterval>('monthly');
  const [amount, setAmount] = useState('5.00');

  const [editing, setEditing] = useState<MerchantPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInterval, setEditInterval] = useState<PlanInterval>('monthly');
  const [editAmount, setEditAmount] = useState('');

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  const handleCreate = () => {
    if (!me?.account) {
      toast.error('Please sign in with merchant wallet');
      return;
    }
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    try {
      const amountMicros = parseUnits(String(amount), 6).toString();
      createPlanTemplate({
        merchantAddress: me.account,
        name,
        description,
        interval,
        billingIntervalSeconds: intervalToSeconds(interval),
        amountRefMicros: amountMicros,
      });
      setCreateOpen(false);
      toast.success('Plan created');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create plan');
    }
  };

  const openEdit = (plan: MerchantPlan) => {
    setEditing(plan);
    setEditName(plan.name);
    setEditDescription(plan.description || '');
    setEditInterval(plan.interval || 'monthly');
    try {
      setEditAmount(formatMicrosToCurrency(plan.amountRefMicros || '0'));
    } catch {
      setEditAmount('');
    }
  };

  const handleSaveEdit = () => {
    if (!me?.account || !editing) return;
    if (!editName.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!editAmount || Number(editAmount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    try {
      const amountMicros = parseUnits(String(editAmount), 6).toString();
      updatePlanTemplate(me.account, editing.id, {
        name: editName,
        description: editDescription,
        interval: editInterval,
        billingIntervalSeconds: intervalToSeconds(editInterval),
        amountRefMicros: amountMicros,
      });
      setEditing(null);
      toast.success('Plan updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update plan');
    }
  };

  const handleArchive = (planId: string) => {
    if (!me?.account) return;
    archivePlanTemplate(me.account, planId);
    toast.success('Plan archived');
  };

  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-2'>
          <h2 className='text-3xl font-bold tracking-tight'>Plans</h2>
          <p className='text-sm text-muted-foreground'>
            Create monthly or yearly plan templates and share a checkout link. No database yet: links embed plan details.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>Create Plan</DialogTitle>
              <DialogDescription>Define a plan cadence and amount (cUSDC, encrypted on-chain at approval time).</DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Plan Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='Starter' />
              </div>

              <div className='space-y-2'>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='What does this plan include?' />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Cadence</Label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as PlanInterval)}
                    className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                  >
                    <option value='monthly'>Monthly</option>
                    <option value='yearly'>Yearly</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <Label>Amount (cUSDC)</Label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type='number'
                    min='0'
                    step='0.000001'
                    placeholder='5.00'
                  />
                </div>
              </div>

              <div className='flex items-center justify-end gap-2'>
                <Button variant='outline' onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className='rounded-xl border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Plan</th>
                <th className='px-4 py-3 font-medium'>Cadence</th>
                <th className='px-4 py-3 font-medium'>Amount</th>
                <th className='px-4 py-3 font-medium'>Opaque Ref</th>
                <th className='px-4 py-3 font-medium'>Status</th>
                <th className='px-4 py-3 font-medium'>Checkout</th>
                <th className='px-4 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {!isHydrated ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={7}>
                    Loading plan templates...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={7}>
                    No plans yet. Create your first monthly or yearly plan.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => {
                  const checkoutUrl = `${toAbsoluteAppOrigin()}/subscribe/${plan.checkoutSlug}`;
                  return (
                    <tr key={plan.id} className='align-top'>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{plan.name}</div>
                        {plan.description ? <div className='mt-1 text-xs text-muted-foreground line-clamp-2'>{plan.description}</div> : null}
                      </td>
                      <td className='px-4 py-3 capitalize'>{plan.interval}</td>
                      <td className='px-4 py-3'>{formatMicrosToCurrency(plan.amountRefMicros || '0')} cUSDC</td>
                      <td className='px-4 py-3'>
                        <code className='max-w-[220px] truncate rounded bg-muted px-2 py-1 text-[11px]'>
                          {plan.planRef || '-'}
                        </code>
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                            plan.status === 'archived'
                              ? 'border-slate-500/30 bg-slate-500/10 text-slate-600'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <code className='max-w-[320px] truncate rounded bg-muted px-2 py-1 text-[11px]'>
                            /subscribe/{plan.checkoutSlug}
                          </code>
                          <Button size='sm' variant='outline' className='gap-2' onClick={() => copy(checkoutUrl, 'Checkout link')}>
                            <Copy className='h-3.5 w-3.5' />
                            Copy
                          </Button>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-wrap gap-2'>
                          <Button size='sm' variant='outline' className='gap-2' onClick={() => openEdit(plan)} disabled={plan.status === 'archived'}>
                            <Settings2 className='h-3.5 w-3.5' />
                            Edit
                          </Button>
                          <Button size='sm' variant='destructive' className='gap-2' onClick={() => handleArchive(plan.id)} disabled={plan.status === 'archived'}>
                            <Trash2 className='h-3.5 w-3.5' />
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => (!open ? setEditing(null) : null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Changing cadence or amount updates new checkout links for this plan.</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Plan Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div className='space-y-2'>
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Cadence</Label>
                <select
                  value={editInterval}
                  onChange={(e) => setEditInterval(e.target.value as PlanInterval)}
                  className='h-10 w-full rounded-md border bg-background px-3 text-sm'
                >
                  <option value='monthly'>Monthly</option>
                  <option value='yearly'>Yearly</option>
                </select>
              </div>
              <div className='space-y-2'>
                <Label>Amount (cUSDC)</Label>
                <Input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  type='number'
                  min='0'
                  step='0.000001'
                />
              </div>
            </div>

            <div className='flex items-center justify-end gap-2'>
              <Button variant='outline' onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

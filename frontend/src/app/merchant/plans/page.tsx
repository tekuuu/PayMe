'use client';

import { useMemo, useState } from 'react';
import { Copy, Plus, RefreshCw, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Hex, parseUnits } from 'viem';
import { useMe } from '@/providers/auth-provider';
import { useMerchantControlPlane } from '@/hooks/use-merchant-control-plane';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatMicrosToCurrency, archivePlanTemplate, createPlanTemplate, updatePlanTemplate } from '@/lib/merchant/control-plane-store';
import type { MerchantPlan, PlanInterval } from '@/lib/merchant/types';
import {
  archivePlanOnChain,
  createPlanOnChain,
  createPlanRef,
  createPlanTermsHash,
  updatePlanOnChain,
} from '@/lib/subscriptions/plan-registry';

function toAbsoluteAppOrigin() {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return window.location.origin;
}

function intervalToSeconds(interval: PlanInterval, customDays?: number) {
  if (interval === 'yearly') return 365 * 86400;
  if (interval === 'custom' && customDays && customDays > 0) return Math.floor(customDays) * 86400;
  return 30 * 86400;
}

export default function MerchantPlansPage() {
  const { me } = useMe();
  const { state, isHydrated, refresh } = useMerchantControlPlane(me?.account);

  const plans = useMemo(() => {
    const list = [...(state?.plans || [])];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state?.plans]);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('Starter');
  const [description, setDescription] = useState('');
  const [interval, setInterval] = useState<PlanInterval>('monthly');
  const [customDays, setCustomDays] = useState('');
  const [amount, setAmount] = useState('');

  const [editing, setEditing] = useState<MerchantPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInterval, setEditInterval] = useState<PlanInterval>('monthly');
  const [editCustomDays, setEditCustomDays] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [submittingAction, setSubmittingAction] = useState<'create' | 'edit' | 'archive' | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  const handleCreate = async () => {
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
      setSubmittingAction('create');
      const amountMicros = parseUnits(String(amount), 6).toString();
      const billingIntervalSeconds = intervalToSeconds(interval, Number(customDays) || undefined);
      const planRef = createPlanRef({
        merchantAddress: me.account,
        name,
        amountRefMicros: amountMicros,
        intervalSeconds: billingIntervalSeconds,
      });
      const termsHash = createPlanTermsHash({
        name,
        description,
        interval,
        billingIntervalSeconds,
        amountRefMicros: amountMicros,
      });

      await createPlanOnChain({
        identity: {
          account: me.account,
          keyId: me.keyId,
        },
        planRef,
        periodSeconds: billingIntervalSeconds,
        priceMicros: amountMicros,
        termsHash,
      });

      createPlanTemplate({
        merchantAddress: me.account,
        name,
        description,
        interval,
        billingIntervalSeconds,
        amountRefMicros: amountMicros,
        planRef,
      });
      setCreateOpen(false);
      toast.success('Plan created on-chain');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create plan');
    } finally {
      setSubmittingAction(null);
    }
  };

  const openEdit = (plan: MerchantPlan) => {
    setEditing(plan);
    setEditName(plan.name);
    setEditDescription(plan.description || '');
    setEditInterval(plan.interval || 'monthly');
    if (plan.interval === 'custom' && plan.billingIntervalSeconds) {
      setEditCustomDays(String(Math.floor(plan.billingIntervalSeconds / 86400)));
    } else {
      setEditCustomDays('');
    }
    try {
      setEditAmount(formatMicrosToCurrency(plan.amountRefMicros || '0'));
    } catch {
      setEditAmount('');
    }
  };

  const handleSaveEdit = async () => {
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
      if (!editing.planRef || !/^0x[0-9a-fA-F]{64}$/.test(editing.planRef)) {
        throw new Error('Plan is missing on-chain reference. Recreate this plan.');
      }
      setSubmittingAction('edit');
      setActivePlanId(editing.id);

      const amountMicros = parseUnits(String(editAmount), 6).toString();
      const billingIntervalSeconds = intervalToSeconds(editInterval, Number(editCustomDays) || undefined);
      const termsHash = createPlanTermsHash({
        name: editName,
        description: editDescription,
        interval: editInterval,
        billingIntervalSeconds,
        amountRefMicros: amountMicros,
      });

      await updatePlanOnChain({
        identity: {
          account: me.account,
          keyId: me.keyId,
        },
        planRef: editing.planRef as Hex,
        periodSeconds: billingIntervalSeconds,
        priceMicros: amountMicros,
        termsHash,
        active: editing.status !== 'archived',
      });

      updatePlanTemplate(me.account, editing.id, {
        name: editName,
        description: editDescription,
        interval: editInterval,
        billingIntervalSeconds,
        amountRefMicros: amountMicros,
      });
      setEditing(null);
      toast.success('Plan updated on-chain');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update plan');
    } finally {
      setSubmittingAction(null);
      setActivePlanId(null);
    }
  };

  const handleArchive = async (plan: MerchantPlan) => {
    if (!me?.account) return;
    try {
      if (!plan.planRef || !/^0x[0-9a-fA-F]{64}$/.test(plan.planRef)) {
        throw new Error('Plan is missing on-chain reference. Recreate this plan.');
      }
      setSubmittingAction('archive');
      setActivePlanId(plan.id);

      await archivePlanOnChain({
        identity: {
          account: me.account,
          keyId: me.keyId,
        },
        planRef: plan.planRef as Hex,
      });

      archivePlanTemplate(me.account, plan.id);
      toast.success('Plan archived on-chain');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to archive plan');
    } finally {
      setSubmittingAction(null);
      setActivePlanId(null);
    }
  };

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-1'>
        <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>Plans</h2>
      </div>
      <div className='h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent' />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-2'>
          <Button variant='outline' className='gap-2' onClick={() => refresh()}>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
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
                  <Label className='text-xs font-medium uppercase tracking-wide'>Plan Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='Starter' className='rounded-xl' />
                </div>

                <div className='space-y-2'>
                  <Label className='text-xs font-medium uppercase tracking-wide'>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='What does this plan include?' className='rounded-xl' />
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='text-xs font-medium uppercase tracking-wide'>Cadence</Label>
                    <Select value={interval} onValueChange={(value) => setInterval(value as PlanInterval)}>
                      <SelectTrigger className='rounded-xl'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='monthly'>Monthly</SelectItem>
                        <SelectItem value='yearly'>Yearly</SelectItem>
                        <SelectItem value='custom'>Custom (days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {interval === 'custom' ? (
                    <div className='space-y-2'>
                      <Label className='text-xs font-medium uppercase tracking-wide'>Custom Days</Label>
                      <Input
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value.replace(/[^0-9]/g, ''))}
                        type='text'
                        inputMode='numeric'
                        placeholder='30'
                        className='rounded-xl'
                      />
                    </div>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <Label className='text-xs font-medium uppercase tracking-wide'>Amount (cUSDC)</Label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type='number'
                    min='0'
                    step='0.000001'
                    placeholder='Enter amount'
                    className='rounded-xl'
                  />
                </div>

                <div className='flex items-center justify-end gap-2 pt-2'>
                  <Button variant='outline' onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={submittingAction === 'create'}>
                    {submittingAction === 'create' ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-muted/20 backdrop-blur overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-border/40 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-4 font-semibold'>Plan</th>
                <th className='px-4 py-4 font-semibold'>Cadence</th>
                <th className='px-4 py-4 font-semibold'>Amount</th>
                <th className='px-4 py-4 font-semibold'>Plan Reference</th>
                <th className='px-4 py-4 font-semibold'>Status</th>
                <th className='px-4 py-4 font-semibold'>Checkout Link</th>
                <th className='px-4 py-4 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
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
                    <tr key={plan.id} className='align-top hover:bg-muted/40 transition-colors'>
                      <td className='px-4 py-4'>
                        <div className='font-semibold text-foreground'>{plan.name}</div>
                        {plan.description ? <div className='mt-1 text-xs text-muted-foreground line-clamp-2'>{plan.description}</div> : null}
                      </td>
                      <td className='px-4 py-4 text-sm capitalize font-medium text-foreground'>{plan.interval}</td>
                      <td className='px-4 py-4 text-sm font-semibold text-foreground'>{formatMicrosToCurrency(plan.amountRefMicros || '0')} cUSDC</td>
                      <td className='px-4 py-4'>
                        <code className='max-w-[200px] truncate rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] font-mono text-muted-foreground'>
                          {plan.planRef ? plan.planRef.slice(0, 10) + '...' + plan.planRef.slice(-8) : '—'}
                        </code>
                      </td>
                      <td className='px-4 py-4'>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            plan.status === 'archived'
                              ? 'border-slate-500/30 bg-slate-500/10 text-slate-700'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <code className='max-w-[180px] truncate rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] font-mono text-muted-foreground'>
                            /subscribe/{plan.checkoutSlug}
                          </code>
                          <Button size='sm' variant='outline' className='gap-1.5 flex-shrink-0' onClick={() => copy(checkoutUrl, 'Checkout link')}>
                            <Copy className='h-3 w-3' />
                            Copy
                          </Button>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex flex-wrap gap-2'>
                          <Button size='sm' variant='outline' className='gap-1.5' onClick={() => openEdit(plan)} disabled={plan.status === 'archived'}>
                            <Settings2 className='h-3.5 w-3.5' />
                            Edit
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            className='gap-1.5'
                            onClick={() => handleArchive(plan)}
                            disabled={plan.status === 'archived' || submittingAction === 'archive'}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                            {submittingAction === 'archive' && activePlanId === plan.id ? 'Archiving...' : 'Archive'}
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
              <Label className='text-xs font-medium uppercase tracking-wide'>Plan Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className='rounded-xl' />
            </div>

            <div className='space-y-2'>
              <Label className='text-xs font-medium uppercase tracking-wide'>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className='rounded-xl' />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-xs font-medium uppercase tracking-wide'>Cadence</Label>
                <Select value={editInterval} onValueChange={(value) => setEditInterval(value as PlanInterval)}>
                  <SelectTrigger className='rounded-xl'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                    <SelectItem value='yearly'>Yearly</SelectItem>
                    <SelectItem value='custom'>Custom (days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editInterval === 'custom' ? (
                <div className='space-y-2'>
                  <Label className='text-xs font-medium uppercase tracking-wide'>Custom Days</Label>
                  <Input
                    value={editCustomDays}
                    onChange={(e) => setEditCustomDays(e.target.value.replace(/[^0-9]/g, ''))}
                    type='text'
                    inputMode='numeric'
                    placeholder='30'
                    className='rounded-xl'
                  />
                </div>
              ) : (
                <div className='space-y-2'>
                  <Label className='text-xs font-medium uppercase tracking-wide'>Amount (cUSDC)</Label>
                  <Input
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    type='number'
                    min='0'
                    step='0.000001'
                    className='rounded-xl'
                  />
                </div>
              )}
            </div>

            <div className='flex items-center justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={submittingAction === 'edit'}>
                {submittingAction === 'edit' && activePlanId === editing?.id ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

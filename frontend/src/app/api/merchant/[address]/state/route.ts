// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import {
  merchantPlans,
  subscriptions,
  billingCycles,
  billingAttempts,
} from '@/lib/db/schema';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    const body = await req.json();

    if (body.plans) {
      for (const plan of body.plans) {
        await db
          .insert(merchantPlans)
          .values({
            id: plan.id,
            merchantAddress: address,
            planRef: plan.planRef,
            name: plan.name,
            description: plan.description,
            interval: plan.interval || 'monthly',
            billingIntervalSeconds: plan.billingIntervalSeconds || 30 * 86400,
            amountRefMicros: plan.amountRefMicros || '0',
            status: plan.status || 'active',
            checkoutSlug: plan.checkoutSlug,
            createdAt: new Date(plan.createdAt),
            updatedAt: new Date(plan.updatedAt || plan.createdAt),
          })
          .onConflictDoUpdate({
            target: merchantPlans.id,
            set: {
              name: plan.name,
              description: plan.description,
              interval: plan.interval,
              billingIntervalSeconds: plan.billingIntervalSeconds,
              amountRefMicros: plan.amountRefMicros,
              status: plan.status,
              planRef: plan.planRef,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (body.subscriptions) {
      for (const sub of body.subscriptions) {
        await db
          .insert(subscriptions)
          .values({
            id: sub.id,
            merchantAddress: address,
            subscriptionRef: sub.subscriptionRef,
            planRef: sub.planRef,
            planId: sub.planId,
            customerCardAddress: sub.customerCardAddress,
            customerSmartWallet: sub.customerSmartWallet,
            status: sub.status || 'active',
            currentPeriodStart: new Date(sub.currentPeriodStart || sub.startedAt),
            currentPeriodEnd: new Date(sub.currentPeriodEnd),
            nextChargeAt: sub.nextChargeAt ? new Date(sub.nextChargeAt) : null,
            lastChargeAt: sub.lastChargeAt ? new Date(sub.lastChargeAt) : null,
            failureCount: sub.failureCount || 0,
            maxAllowanceRefMicros: sub.maxAllowanceRefMicros,
            maxAllowanceHandle: sub.maxAllowanceHandle,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd ? 1 : 0,
            createdAt: new Date(sub.createdAt),
            updatedAt: new Date(sub.updatedAt || sub.createdAt),
          })
          .onConflictDoUpdate({
            target: subscriptions.id,
            set: {
              status: sub.status,
              subscriptionRef: sub.subscriptionRef,
              currentPeriodEnd: new Date(sub.currentPeriodEnd),
              nextChargeAt: sub.nextChargeAt ? new Date(sub.nextChargeAt) : null,
              lastChargeAt: sub.lastChargeAt ? new Date(sub.lastChargeAt) : null,
              failureCount: sub.failureCount,
              cancelAtPeriodEnd: sub.cancelAtPeriodEnd ? 1 : 0,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (body.cycles) {
      for (const cycle of body.cycles) {
        await db
          .insert(billingCycles)
          .values({
            id: cycle.id,
            merchantAddress: address,
            subscriptionId: cycle.subscriptionId,
            cycleStart: new Date(cycle.cycleStart || cycle.createdAt),
            cycleEnd: new Date(cycle.cycleEnd),
            status: cycle.status || 'draft',
            attemptCount: cycle.attemptCount || 0,
            nextAttemptAt: cycle.nextAttemptAt ? new Date(cycle.nextAttemptAt) : null,
            lastFailureClass: cycle.lastFailureClass,
            lastFailureReason: cycle.lastFailureReason,
            createdAt: new Date(cycle.createdAt),
            updatedAt: new Date(cycle.updatedAt || cycle.createdAt),
          })
          .onConflictDoUpdate({
            target: billingCycles.id,
            set: {
              status: cycle.status,
              attemptCount: cycle.attemptCount,
              nextAttemptAt: cycle.nextAttemptAt ? new Date(cycle.nextAttemptAt) : null,
              lastFailureClass: cycle.lastFailureClass,
              lastFailureReason: cycle.lastFailureReason,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (body.attempts) {
      for (const attempt of body.attempts) {
        await db
          .insert(billingAttempts)
          .values({
            id: attempt.id,
            merchantAddress: address,
            subscriptionId: attempt.subscriptionId,
            billingCycleId: attempt.billingCycleId,
            attemptNumber: attempt.attemptNumber,
            idempotencyKey: attempt.idempotencyKey,
            requestedAmountRef: attempt.requestedAmountRef,
            pulledAmountRef: attempt.pulledAmountRef,
            userOpHash: attempt.userOpHash,
            txHash: attempt.txHash,
            status: attempt.status || 'pending',
            failureClass: attempt.failureClass,
            failureReason: attempt.failureReason,
            startedAt: new Date(attempt.startedAt),
            resolvedAt: attempt.resolvedAt ? new Date(attempt.resolvedAt) : null,
          })
          .onConflictDoUpdate({
            target: billingAttempts.id,
            set: {
              status: attempt.status,
              pulledAmountRef: attempt.pulledAmountRef,
              userOpHash: attempt.userOpHash,
              txHash: attempt.txHash,
              failureClass: attempt.failureClass,
              failureReason: attempt.failureReason,
              resolvedAt: attempt.resolvedAt ? new Date(attempt.resolvedAt) : null,
            },
          });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

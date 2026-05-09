// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { customerActivities } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    const rows = await db
      .select()
      .from(customerActivities)
      .where(eq(customerActivities.walletAddress, address))
      .orderBy(desc(customerActivities.createdAt))
      .limit(100);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    const body = await req.json();

    await db.insert(customerActivities).values({
      id: body.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      walletAddress: address,
      cardAddress: body.cardAddress,
      type: body.type,
      status: body.status || 'confirmed',
      amount: body.amount,
      token: body.token,
      counterparty: body.counterparty,
      merchantAddress: body.merchantAddress,
      planName: body.planName,
      subscriptionId: body.subscriptionId,
      txHash: body.txHash,
      userOpHash: body.userOpHash,
      metadata: body.metadata || {},
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      confirmedAt: body.confirmedAt ? new Date(body.confirmedAt) : new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

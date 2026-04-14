import type { PlanInterval } from '@/lib/merchant/types';

export type CheckoutSlugPayload = {
  v?: 1 | 2;
  merchantAddress: string;
  planRef: string;
  planId?: string;
  // Legacy fields (kept optional for backward decode compatibility)
  name?: string;
  description?: string;
  interval?: PlanInterval;
  billingIntervalSeconds?: number;
  amountRefMicros?: string;
};

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(bytes).toString('base64')
      : window.btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBytes(input: string) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  if (typeof window === 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeCheckoutSlug(payload: CheckoutSlugPayload) {
  // Privacy-first payload (v2): no human-readable plan metadata in URL.
  const compact = {
    v: 2,
    merchantAddress: payload.merchantAddress,
    planRef: payload.planRef,
    planId: payload.planId,
  };
  const json = JSON.stringify(compact);
  const bytes = typeof window === 'undefined' ? Buffer.from(json, 'utf8') : new TextEncoder().encode(json);
  return base64UrlEncodeBytes(bytes);
}

export function decodeCheckoutSlug(slug: string): CheckoutSlugPayload | null {
  try {
    const bytes = base64UrlDecodeToBytes(slug);
    const json = typeof window === 'undefined' ? Buffer.from(bytes).toString('utf8') : new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || (parsed.v !== 1 && parsed.v !== 2)) return null;
    if (typeof parsed.merchantAddress !== 'string') return null;
    if (typeof parsed.planRef !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(parsed.planRef)) return null;
    return {
      v: parsed.v,
      merchantAddress: parsed.merchantAddress,
      planRef: parsed.planRef,
      planId: typeof parsed.planId === 'string' ? parsed.planId : undefined,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
      interval: typeof parsed.interval === 'string' ? (parsed.interval as PlanInterval) : undefined,
      billingIntervalSeconds: Number.isFinite(parsed.billingIntervalSeconds) ? parsed.billingIntervalSeconds : undefined,
      amountRefMicros: typeof parsed.amountRefMicros === 'string' ? parsed.amountRefMicros : undefined,
    };
  } catch {
    return null;
  }
}

import type { PlanInterval } from '@/lib/merchant/types';

export type CheckoutSlugPayloadV1 = {
  v: 1;
  merchantAddress: string;
  planId: string;
  planRef: string;
  name: string;
  description: string;
  interval: PlanInterval;
  billingIntervalSeconds: number;
  amountRefMicros: string;
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

export function encodeCheckoutSlug(payload: CheckoutSlugPayloadV1) {
  const json = JSON.stringify(payload);
  const bytes = typeof window === 'undefined' ? Buffer.from(json, 'utf8') : new TextEncoder().encode(json);
  return base64UrlEncodeBytes(bytes);
}

export function decodeCheckoutSlug(slug: string): CheckoutSlugPayloadV1 | null {
  try {
    const bytes = base64UrlDecodeToBytes(slug);
    const json = typeof window === 'undefined' ? Buffer.from(bytes).toString('utf8') : new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || parsed.v !== 1) return null;
    if (typeof parsed.merchantAddress !== 'string' || typeof parsed.planId !== 'string') return null;
    if (typeof parsed.planRef !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(parsed.planRef)) return null;
    return parsed as CheckoutSlugPayloadV1;
  } catch {
    return null;
  }
}

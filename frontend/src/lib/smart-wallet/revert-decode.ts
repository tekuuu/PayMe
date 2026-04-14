import { decodeAbiParameters, Hex } from 'viem';

const SENDER_NOT_ALLOWED_SELECTOR = '0xd0d25976'; // SenderNotAllowed(address)
const ERROR_STRING_SELECTOR = '0x08c379a0'; // Error(string)

function decodeAddressArg(data: Hex): string | null {
  try {
    const payload = `0x${data.slice(10)}` as Hex;
    const [value] = decodeAbiParameters([{ type: 'address' }], payload);
    return value;
  } catch {
    return null;
  }
}

function decodeErrorString(data: Hex): string | null {
  try {
    const payload = `0x${data.slice(10)}` as Hex;
    const [value] = decodeAbiParameters([{ type: 'string' }], payload);
    return value;
  } catch {
    return null;
  }
}

export function describeExecutionRevertReason(reasonLike: unknown): string | undefined {
  if (!reasonLike) return undefined;

  const reason = String(reasonLike).trim();
  if (!reason.startsWith('0x') || reason.length < 10) {
    return reason.length > 0 ? reason : undefined;
  }

  const selector = reason.slice(0, 10).toLowerCase();

  if (selector === SENDER_NOT_ALLOWED_SELECTOR) {
    const account = decodeAddressArg(reason as Hex);
    if (account) {
      return `SenderNotAllowed(${account}): encrypted handle ACL mismatch. This flow needs proof-based FHE input consumption.`;
    }
    return 'SenderNotAllowed: encrypted handle ACL mismatch. This flow needs proof-based FHE input consumption.';
  }

  if (selector === ERROR_STRING_SELECTOR) {
    const message = decodeErrorString(reason as Hex);
    if (message) {
      return message;
    }
  }

  return reason;
}

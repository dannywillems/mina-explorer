import { mutateDaemon, isCorsError } from './daemon';
import { isValidPublicKey } from '@/utils/formatters';

export type TransactionType = 'payment' | 'delegation' | 'zkapp';

export interface BroadcastResult {
  txHash: string;
  type: TransactionType;
}

interface SignatureInput {
  rawSignature?: string | undefined;
  field?: string | undefined;
  scalar?: string | undefined;
}

interface UserCommandPayload {
  input: Record<string, unknown>;
  signature: SignatureInput;
}

interface ZkAppPayload {
  input: { zkappCommand: unknown };
}

const SEND_PAYMENT = `
  mutation SendPayment($input: SendPaymentInput!, $signature: SignatureInput) {
    sendPayment(input: $input, signature: $signature) {
      payment { hash }
    }
  }
`;

const SEND_DELEGATION = `
  mutation SendDelegation($input: SendDelegationInput!, $signature: SignatureInput) {
    sendDelegation(input: $input, signature: $signature) {
      delegation { hash }
    }
  }
`;

const SEND_ZKAPP = `
  mutation SendZkapp($input: SendZkappInput!) {
    sendZkapp(input: $input) {
      zkapp { hash }
    }
  }
`;

function wrapCorsError(err: unknown): never {
  if (isCorsError(err)) {
    throw new Error(
      'Unable to reach the daemon endpoint. This is likely a CORS issue — ' +
        'the daemon may not allow requests from this origin. ' +
        'Try using a custom endpoint via the network selector.',
    );
  }
  throw err;
}

export async function broadcastPayment(
  payload: UserCommandPayload,
): Promise<BroadcastResult> {
  try {
    const data = await mutateDaemon<{
      sendPayment: { payment: { hash: string } };
    }>(SEND_PAYMENT, {
      input: payload.input,
      signature: payload.signature,
    });
    return { txHash: data.sendPayment.payment.hash, type: 'payment' };
  } catch (err) {
    wrapCorsError(err);
  }
}

export async function broadcastDelegation(
  payload: UserCommandPayload,
): Promise<BroadcastResult> {
  try {
    const data = await mutateDaemon<{
      sendDelegation: { delegation: { hash: string } };
    }>(SEND_DELEGATION, {
      input: payload.input,
      signature: payload.signature,
    });
    return { txHash: data.sendDelegation.delegation.hash, type: 'delegation' };
  } catch (err) {
    wrapCorsError(err);
  }
}

export async function broadcastZkApp(
  payload: ZkAppPayload,
): Promise<BroadcastResult> {
  try {
    const data = await mutateDaemon<{
      sendZkapp: { zkapp: { hash: string } };
    }>(SEND_ZKAPP, { input: payload.input });
    return { txHash: data.sendZkapp.zkapp.hash, type: 'zkapp' };
  } catch (err) {
    wrapCorsError(err);
  }
}

function hasString(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'string' && obj[key].length > 0;
}

function validateSignature(sig: unknown): string | null {
  if (!sig || typeof sig !== 'object') {
    return 'Missing "signature" object';
  }
  const s = sig as Record<string, unknown>;
  const hasRaw = hasString(s, 'rawSignature');
  const hasFieldScalar = hasString(s, 'field') && hasString(s, 'scalar');
  if (!hasRaw && !hasFieldScalar) {
    return 'Signature must include "rawSignature" or both "field" and "scalar"';
  }
  return null;
}

function validatePublicKeys(
  input: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    if (!hasString(input, key)) {
      return `Missing required field "input.${key}"`;
    }
    if (!isValidPublicKey(input[key] as string)) {
      return `Invalid public key in "input.${key}" — must start with B62 and be 55 characters`;
    }
  }
  return null;
}

export function validatePaymentPayload(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') return 'Expected a JSON object';
  const obj = parsed as Record<string, unknown>;

  if (!obj.input || typeof obj.input !== 'object') {
    return 'Missing "input" object';
  }
  const input = obj.input as Record<string, unknown>;

  const keyErr = validatePublicKeys(input, 'from', 'to');
  if (keyErr) return keyErr;

  if (!hasString(input, 'amount'))
    return 'Missing required field "input.amount"';
  if (!hasString(input, 'fee')) return 'Missing required field "input.fee"';

  return validateSignature(obj.signature);
}

export function validateDelegationPayload(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') return 'Expected a JSON object';
  const obj = parsed as Record<string, unknown>;

  if (!obj.input || typeof obj.input !== 'object') {
    return 'Missing "input" object';
  }
  const input = obj.input as Record<string, unknown>;

  const keyErr = validatePublicKeys(input, 'from', 'to');
  if (keyErr) return keyErr;

  if (!hasString(input, 'fee')) return 'Missing required field "input.fee"';

  return validateSignature(obj.signature);
}

export function validateZkAppPayload(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') return 'Expected a JSON object';
  const obj = parsed as Record<string, unknown>;

  if (!obj.input || typeof obj.input !== 'object') {
    return 'Missing "input" object';
  }
  const input = obj.input as Record<string, unknown>;

  if (!input.zkappCommand || typeof input.zkappCommand !== 'object') {
    return 'Missing "input.zkappCommand" object';
  }

  return null;
}

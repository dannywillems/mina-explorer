import Client from 'mina-signer';
import { NETWORKS, resolveActiveNetworkId } from '@/config';

type FieldScalarSig = { field: string; scalar: string };

interface VerifiablePayload {
  input: Record<string, unknown>;
  signature: FieldScalarSig | Record<string, unknown>;
}

export type VerifyResult = 'valid' | 'invalid' | 'unsupported';

function getSignerNetwork(): 'mainnet' | 'testnet' {
  const networkId = resolveActiveNetworkId();
  const network = NETWORKS[networkId];
  return network.id === 'mainnet' ? 'mainnet' : 'testnet';
}

function isFieldScalar(sig: unknown): sig is FieldScalarSig {
  if (!sig || typeof sig !== 'object') return false;
  const s = sig as Record<string, unknown>;
  return typeof s.field === 'string' && typeof s.scalar === 'string';
}

export function verifyPayment(payload: VerifiablePayload): VerifyResult {
  if (!isFieldScalar(payload.signature)) return 'unsupported';

  try {
    const client = new Client({ network: getSignerNetwork() });
    const valid = client.verifyPayment({
      data: payload.input as Parameters<typeof client.verifyPayment>[0]['data'],
      signature: payload.signature,
      publicKey: payload.input.from as string,
    });
    return valid ? 'valid' : 'invalid';
  } catch {
    return 'invalid';
  }
}

export function verifyDelegation(payload: VerifiablePayload): VerifyResult {
  if (!isFieldScalar(payload.signature)) return 'unsupported';

  try {
    const client = new Client({ network: getSignerNetwork() });
    const valid = client.verifyStakeDelegation({
      data: payload.input as Parameters<
        typeof client.verifyStakeDelegation
      >[0]['data'],
      signature: payload.signature,
      publicKey: payload.input.from as string,
    });
    return valid ? 'valid' : 'invalid';
  } catch {
    return 'invalid';
  }
}

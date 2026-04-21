import { useState, useCallback } from 'react';
import {
  type TransactionType,
  type BroadcastResult,
  broadcastPayment,
  broadcastDelegation,
  broadcastZkApp,
  validatePaymentPayload,
  validateDelegationPayload,
  validateZkAppPayload,
} from '@/services/api/broadcast';
import {
  type VerifyResult,
  verifyPayment,
  verifyDelegation,
} from '@/services/crypto/verify';

export type { TransactionType, BroadcastResult, VerifyResult };

interface UseBroadcastResult {
  broadcast: (type: TransactionType, json: string) => Promise<void>;
  validate: (type: TransactionType, json: string) => void;
  result: BroadcastResult | null;
  validationResult: VerifyResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

const validators: Record<TransactionType, (p: unknown) => string | null> = {
  payment: validatePaymentPayload,
  delegation: validateDelegationPayload,
  zkapp: validateZkAppPayload,
};

const broadcasters: Record<
  TransactionType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (payload: any) => Promise<BroadcastResult>
> = {
  payment: broadcastPayment,
  delegation: broadcastDelegation,
  zkapp: broadcastZkApp,
};

const verifiers: Record<
  TransactionType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((payload: any) => VerifyResult) | null
> = {
  payment: verifyPayment,
  delegation: verifyDelegation,
  zkapp: null,
};

export function useBroadcast(): UseBroadcastResult {
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [validationResult, setValidationResult] = useState<VerifyResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const broadcast = useCallback(
    async (type: TransactionType, json: string): Promise<void> => {
      setLoading(true);
      setError(null);
      setResult(null);
      setValidationResult(null);

      try {
        let parsed: unknown;
        try {
          parsed = JSON.parse(json);
        } catch (e) {
          const msg = e instanceof SyntaxError ? e.message : 'Invalid JSON';
          setError(`Invalid JSON: ${msg}`);
          return;
        }

        const validationError = validators[type](parsed);
        if (validationError) {
          setError(validationError);
          return;
        }

        const broadcastResult = await broadcasters[type](parsed);
        setResult(broadcastResult);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to broadcast transaction',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const validate = useCallback((type: TransactionType, json: string): void => {
    setError(null);
    setValidationResult(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : 'Invalid JSON';
      setError(`Invalid JSON: ${msg}`);
      return;
    }

    const structuralError = validators[type](parsed);
    if (structuralError) {
      setError(structuralError);
      return;
    }

    const verifier = verifiers[type];
    if (!verifier) {
      setValidationResult('unsupported');
      return;
    }

    setValidationResult(verifier(parsed));
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setValidationResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    broadcast,
    validate,
    result,
    validationResult,
    loading,
    error,
    reset,
  };
}

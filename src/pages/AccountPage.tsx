import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { AccountDetail } from '@/components/accounts';
import { useAccount } from '@/hooks/useAccount';

export function AccountPage(): ReactNode {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { account, loading, error } = useAccount(publicKey);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Account Details</h1>
      <AccountDetail account={account} loading={loading} error={error} />
    </div>
  );
}

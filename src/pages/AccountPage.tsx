import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { AccountDetail } from '@/components/accounts';
import { useAccount } from '@/hooks/useAccount';

export function AccountPage(): ReactNode {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { account, loading, error } = useAccount(publicKey);

  return (
    <div>
      <h2 className="mb-4">Account Details</h2>
      <AccountDetail account={account} loading={loading} error={error} />
    </div>
  );
}

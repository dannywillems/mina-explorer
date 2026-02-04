import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { AccountDetail, AccountTransactions } from '@/components/accounts';
import { useAccount, useNetwork } from '@/hooks';

export function AccountPage(): ReactNode {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { account, loading, error } = useAccount(publicKey);
  const { network } = useNetwork();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Account Details</h1>
      <AccountDetail
        account={account}
        loading={loading}
        error={error}
        networkName={network.displayName}
      />

      {publicKey && !loading && !error && account && (
        <AccountTransactions publicKey={publicKey} />
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { Layout } from '@/components/common';
import {
  HomePage,
  BlocksPage,
  BlockDetailPage,
  TransactionsPage,
  TransactionDetailPage,
  AccountsPage,
  AccountPage,
  NotFoundPage,
} from '@/pages';

export function App(): ReactNode {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="blocks" element={<BlocksPage />} />
              <Route path="block/:identifier" element={<BlockDetailPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route
                path="transaction/:hash"
                element={<TransactionDetailPage />}
              />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="account/:publicKey" element={<AccountPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </NetworkProvider>
    </ThemeProvider>
  );
}

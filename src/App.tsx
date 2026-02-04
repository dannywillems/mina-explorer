import type { ReactNode } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { NetworkProvider } from '@/context/NetworkContext';
import { Layout } from '@/components/common';
import {
  HomePage,
  BlocksPage,
  BlockDetailPage,
  AccountPage,
  NotFoundPage,
} from '@/pages';

export function App(): ReactNode {
  return (
    <NetworkProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="blocks" element={<BlocksPage />} />
            <Route path="block/:identifier" element={<BlockDetailPage />} />
            <Route path="account/:publicKey" element={<AccountPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </NetworkProvider>
  );
}

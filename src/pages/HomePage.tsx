import type { ReactNode } from 'react';
import { SearchBar } from '@/components/common';
import { NetworkStats, RecentBlocks } from '@/components/dashboard';

export function HomePage(): ReactNode {
  return (
    <div>
      <div className="text-center mb-4">
        <h1 className="mb-3 d-flex align-items-center justify-content-center">
          <img
            src={`${import.meta.env.BASE_URL}mina-logo-dark.svg`}
            alt="Mina"
            height="40"
            className="me-3"
          />
          Explorer
        </h1>
        <p className="text-muted mb-4">
          Explore blocks on the Mina Protocol network.
        </p>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <NetworkStats />
      </div>

      <div>
        <RecentBlocks />
      </div>
    </div>
  );
}

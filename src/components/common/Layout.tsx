import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { ConsensusTimeBar } from './ConsensusTimeBar';
import { Disclaimer } from './Disclaimer';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';

export function Layout(): ReactNode {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      {/* Above the routed content and outside the keyed ErrorBoundary, so the
          consensus clock's timers survive navigation instead of restarting. */}
      <ConsensusTimeBar />
      <Disclaimer />
      <main className="container mx-auto grow px-4 py-6">
        {/* Keyed on the path so navigating away from a crashed page recovers. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

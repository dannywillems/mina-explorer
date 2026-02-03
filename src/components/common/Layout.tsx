import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout(): ReactNode {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="container py-4 flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

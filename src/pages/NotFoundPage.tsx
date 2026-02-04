import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage(): ReactNode {
  return (
    <div className="py-16 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-6 text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex h-10 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to Homepage
      </Link>
    </div>
  );
}

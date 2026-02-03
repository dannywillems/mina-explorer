import type { ReactNode } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  text,
}: LoadingSpinnerProps): ReactNode {
  const sizeClass =
    size === 'sm'
      ? 'spinner-border-sm'
      : size === 'lg'
        ? 'spinner-border-lg'
        : '';

  return (
    <div className="d-flex align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
}

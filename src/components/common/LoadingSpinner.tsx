import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({
  size = 'md',
  text,
  className,
}: LoadingSpinnerProps): ReactNode {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 p-4',
        className,
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Skeleton component for loading states
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps): ReactNode {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
    />
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Tooltip text, for options whose label cannot carry the caveat. */
  title?: string;
}

interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

/**
 * A row of mutually exclusive buttons.
 *
 * Buttons rather than a `<select>`: the mobile menu animates via `overflow-hidden`, which
 * clips absolutely positioned children — the pitfall `NetworkSelector` carries its `inline`
 * prop for. Nothing here is positioned, so the whole class of problem is avoided, and it
 * matches the existing period pickers on the analytics and staking pages.
 *
 * Those two pickers hand-roll this markup with two different inactive styles. This is the
 * shared version; they are deliberately left alone here so that a blocks-page change does
 * not restyle unrelated pages, but they are the obvious next callers.
 *
 * `role="group"` + `aria-pressed` is the part the hand-rolled copies omit — without it a
 * screen reader announces four unrelated buttons and never says which one is active.
 */
export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  'data-testid': testId,
}: SegmentedControlProps<T>): ReactNode {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div
        role="group"
        aria-label={label}
        data-testid={testId}
        className="flex flex-wrap gap-1"
      >
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            {...(option.title ? { title: option.title } : {})}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              option.value === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

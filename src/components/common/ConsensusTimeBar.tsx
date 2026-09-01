import type { ReactNode } from 'react';
import { useConsensusTime, useNetwork } from '@/hooks';
import { formatNumber } from '@/utils/formatters';

/**
 * `YYYY-MM-DD HH:MM:SS` in UTC, built from the UTC accessors rather than
 * toLocaleString so the reading is identical in every locale and time zone —
 * the whole point of showing UTC next to a slot number is that two people
 * comparing screens see the same string.
 */
function formatUtc(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    ` ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

function Field({
  label,
  value,
  suffix,
  title,
  testId,
}: {
  label: string;
  value: string;
  /**
   * Trailing context rendered dimmed, e.g. "of 7,140". Kept outside the test id
   * so a test reading the value gets the figure alone.
   */
  suffix?: string;
  title?: string;
  testId?: string;
}): ReactNode {
  return (
    <span className="whitespace-nowrap" {...(title ? { title } : {})}>
      <span className="text-muted-foreground">{label} = </span>
      <span
        className="font-mono tabular-nums text-foreground"
        {...(testId ? { 'data-testid': testId } : {})}
      >
        {value}
      </span>
      {suffix && <span className="text-muted-foreground"> {suffix}</span>}
    </span>
  );
}

/**
 * App-wide strip showing the wall clock in UTC beside the selected network's
 * consensus time — the absolute slot and the epoch/slot pair that
 * `mina client status` prints as "Consensus time now".
 *
 * This is deliberately *not* the best tip's epoch/slot (which the homepage's
 * Epoch card shows): consensus time is derived from the clock, so it keeps
 * advancing through empty slots and tells you at a glance whether the chain is
 * keeping up with the schedule.
 *
 * Mounted once in Layout, above the routed content, so its timers survive
 * navigation and only one poll is ever in flight.
 */
export function ConsensusTimeBar(): ReactNode {
  const { network } = useNetwork();
  const { consensusTime, now, loading } = useConsensusTime();

  // The absolute count shown is the since-hard-fork slot, because it is the one
  // that reconciles with the epoch/slot beside it
  // (globalSlot === epoch * slotsPerEpoch + slot). The since-genesis count spans
  // forks and so cannot satisfy that identity; it goes in the tooltip.
  const slotsTitle =
    consensusTime && consensusTime.globalSlotSinceGenesis !== null
      ? `Absolute slot since the last hard fork. Since genesis: ${formatNumber(
          consensusTime.globalSlotSinceGenesis,
        )}`
      : 'Absolute slot since the last hard fork';

  return (
    <div
      // bg-secondary, not bg-muted: --muted is a 45%-grey *foreground* token
      // here (it equals --muted-foreground), so using it as a surface paints a
      // heavy grey band. --secondary is the surface tint, as in PriceDisplay.
      className="border-b border-border bg-secondary/60"
      data-testid="consensus-time-bar"
    >
      <div className="container mx-auto flex flex-col gap-y-1 px-4 py-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <span className="whitespace-nowrap">
          <span className="text-muted-foreground">Time now (UTC) </span>
          <time
            dateTime={new Date(now).toISOString()}
            className="font-mono tabular-nums text-foreground"
            data-testid="utc-clock"
          >
            {formatUtc(now)}
          </time>
        </span>

        <span className="hidden h-3 w-px shrink-0 bg-border sm:block" />

        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="whitespace-nowrap text-muted-foreground">
            Consensus time now
            <span className="ml-1 text-muted-foreground/70">
              ({network.displayName})
            </span>
          </span>

          {consensusTime ? (
            <>
              <Field
                label="slots"
                value={formatNumber(consensusTime.globalSlot)}
                title={slotsTitle}
                testId="consensus-global-slot"
              />
              <Field
                label="epoch"
                value={formatNumber(consensusTime.epoch)}
                testId="consensus-epoch"
              />
              <Field
                label="slot"
                value={formatNumber(consensusTime.slot)}
                suffix={`of ${formatNumber(consensusTime.slotsPerEpoch)}`}
                title="Slot within the current epoch"
                testId="consensus-slot"
              />
            </>
          ) : (
            <span
              className="text-muted-foreground/70"
              data-testid="consensus-time-status"
            >
              {loading ? 'loading…' : 'unavailable'}
            </span>
          )}
        </span>

        {consensusTime?.chainStartTime != null && (
          <>
            <span className="hidden h-3 w-px shrink-0 bg-border sm:block" />
            <span
              className="whitespace-nowrap"
              title="Genesis of the current chain. The slots above are counted from here, so they restart at every hard fork."
            >
              <span className="text-muted-foreground">
                Chain start timestamp (since last fork){' '}
              </span>
              <time
                dateTime={new Date(consensusTime.chainStartTime).toISOString()}
                className="font-mono tabular-nums text-foreground"
                data-testid="chain-start"
              >
                {formatUtc(consensusTime.chainStartTime)}
              </time>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

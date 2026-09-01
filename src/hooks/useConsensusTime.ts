import { useEffect, useMemo, useState } from 'react';
import {
  fetchConsensusTime,
  type ConsensusTimeAnchor,
} from '@/services/api/daemon';
import { useNetwork } from './useNetwork';
import { useRequestGeneration } from './useRequestGeneration';

/**
 * How often the daemon is re-read. The slot number is advanced locally from the
 * last reading, so a poll only has to correct clock drift and pick up new
 * constants after a hard fork — one request a minute rather than one a second.
 */
const RESYNC_INTERVAL_MS = 60_000;

/** How often the displayed clock advances. */
const TICK_INTERVAL_MS = 1_000;

export interface ConsensusTime {
  /** Epoch and slot-within-epoch — the pair `mina client status` prints. */
  epoch: number;
  slot: number;
  /** Absolute slot since the last hard fork; equals `epoch * slotsPerEpoch + slot`. */
  globalSlot: number;
  /** Absolute slot since the original genesis, or null if the daemon has no best tip. */
  globalSlotSinceGenesis: number | null;
  /** Slots in an epoch — read from the daemon rather than assumed to be 7140. */
  slotsPerEpoch: number;
  /**
   * Unix ms of the genesis the slots above are counted from, or null if the
   * daemon's timestamp could not be parsed.
   */
  chainStartTime: number | null;
}

export interface UseConsensusTimeResult {
  /** Null until the first successful read, and while a network switch is in flight. */
  consensusTime: ConsensusTime | null;
  /** Browser wall clock as unix ms, refreshed on the same tick as the slot. */
  now: number;
  loading: boolean;
}

/**
 * The daemon's reading vouches for the slot it believed was current when it
 * answered, and for that slot's time window. If this browser's clock does not
 * land inside that window, the clock is wrong (or the response sat in flight
 * longer than a slot), so shift it to the nearest edge. Local ticking then
 * advances from a slot the daemon actually confirmed rather than from a clock
 * that may be minutes off — and the next resync re-corrects it anyway.
 */
function clockSkew(anchor: ConsensusTimeAnchor): number {
  if (anchor.receivedAt < anchor.slotStartTime) {
    return anchor.slotStartTime - anchor.receivedAt;
  }
  if (anchor.receivedAt >= anchor.slotEndTime) {
    return anchor.slotEndTime - 1 - anchor.receivedAt;
  }
  return 0;
}

/**
 * Wall-clock consensus time for the selected network, ticking every second.
 *
 * Unlike `useEpochInfo`, which reports the epoch/slot of the chain's best tip,
 * this is the slot the network is *in right now* — it keeps advancing through
 * empty slots and while block production is stalled, which is what
 * `mina client status` reports as "Consensus time now".
 *
 * Intended for a single mount (the app-wide consensus bar). Each instance arms
 * its own timers, so a second consumer doubles the polling; if this ever needs
 * more than one consumer, promote it to a provider the way PriceContext was.
 */
export function useConsensusTime(): UseConsensusTimeResult {
  const { network } = useNetwork();
  const gen = useRequestGeneration();
  const [anchor, setAnchor] = useState<ConsensusTimeAnchor | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    // Drop the previous network's reading immediately: an explorer must never
    // render one network's slot under another network's label (issue #66), and
    // the generation token discards any poll still in flight for the old one.
    setAnchor(null);
    setLoading(true);

    let cancelled = false;
    const load = async (): Promise<void> => {
      const token = gen.next();
      const data = await fetchConsensusTime();
      if (cancelled || !gen.isCurrent(token)) return;
      // A failed poll keeps the last good reading rather than blanking the bar;
      // local ticking stays correct for far longer than one missed resync.
      if (data) setAnchor(data);
      setLoading(false);
    };

    void load();
    const resync = setInterval(() => void load(), RESYNC_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(resync);
    };
  }, [network.id, gen]);

  const consensusTime = useMemo<ConsensusTime | null>(() => {
    if (!anchor) return null;
    const elapsed = Math.max(0, now + clockSkew(anchor) - anchor.slotStartTime);
    const globalSlot =
      anchor.globalSlot + Math.floor(elapsed / anchor.slotDuration);
    return {
      epoch: Math.floor(globalSlot / anchor.slotsPerEpoch),
      slot: globalSlot % anchor.slotsPerEpoch,
      globalSlot,
      globalSlotSinceGenesis:
        anchor.forkOffset === null ? null : globalSlot + anchor.forkOffset,
      slotsPerEpoch: anchor.slotsPerEpoch,
      chainStartTime: Number.isFinite(anchor.chainStartTime)
        ? anchor.chainStartTime
        : null,
    };
  }, [anchor, now]);

  return { consensusTime, now, loading };
}

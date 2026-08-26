/**
 * mina-explorer-api REST transport.
 *
 * A second read backend alongside the Archive-Node-API GraphQL client. Where the archive
 * is a schema that varies by deployment — which is why `blocks.ts` and `transactions.ts`
 * carry FULL/BASIC/MINIMAL degradation, nested/FLAT/BASIC zkApp tiering and the
 * `bestChainFilter` support probe — this backend is ONE pinned, versioned contract with a
 * published compatibility matrix. So code that reads through here does not tier, does not
 * sniff error strings, and does not keep a per-endpoint capability allowlist.
 *
 * ## The endpoint is a PROXY, and that is load-bearing
 *
 * mina-explorer-api requires an `x-api-key` header on every route. This app is a static
 * bundle on GitHub Pages: anything shipped to the browser is readable from the network tab,
 * so the key CANNOT live here. `restEndpoint` therefore points at a small reverse proxy that
 * holds the key server-side and forwards to the API.
 *
 * Consequences worth stating, because "just add the header here" is the obvious wrong turn:
 *
 * - **No credential is ever set in this module.** If you find yourself adding one, the
 *   design has been misread — put it in the proxy.
 * - Requests stay header-free beyond `Accept`, which also keeps them CORS-simple and avoids
 *   a preflight on every call.
 * - Abuse is bounded by the API key's own per-minute limit, which is a global cap precisely
 *   because nobody but the proxy holds the key, plus caching at the proxy.
 *
 * `restEndpoint` includes the network path segment (e.g. `.../mina-mesa`) rather than being
 * a bare host, so there is no second id-mapping table to keep in sync with `networks.ts` —
 * this app's ids (`mesa`, `devnet`, `mainnet`) are not the API's (`mina-mesa`, `mina-devnet`,
 * `mina-mainnet`), and a mapping table is a thing that goes stale silently.
 *
 * The endpoint is held in a module-level singleton set from NetworkContext, mirroring
 * `daemon.ts` exactly — see the note at daemon.ts:3-12 for why that is deliberate (#88).
 */

import { ApiError } from './client';
import { fetchWithTimeout } from './http';
import type { BlockSummary } from '../../types/block';

let restEndpoint: string | null = null;

/** Set the active REST base URL (including the network segment), or clear it. */
export function setRestEndpoint(endpoint: string | null | undefined): void {
  restEndpoint = endpoint ?? null;
}

export function getRestEndpoint(): string | null {
  return restEndpoint;
}

/**
 * Whether the active network has a REST backend configured.
 *
 * Callers use this to choose a backend, so it is the ONLY switch: a network without a
 * `restEndpoint` keeps the archive path untouched. That is what makes this rollout
 * per-network and reversible by config rather than by a redeploy.
 */
export function restAvailable(): boolean {
  return restEndpoint !== null && restEndpoint !== '';
}

async function getJson<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  if (!restEndpoint) {
    throw new ApiError('REST endpoint not configured');
  }
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  const url = `${restEndpoint.replace(/\/$/, '')}${path}?${query.toString()}`;

  const response = await fetchWithTimeout(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    // The API's error bodies are `{"error": "..."}`; fall back to the status line when the
    // body is absent or unparseable (a 406 is served with ZERO bytes by contract).
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) detail = body.error;
    } catch {
      /* keep the status-line detail */
    }
    throw new ApiError(`mina-explorer-api: ${detail}`);
  }
  return (await response.json()) as T;
}

/** One item of `GET /{network}/v1/blocks`. Only the fields this app consumes. */
interface RestBlockListItem {
  blockHeight: number;
  stateHash: string;
  accountAddress: string | null;
  timestamp: number;
  isCanonical: boolean;
  coinbase: number | null;
  transactionsCount: number | null;
  epoch: number | null;
  slot: number | null;
  globalSlotSinceGenesis: number | null;
}

/** The Envelope-A page wrapper (`data`-keyed, with `totalCount`). */
interface RestPage<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  totalCount?: number;
}

/**
 * A MINA decimal amount -> the nanomina string this app carries internally.
 *
 * THE TWO SIDES DISAGREE ON UNITS, and nothing in the type system says so — both are
 * "a number that means an amount":
 *
 * - mina-explorer-api converts to a MINA double at its response boundary (its rule R6), so
 *   a 720 MINA coinbase arrives as `720.0`.
 * - This app carries nanomina end to end. `BlockSummary.coinbase` is a nanomina STRING, and
 *   `formatMina` — via `Amount` — divides by 1e9 to display it.
 *
 * Handing the MINA value straight through therefore renders 720 MINA as `0.00000072 MINA`.
 * That is not a hypothetical: it is what this mapper did when first written, and it is
 * invisible in review because the mapping line reads perfectly sensibly.
 *
 * Converted via `toFixed(9)` and BigInt arithmetic rather than `Math.round(value * 1e9)`.
 * The multiply agrees on every amount this endpoint currently returns — it was checked, not
 * assumed — but it is a binary float operation on a decimal quantity, so its exactness is a
 * property of the inputs rather than of the code. Coinbase is small and safe today;
 * transaction fees and account balances are the same MINA-double convention and are not.
 * The decimal-string route does not depend on the magnitude at all.
 */
function minaToNanominaString(mina: number): string {
  const [whole, frac = ''] = Math.abs(mina).toFixed(9).split('.');
  const nanomina = BigInt(whole) * 1_000_000_000n + BigInt(frac.padEnd(9, '0'));
  return `${mina < 0 ? '-' : ''}${nanomina}`;
}

/**
 * A REST block-list item -> this app's `BlockSummary`.
 *
 * Two conversions and one deliberate omission:
 *
 * - `timestamp` is epoch MILLISECONDS; `dateTime` is an ISO string everywhere in this app.
 * - `coinbase` arrives as a MINA double and is converted BACK to a nanomina string — see
 *   `minaToNanominaString` for why that round trip is required rather than redundant.
 * - `txFees` / `snarkFees` are NOT SET. The block-list DTO does not carry them, and nothing
 *   renders them in a list — `BlockDetail.tsx:155,159` is the only consumer and it already
 *   guards with `|| '0'`. They are left undefined rather than defaulted to '0' on purpose:
 *   a fabricated zero is indistinguishable from a real zero-fee block, and inventing values
 *   is precisely what this migration must not do. The block DETAIL endpoint does carry them
 *   (`transactionsFee`, `snarkersFee`) for when that surface moves.
 */
export function mapRestBlockToSummary(item: RestBlockListItem): BlockSummary {
  const summary: BlockSummary = {
    blockHeight: item.blockHeight,
    stateHash: item.stateHash,
    creator: item.accountAddress ?? '',
    dateTime: new Date(item.timestamp).toISOString(),
    canonical: item.isCanonical,
  };
  if (item.transactionsCount !== null)
    summary.transactionCount = item.transactionsCount;
  if (item.coinbase !== null)
    summary.coinbase = minaToNanominaString(item.coinbase);
  if (item.epoch !== null) summary.epoch = item.epoch;
  if (item.slot !== null) summary.slot = item.slot;
  if (item.globalSlotSinceGenesis !== null)
    summary.slotSinceGenesis = item.globalSlotSinceGenesis;
  return summary;
}

/**
 * The most recent blocks on the best chain.
 *
 * ## `type: ALL` — and why `CANONICAL` is the trap
 *
 * The API's `type` values do NOT mean what the names suggest to someone arriving from the
 * archive:
 *
 * - `ALL` is **the best-chain window**, live tip included. It is not "everything":
 *   orphaned siblings are not in it.
 * - `CANONICAL` is the **k-FINALIZED** prefix (`blockHeight <= canonicalMaxBlockHeight`).
 *   k is 290 blocks on Mina, so this list *starts* 290 blocks below the tip. Measured
 *   against production: 14 h behind on mesa, 13 h on devnet, **35 h behind on mainnet**.
 *   As the front page's "latest blocks" that is the wrong list, and wrong in the quiet
 *   way — every row real and correctly rendered, the whole page just a day and a half
 *   stale. This shipped as `CANONICAL` and was caught before any network was flipped on.
 * - `ORPHANED` is the off-chain siblings.
 *
 * `ALL` is therefore the faithful replacement for what the archive path returns here
 * (`fetchBlocks` asks for the latest blocks with `bestChainOnly: false`).
 *
 * The canonicality badge survives the swap because both backends derive the flag the SAME
 * way — `blockHeight <= canonicalMaxBlockHeight`: the API in its block-list mapper (its
 * rule R5), this app in `heightChainStatus`. Blocks above the canonical max arrive with
 * `isCanonical: false` and render as pending, exactly as they do today.
 *
 * None of this needs a support probe, unlike the archive's `inBestChain` — which some
 * deployments reject and which this app has to sniff for at runtime
 * (`bestChainFilter.ts`). That is the point of the swap.
 *
 * `size` is capped at 50 by the API, which silently returns 50 rather than erroring, so a
 * caller wanting more has to page.
 */
export async function fetchBlocksRest(
  limit: number = 25,
): Promise<BlockSummary[]> {
  const page = await getJson<RestPage<RestBlockListItem>>('/v1/blocks', {
    page: 0,
    size: limit,
    sortBy: 'HEIGHT',
    orderBy: 'DESC',
    type: 'ALL',
  });
  return page.data.map(mapRestBlockToSummary);
}

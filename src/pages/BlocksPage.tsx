import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CornerDownLeft,
} from 'lucide-react';
import { usePaginatedBlocks, useNetwork } from '@/hooks';
import { BlockList } from '@/components/blocks';
import { SegmentedControl, type SegmentedOption } from '@/components/common';
import { restAvailable, type BlockFilter } from '@/services/api';
import { getStoredItem, setStoredItem } from '@/lib/safeStorage';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/formatters';
import { generatePageNumbers } from '@/utils/pagination';

const PAGE_SIZE_KEY = 'mina-explorer-blocks-page-size';
const FILTER_KEY = 'mina-explorer-blocks-filter';

/**
 * 25 was the old fixed size and is deliberately not on this list — a size the menu cannot
 * show is a size the user cannot get back to. 20 is its nearest neighbour and the default.
 *
 * 100 and 200 exceed the API's `size` ceiling of 50 and are stitched from several requests
 * in `fetchBlocksRangeRest`; nothing here needs to know that.
 */
const PAGE_SIZE_OPTIONS: readonly SegmentedOption<number>[] = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
];

const DEFAULT_PAGE_SIZE = 20;

const FILTER_OPTIONS: readonly SegmentedOption<BlockFilter>[] = [
  { value: 'all', label: 'All', title: 'Every block, forks included' },
  {
    value: 'canonical',
    label: 'Canonical',
    title:
      'Finalized blocks only — excludes fork siblings and the unfinalized tip',
  },
  {
    value: 'orphaned',
    label: 'Non-canonical',
    title: 'Fork siblings and blocks not yet finalized',
  },
];

function readStoredPageSize(): number {
  const saved = Number(getStoredItem(PAGE_SIZE_KEY));
  return PAGE_SIZE_OPTIONS.some(o => o.value === saved)
    ? saved
    : DEFAULT_PAGE_SIZE;
}

function readStoredFilter(): BlockFilter {
  const saved = getStoredItem(FILTER_KEY);
  return FILTER_OPTIONS.some(o => o.value === saved)
    ? (saved as BlockFilter)
    : 'all';
}

export function BlocksPage(): ReactNode {
  const { network } = useNetwork();
  const [pageSize, setPageSize] = useState(readStoredPageSize);
  const [filter, setFilter] = useState<BlockFilter>(readStoredFilter);

  // Offset-addressed reads are a REST capability. On an archive-backed network — in
  // practice only a custom endpoint — the filter cannot be expressed faithfully and there
  // is no offset to seek, so those two controls are not offered rather than offered and
  // quietly ignored. Read at render time: `restAvailable()` is a module singleton that
  // NetworkContext sets before this renders, and `network.id` re-runs this component.
  const canSeek = restAvailable();
  const effectiveFilter: BlockFilter = canSeek ? filter : 'all';

  const {
    blocks,
    loading,
    error,
    page,
    totalPages,
    totalBlocks,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    jumpToHeight,
    jumping,
  } = usePaginatedBlocks({ pageSize, filter: effectiveFilter });

  useEffect(() => {
    setStoredItem(PAGE_SIZE_KEY, String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    setStoredItem(FILTER_KEY, filter);
  }, [filter]);

  const busy = loading || jumping;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blocks</h1>
          {totalBlocks > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatNumber(totalBlocks)} total blocks on {network.displayName}
            </p>
          )}
        </div>
        <button
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent',
            busy && 'opacity-50',
          )}
          onClick={refresh}
          disabled={busy}
        >
          <RefreshCw size={16} className={cn(busy && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {canSeek && (
            <SegmentedControl
              label="Show:"
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
              disabled={busy}
              data-testid="blocks-filter"
            />
          )}
          <SegmentedControl
            label="Rows:"
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={setPageSize}
            disabled={busy}
            data-testid="blocks-page-size"
          />
        </div>
        {canSeek && (
          <GoToHeight
            onJump={jumpToHeight}
            disabled={busy}
            totalBlocks={totalBlocks}
          />
        )}
      </div>

      {filter === 'canonical' && canSeek && (
        <p className="text-sm text-muted-foreground">
          Canonical blocks are finalized after 290 confirmations, so the newest
          block here is roughly 290 blocks behind the chain tip.
        </p>
      )}

      <BlockList blocks={blocks} loading={busy} error={error} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <PageJump
            page={page}
            totalPages={totalPages}
            onGo={goToPage}
            disabled={busy}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={page === 1 || busy}
              className={cn(
                'p-2 rounded-md transition-colors',
                page === 1 || busy
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              title="First page"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={prevPage}
              disabled={page === 1 || busy}
              className={cn(
                'p-2 rounded-md transition-colors',
                page === 1 || busy
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page numbers */}
            <div className="hidden items-center gap-1 px-2 sm:flex">
              {generatePageNumbers(page, totalPages).map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum as number)}
                    disabled={busy}
                    className={cn(
                      'min-w-[32px] h-8 px-2 rounded-md text-sm transition-colors',
                      pageNum === page
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent',
                    )}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={nextPage}
              disabled={page === totalPages || busy}
              className={cn(
                'p-2 rounded-md transition-colors',
                page === totalPages || busy
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages || busy}
              className={cn(
                'p-2 rounded-md transition-colors',
                page === totalPages || busy
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              title="Last page"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  'h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50';

/**
 * "Page [N] of M", with N editable.
 *
 * The page number was already printed here; making it an input is the whole control, so
 * jumping to page 8 432 costs no chrome the page did not already have. It stays a
 * controlled-on-blur field rather than a live one — typing "1" on the way to "1234" must
 * not fire a fetch for page 1.
 */
function PageJump({
  page,
  totalPages,
  onGo,
  disabled,
}: {
  page: number;
  totalPages: number;
  onGo: (page: number) => void;
  disabled: boolean;
}): ReactNode {
  const [draft, setDraft] = useState(String(page));

  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const commit = useCallback(() => {
    const parsed = Number(draft);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages) {
      onGo(parsed);
    } else {
      setDraft(String(page));
    }
  }, [draft, onGo, page, totalPages]);

  return (
    <form
      className="flex items-center gap-2 text-sm text-muted-foreground"
      onSubmit={e => {
        e.preventDefault();
        commit();
      }}
    >
      <label htmlFor="blocks-page-number">Page</label>
      <input
        id="blocks-page-number"
        data-testid="blocks-page-number"
        type="text"
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        onChange={e => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={commit}
        aria-label={`Page number, 1 to ${totalPages}`}
        className={cn(inputClass, 'w-20 text-center font-mono')}
      />
      <span>of {formatNumber(totalPages)}</span>
    </form>
  );
}

/**
 * Jump to the page holding a block height, with that height at the page's midpoint.
 *
 * Distinct from the header search box, which opens the block's own detail page. This one
 * keeps you in the list — the point is to read the blocks either side of it.
 */
function GoToHeight({
  onJump,
  disabled,
  totalBlocks,
}: {
  onJump: (height: number) => Promise<number | null>;
  disabled: boolean;
  totalBlocks: number;
}): ReactNode {
  const [draft, setDraft] = useState('');
  const [failed, setFailed] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const height = Number(draft);
    if (!Number.isInteger(height) || height < 1) {
      setFailed(true);
      return;
    }
    setFailed(false);
    const landed = await onJump(height);
    // A refusal is the common case under a filter that excludes the height — the hook will
    // not centre on a neighbouring block and call it a hit — so it needs to be SAID, not
    // just tinted. Without the message the page simply does not move and looks broken.
    if (landed === null) setFailed(true);
  };

  return (
    <form className="flex flex-col gap-1" onSubmit={submit}>
      <div className="flex items-center gap-2">
        <label
          htmlFor="blocks-goto-height"
          className="whitespace-nowrap text-sm text-muted-foreground"
        >
          Go to block:
        </label>
        <input
          id="blocks-goto-height"
          data-testid="blocks-goto-height"
          type="text"
          inputMode="numeric"
          placeholder="height"
          value={draft}
          disabled={disabled || totalBlocks === 0}
          aria-invalid={failed}
          onChange={e => {
            setDraft(e.target.value.replace(/[^\d]/g, ''));
            setFailed(false);
          }}
          className={cn(
            inputClass,
            'w-28 font-mono',
            failed && 'border-destructive focus:ring-destructive',
          )}
        />
        <button
          type="submit"
          disabled={disabled || totalBlocks === 0 || draft === ''}
          title="Jump to this block height"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CornerDownLeft size={14} />
          Go
        </button>
      </div>
      {failed && (
        <p
          data-testid="blocks-goto-error"
          className="text-xs text-destructive"
          role="status"
        >
          No block at that height in this list.
        </p>
      )}
    </form>
  );
}

const MINA_DECIMALS = 9;
const NANOMINA_PER_MINA = 10 ** MINA_DECIMALS;

export function formatMina(nanomina: string | number): string {
  const amount =
    typeof nanomina === 'string' ? BigInt(nanomina) : BigInt(nanomina);
  const mina = Number(amount) / NANOMINA_PER_MINA;
  return mina.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 9,
  });
}

export function formatHash(hash: string, prefixLength: number = 8): string {
  if (hash.length <= prefixLength * 2) {
    return hash;
  }
  return `${hash.slice(0, prefixLength)}...${hash.slice(-prefixLength)}`;
}

export function formatAddress(
  address: string,
  prefixLength: number = 8,
): string {
  return formatHash(address, prefixLength);
}

export function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString();
}

export function formatTimeAgo(dateTime: string): string {
  const date = new Date(dateTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return `${diffSecs}s ago`;
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function decodeMemo(memo: string): string {
  if (
    !memo ||
    memo === 'E4YM2vTHhWEg66xpj52JErHUBU4pZ1yageL4TVDDpTTSsv8mK6YaH'
  ) {
    return '';
  }

  try {
    // Mina memos are base58 encoded
    // The default empty memo has a specific hash
    const decoded = atob(memo);
    // Remove null bytes and control characters
    return decoded.replace(/[\x00-\x1F\x7F]/g, '').trim();
  } catch {
    return memo;
  }
}

export function isValidPublicKey(key: string): boolean {
  return key.startsWith('B62') && key.length === 55;
}

export function isValidBlockHash(hash: string): boolean {
  return hash.startsWith('3N') && hash.length >= 50;
}

export function isValidTransactionHash(hash: string): boolean {
  return hash.startsWith('Ckp') || hash.startsWith('5J');
}

export function isBlockHeight(value: string): boolean {
  return /^\d+$/.test(value);
}

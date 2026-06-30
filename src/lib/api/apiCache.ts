// Simple TTL-based in-memory cache shared across all data hooks.
// Prevents redundant API calls when navigating between pages.

interface CacheEntry {
  data: unknown;
  expires: number;
}

const store = new Map<string, CacheEntry>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs = 3 * 60 * 1000): void {
  store.set(key, { data, expires: Date.now() + ttlMs });
}

// Call after mutations (create/update/delete) to force the next read to re-fetch.
export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}

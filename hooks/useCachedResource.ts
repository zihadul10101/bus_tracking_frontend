import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ✅ Generic "cache-first, fetch-once, offline-fallback" হুক।
 */
export function useCachedResource<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  defaultValue: T,
  staleAfterMs: number = 5 * 60 * 1000 // 👈 NEW: bus/route ডেটা কম ঘন ঘন বদলায়, তাই default ৫ মিনিট
) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false); // 👈 NEW
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null); // 👈 NEW
  const mounted = useRef(true);

  const syncedAtKey = `${cacheKey}_synced_at`; // 👈 NEW

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadFromCache = useCallback(async () => {
    try {
      const [cached, syncedAt] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(syncedAtKey), // 👈 NEW
      ]);

      if (cached && mounted.current) {
        try {
          setData(JSON.parse(cached));
          setIsFromCache(true); // 👈 NEW
          setLastSyncedAt(syncedAt ? parseInt(syncedAt, 10) : null); // 👈 NEW
        } catch {
          console.log(`🛡️ useCachedResource: corrupted cache for ${cacheKey}, ignoring`);
        }
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [cacheKey, syncedAtKey]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const fresh = await fetcher();
      const now = Date.now(); // 👈 NEW
      if (mounted.current) {
        setData(fresh);
        setError(null);
        setIsFromCache(false); // 👈 NEW — fresh network data, cached badge সরে যাবে
        setLastSyncedAt(now); // 👈 NEW
      }
      await AsyncStorage.multiSet([
        [cacheKey, JSON.stringify(fresh)],
        [syncedAtKey, String(now)], // 👈 NEW
      ]);
    } catch (err: any) {
      console.log(`🛡️ useCachedResource: refresh failed for ${cacheKey}`, err?.message);
      if (mounted.current) setError(err?.message || 'Could not refresh data');
      // ✅ fail করলে isFromCache যা ছিল তাই থাকবে — cached data অক্ষত থাকবে
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [cacheKey, syncedAtKey, fetcher]);

  useEffect(() => {
    (async () => {
      await loadFromCache();
      refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // 👈 NEW: cache কতটা পুরনো
  const isStale = lastSyncedAt ? Date.now() - lastSyncedAt > staleAfterMs : false;

  return { data, setData, loading, refreshing, error, refresh, isFromCache, isStale, lastSyncedAt };
}
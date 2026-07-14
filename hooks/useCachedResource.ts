import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ✅ Generic "cache-first, fetch-once, offline-fallback" হুক।
 *
 * যেকোনো ডেটা টাইপের জন্য (notices, research, bus list, ইত্যাদি) ব্যবহার করা যায় —
 * AppContext এ প্রতিটা resource এর জন্য আলাদা useState + AsyncStorage
 * বয়লারপ্লেট লেখার দরকার নেই।
 *
 * ফ্লো:
 * ১. mount হওয়ার সাথে সাথে cache থেকে instant দেখায় (offline হলেও কাজ করে)
 * ২. ব্যাকগ্রাউন্ডে fetcher() কল করে fresh ডেটা আনে
 * ৩. সফল হলে state + cache দুটোই আপডেট
 * ৪. fail করলে (অফলাইন/সার্ভার ডাউন) silently আগের cached data ই থেকে যায়
 */
export function useCachedResource<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  defaultValue: T
) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true); // শুধু প্রথম cache-read এর জন্য
  const [refreshing, setRefreshing] = useState(false); // ব্যাকগ্রাউন্ড network fetch এর জন্য
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached && mounted.current) {
        try {
          setData(JSON.parse(cached));
        } catch {
          console.log(`🛡️ useCachedResource: corrupted cache for ${cacheKey}, ignoring`);
        }
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [cacheKey]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const fresh = await fetcher();
      if (mounted.current) {
        setData(fresh);
        setError(null);
      }
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fresh));
    } catch (err: any) {
      // ✅ silent fail — cached data ই থেকে যাবে, UI তে error দেখানো বাধ্যতামূলক না
      console.log(`🛡️ useCachedResource: refresh failed for ${cacheKey}`, err?.message);
      if (mounted.current) setError(err?.message || 'Could not refresh data');
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [cacheKey, fetcher]);

  useEffect(() => {
    (async () => {
      await loadFromCache(); // ১. cache থেকে instant দেখাও
      refresh();             // ২. ব্যাকগ্রাউন্ডে fresh ডেটা আনো
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { data, setData, loading, refreshing, error, refresh };
}
import { busService } from '@/src/services/busService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Stop { stopName: string; time: string | null; sequence: number; }
export interface LiveTripData {
  _id: string; busNo: string; busName: string; tripTitle: string; days: string[];
  from?: { stop: string; time: string } | null; to?: { stop: string; time: string } | null; stops: Stop[];
}
export interface ApiResponseData { running: LiveTripData[]; future: LiveTripData[]; completed: LiveTripData[]; }

const EMPTY_TRIPS: ApiResponseData = { running: [], future: [], completed: [] };

// ✅ NEW: cache keys
const STORAGE_KEY = '@live_trips_categorized';
const STORAGE_KEY_SYNCED_AT = '@live_trips_categorized_synced_at';

// Live trip ডেটা কতক্ষণ পর্যন্ত "তাজা" ধরা হবে — এর বেশি পুরনো হলে UI-তে stale বলে চিহ্নিত হবে
const LIVE_TRIPS_STALE_MS = 90 * 1000;

function safeParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.log('🛡️ useLiveTrips: Corrupted cache entry, ignoring:', e);
    return null;
  }
}

export function useLiveTrips() {
  const [liveTrips, setLiveTrips] = useState<ApiResponseData>(EMPTY_TRIPS);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false); // 👈 NEW
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null); // 👈 NEW

  // ✅ NEW: অ্যাপ খোলার সাথে সাথেই (নেটওয়ার্কের অপেক্ষা না করে) cached ডেটা দেখানো
  const loadCachedTrips = useCallback(async () => {
    try {
      const [savedTrips, savedSyncedAt] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(STORAGE_KEY_SYNCED_AT),
      ]);

      const parsed = safeParse<ApiResponseData>(savedTrips);
      const syncedAt = savedSyncedAt ? parseInt(savedSyncedAt, 10) : null;

      if (parsed) {
        setLiveTrips(parsed);
        setIsFromCache(true);
        setLastSyncedAt(syncedAt);
        setLoading(false); // cache থাকলে সাথে সাথেই দেখাও, spinner দেখানোর দরকার নেই
        console.log('📦 useLiveTrips: Loaded from cache —', 
          parsed.running.length, 'running,', parsed.future.length, 'future,',
          parsed.completed.length, 'completed. Synced at:', syncedAt ? new Date(syncedAt).toLocaleTimeString() : 'unknown');
      }
    } catch (err) {
      console.log('🛡️ useLiveTrips: Failed to load cache:', err);
    }
  }, []);

  const fetchLiveTrips = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    // ✅ FIX: cache থেকে ইতিমধ্যে ডেটা দেখানো থাকলে full-page loading spinner দেখাবো না,
    // শুধু background-এ silently refresh হবে
    else if (!isFromCache) setLoading(true);

    setError(null);
    try {
      const result = await busService.getLiveTrips();
      if (result.success) {
        setLiveTrips(result.data);
        setIsFromCache(false);

        // ✅ NEW: fresh ডেটা এলে cache-এ সেভ করা + sync timestamp আপডেট
        const now = Date.now();
        setLastSyncedAt(now);
        await AsyncStorage.multiSet([
          [STORAGE_KEY, JSON.stringify(result.data)],
          [STORAGE_KEY_SYNCED_AT, String(now)],
        ]);
        console.log('✅ useLiveTrips: Cached fresh data at', new Date(now).toLocaleTimeString());
      } else {
        setError(result.message || 'ডাটা লোড করতে ব্যর্থ হয়েছে');
        // ✅ FIX: fail করলে পুরনো cached liveTrips মুছে ফেলা হচ্ছে না — যা আছে তাই থাকবে UI-তে
      }
    } catch (err: any) {
      console.log('Live Trip Fetch Error:', err);
      setError(err.message || 'সার্ভারে কানেক্ট করা যাচ্ছে না। ওয়াইফাই বা আইপি চেক করুন।');
      // ✅ FIX: নেটওয়ার্ক error হলেও state খালি করা হচ্ছে না — cached trips (যদি থাকে) দেখতেই থাকবে
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isFromCache]);

  useEffect(() => {
    loadCachedTrips().then(() => {
      fetchLiveTrips(); // cache লোড হওয়ার পরপরই background-এ fresh ডেটার জন্য কল
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCounts = {
    running: liveTrips.running.length,
    future: liveTrips.future.length,
    completed: liveTrips.completed.length,
  };

  // ✅ NEW: cache কতটা পুরনো তা বোঝার জন্য
  const isStale = lastSyncedAt ? Date.now() - lastSyncedAt > LIVE_TRIPS_STALE_MS : false;

  return {
    liveTrips,
    loading,
    refreshing,
    error,
    currentCounts,
    refetch: fetchLiveTrips,
    isFromCache,   // 👈 UI চাইলে "cached data দেখাচ্ছে" ব্যাজ দেখাতে পারবে
    isStale,       // 👈 UI চাইলে "আপডেট হচ্ছে..." দেখাতে পারবে
    lastSyncedAt,
  };
}
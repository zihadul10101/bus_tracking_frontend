import { busService } from '@/src/services/busService';
import { useCallback, useEffect, useState } from 'react';


export interface Stop { stopName: string; time: string | null; sequence: number; }
export interface LiveTripData {
  _id: string; busNo: string; busName: string; tripTitle: string; days: string[];
  from?: { stop: string; time: string } | null; to?: { stop: string; time: string } | null; stops: Stop[];
}
export interface ApiResponseData { running: LiveTripData[]; future: LiveTripData[]; completed: LiveTripData[]; }

export function useLiveTrips() {
  const [liveTrips, setLiveTrips] = useState<ApiResponseData>({ running: [], future: [], completed: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveTrips = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      // ✅ using busService instead of raw fetch — handles auth headers + non-JSON responses
      const result = await busService.getLiveTrips();
      if (result.success) {
        setLiveTrips(result.data);
      } else {
        setError(result.message || 'ডাটা লোড করতে ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      console.log('Live Trip Fetch Error:', err);
      setError(err.message || 'সার্ভারে কানেক্ট করা যাচ্ছে না। ওয়াইফাই বা আইপি চেক করুন।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTrips();
  }, [fetchLiveTrips]);

  const currentCounts = {
    running: liveTrips.running.length,
    future: liveTrips.future.length,
    completed: liveTrips.completed.length,
  };

  return {
    liveTrips,
    loading,
    refreshing,
    error,
    currentCounts,
    refetch: fetchLiveTrips,
  };
}
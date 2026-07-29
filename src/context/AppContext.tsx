import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { busService, Trip } from '../services/busService';

export interface AppContextType {
  user: any;
  currentTrips: Trip[];
  liveTrips: Trip[];
  busList: any[];
  loading: boolean;
  isLiveTripsSyncing: boolean; // 👈 NEW: LiveTabFilter-এ spinner/badge দেখানোর জন্য
  isLiveTripsStale: boolean;   // 👈 NEW: cache পুরনো হলে UI-তে "syncing..." দেখাতে পারবে
  isAuthenticated: boolean;
  login: (userData: any, token: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const STORAGE_KEYS = {
  TOKEN: 'userToken',
  ROLE: 'userRole',
  USER: 'userData',
  EXPIRES_AT: 'tokenExpiresAt',
  CURRENT_TRIPS: '@current_trips',
  LIVE_TRIPS: '@live_trips',
  LIVE_TRIPS_SYNCED_AT: '@live_trips_synced_at', // 👈 NEW: liveTrips কতক্ষণ আগে sync হয়েছে
  BUS_LIST: '@all_bus_list',
} as const;

const FALLBACK_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

// ✅ NEW: liveTrips ক্যাশ এই সময়ের বেশি পুরনো হলে "stale" ধরা হবে।
// Live trip মানেই real-time ডেটা — ৯০ সেকেন্ডের বেশি পুরনো cache trust করা উচিত না,
// কারণ ততক্ষণে ট্রিপ শেষ হয়ে যেতে পারে backend-এ।
const LIVE_TRIPS_STALE_MS = 90 * 1000;

function safeParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    //console.log('🛡️ AppContext: Corrupted cache entry, ignoring:', e);
    return null;
  }
}

function getTokenExpiryMs(token: string): number | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';

    const decoded =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8');

    const payload = JSON.parse(decoded);

    if (payload?.exp && typeof payload.exp === 'number') {
      return payload.exp * 1000;
    }
    return null;
  } catch (e) {
   // console.log('🛡️ AppContext: Could not decode token exp, will use fallback:', e);
    return null;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [currentTrips, setCurrentTrips] = useState<Trip[]>([]);
  const [liveTrips, setLiveTrips] = useState<Trip[]>([]);
  const [busList, setBusList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveTripsSyncing, setIsLiveTripsSyncing] = useState<boolean>(false); // NEW
  const [isLiveTripsStale, setIsLiveTripsStale] = useState<boolean>(false);     // NEW

  useEffect(() => {
    loadAllOfflineData();
  }, []);

  const loadAllOfflineData = async () => {
    try {
      const [
        savedUser,
        savedExpiresAt,
        savedCurrentTrips,
        savedLiveTrips,
        savedLiveSyncedAt,
        savedBusList,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.EXPIRES_AT),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRIPS),
        AsyncStorage.getItem(STORAGE_KEYS.LIVE_TRIPS),
        AsyncStorage.getItem(STORAGE_KEYS.LIVE_TRIPS_SYNCED_AT), // NEW
        AsyncStorage.getItem(STORAGE_KEYS.BUS_LIST),
      ]);

      const parsedUser = safeParse<any>(savedUser);
      const parsedCurrentTrips = safeParse<Trip[]>(savedCurrentTrips);
      const parsedLiveTrips = safeParse<Trip[]>(savedLiveTrips);
      const parsedBusList = safeParse<any[]>(savedBusList);

      const expiresAt = savedExpiresAt ? parseInt(savedExpiresAt, 10) : 0;
      const isExpired = !expiresAt || Date.now() > expiresAt;

      if (parsedUser && !isExpired) {
        setUser(parsedUser);
        if (parsedCurrentTrips) setCurrentTrips(parsedCurrentTrips);
        if (parsedBusList) setBusList(parsedBusList);

        // ✅ FIX: liveTrips cache stale কিনা check করে তারপর ব্যবহার করা হচ্ছে।
        // Stale হলে পুরনো "live" ট্রিপ দেখিয়ে ইউজারকে confuse করবো না —
        // বরং isLiveTripsStale=true সেট করে refreshAllData() শেষ হওয়া পর্যন্ত অপেক্ষা করাবো।
        const liveSyncedAt = savedLiveSyncedAt ? parseInt(savedLiveSyncedAt, 10) : 0;
        const liveStale = !liveSyncedAt || Date.now() - liveSyncedAt > LIVE_TRIPS_STALE_MS;
        setIsLiveTripsStale(liveStale);

        if (parsedLiveTrips && !liveStale) {
          setLiveTrips(parsedLiveTrips);
        }
        // stale হলেও fresh ডেটা না আসা পর্যন্ত UI ফাঁকা/loading দেখাবে liveTrips ট্যাবে,
        // ভুল "running" স্ট্যাটাস দেখাবে না।

        refreshAllData();
      } else if (parsedUser && isExpired) {
       // console.log('🛡️ AppContext: Token expired per backend exp claim, clearing session.');
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.ROLE,
          STORAGE_KEYS.USER,
          STORAGE_KEYS.EXPIRES_AT,
        ]);
      }
    } catch (error) {
      console.log('🛡️ AppContext: Error loading offline cached data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Promise.all → Promise.allSettled
  // আগে একটা API (যেমন getLiveTrips) fail করলে বাকি দুটোর সফল রেজাল্টও হারিয়ে যেত।
  // এখন প্রতিটা ইন্ডিপেন্ডেন্টভাবে handle হবে — একটা fail করলে বাকিগুলো ঠিকমতো cache হবে।
  const refreshAllData = async () => {
    setIsLiveTripsSyncing(true);
    try {
      const [busesResult, currentTripsResult, liveTripsResult] = await Promise.allSettled([
        busService.getAllBuses(),
        busService.getCurrentTrips(),
        busService.getLiveTrips(),
      ]);

      if (busesResult.status === 'fulfilled' && busesResult.value.success) {
        setBusList(busesResult.value.data);
        await AsyncStorage.setItem(STORAGE_KEYS.BUS_LIST, JSON.stringify(busesResult.value.data || []));
      } else if (busesResult.status === 'rejected') {
        console.log('🛡️ AppContext: getAllBuses failed, keeping previous cache:', busesResult.reason?.message);
      }

      if (currentTripsResult.status === 'fulfilled' && currentTripsResult.value.success) {
        setCurrentTrips(currentTripsResult.value.data);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TRIPS, JSON.stringify(currentTripsResult.value.data || []));
      } else if (currentTripsResult.status === 'rejected') {
        console.log('🛡️ AppContext: getCurrentTrips failed, keeping previous cache:', currentTripsResult.reason?.message);
      }

      // ✅ liveTrips-এর জন্য আলাদাভাবে success এবং sync-timestamp সেভ করা হচ্ছে
      if (liveTripsResult.status === 'fulfilled' && liveTripsResult.value.success) {
        const freshLiveTrips = liveTripsResult.value.data || [];
        setLiveTrips(freshLiveTrips);
        setIsLiveTripsStale(false);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.LIVE_TRIPS, JSON.stringify(freshLiveTrips)],
          [STORAGE_KEYS.LIVE_TRIPS_SYNCED_AT, String(Date.now())],
        ]);
      } else {
        if (liveTripsResult.status === 'rejected') {
          console.log('🛡️ AppContext: getLiveTrips failed, keeping previous cache:', liveTripsResult.reason?.message);
        }
        // fresh data না পেলে stale flag অক্ষত থাকবে (true থাকলে true-ই থাকবে)
      }

      console.log('🔄 AppContext: Data sync attempt complete (partial or full).');
    } catch (error: any) {
      console.log('🛡️ AppContext: Unexpected error during refreshAllData:', error.message);
    } finally {
      setIsLiveTripsSyncing(false);
    }
  };

  const login = async (userData: any, token: string, role?: string) => {
    try {
      setUser(userData);

      const decodedExpiry = getTokenExpiryMs(token);
      const expiresAt = decodedExpiry ?? Date.now() + FALLBACK_SESSION_MS;

      const entries: [string, string][] = [
        [STORAGE_KEYS.TOKEN, token],
        [STORAGE_KEYS.USER, JSON.stringify(userData)],
        [STORAGE_KEYS.EXPIRES_AT, String(expiresAt)],
      ];
      if (role) entries.push([STORAGE_KEYS.ROLE, role]);

      await AsyncStorage.multiSet(entries);
      refreshAllData();
      // console.log(
      //   '💾 AppContext: Logged in & profile saved. Session expires:',
      //   new Date(expiresAt),
      //   decodedExpiry ? '(from backend token)' : '(fallback default)'
      // );
    } catch (error) {
      console.log('🛡️ AppContext: Error during login data save:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setCurrentTrips([]);
      setLiveTrips([]);
      setBusList([]);
      setIsLiveTripsStale(false);

      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.EXPIRES_AT,
        STORAGE_KEYS.CURRENT_TRIPS,
        STORAGE_KEYS.LIVE_TRIPS,
        STORAGE_KEYS.LIVE_TRIPS_SYNCED_AT, // ✅ FIX: আগে এই key clear হতো না, logout-এর পরও পুরনো sync-timestamp রয়ে যেত
        STORAGE_KEYS.BUS_LIST,
      ]);
      console.log('🚪 AppContext: Logout successful. All cache cleared.');
    } catch (error) {
      console.log('🛡️ AppContext: Error during logout cache clear:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AppContext.Provider
      value={{
        user,
        currentTrips,
        liveTrips,
        busList,
        loading,
        isLiveTripsSyncing,
        isLiveTripsStale,
        isAuthenticated,
        login,
        logout,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
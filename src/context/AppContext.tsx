import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { busService, Trip } from '../services/busService';

export interface AppContextType {
  user: any;
  currentTrips: Trip[];
  liveTrips: Trip[];
  busList: any[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: any, token: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const STORAGE_KEYS = {
  TOKEN: 'userToken',
  ROLE: 'userRole',
  USER: 'userData',
  EXPIRES_AT: 'tokenExpiresAt', // ✅ ms timestamp — backend token এর exp থেকে নেওয়া
  CURRENT_TRIPS: '@current_trips',
  LIVE_TRIPS: '@live_trips',
  BUS_LIST: '@all_bus_list',
} as const;

// ✅ FALLBACK শুধু তখনই ব্যবহার হবে যদি token থেকে exp পড়া না যায়
const FALLBACK_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function safeParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.log('🛡️ AppContext: Corrupted cache entry, ignoring:', e);
    return null;
  }
}

// ✅ NEW: JWT-এর payload থেকে `exp` (seconds since epoch) বের করে ms এ রিটার্ন করে।
// কোনো external লাইব্রেরি ছাড়াই — base64url ডিকোড ম্যানুয়ালি করা হচ্ছে যাতে
// React Native environment এ (যেখানে atob() সবসময় থাকে না) নিরাপদে কাজ করে।
function getTokenExpiryMs(token: string): number | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    // base64url → base64
    let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';

    const decoded =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8'); // Node/Buffer fallback

    const payload = JSON.parse(decoded);

    // backend যদি token এ 'exp' claim (JWT standard, seconds) দিয়ে থাকে
    if (payload?.exp && typeof payload.exp === 'number') {
      return payload.exp * 1000; // seconds → ms
    }
    return null;
  } catch (e) {
    console.log('🛡️ AppContext: Could not decode token exp, will use fallback:', e);
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
        savedBusList,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.EXPIRES_AT),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRIPS),
        AsyncStorage.getItem(STORAGE_KEYS.LIVE_TRIPS),
        AsyncStorage.getItem(STORAGE_KEYS.BUS_LIST),
      ]);

      const parsedUser = safeParse<any>(savedUser);
      const parsedCurrentTrips = safeParse<Trip[]>(savedCurrentTrips);
      const parsedLiveTrips = safeParse<Trip[]>(savedLiveTrips);
      const parsedBusList = safeParse<any[]>(savedBusList);

      const expiresAt = savedExpiresAt ? parseInt(savedExpiresAt, 10) : 0;
      const isExpired = !expiresAt || Date.now() > expiresAt;

      if (parsedUser && !isExpired) {
        // ✅ Backend token এখনো valid — সরাসরি app access দিন
        setUser(parsedUser);
        if (parsedCurrentTrips) setCurrentTrips(parsedCurrentTrips);
        if (parsedLiveTrips) setLiveTrips(parsedLiveTrips);
        if (parsedBusList) setBusList(parsedBusList);
        refreshAllData();
      } else if (parsedUser && isExpired) {
        // ✅ Backend token মেয়াদ শেষ — session সাফ করে login এ পাঠান
        console.log('🛡️ AppContext: Token expired per backend exp claim, clearing session.');
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

  const refreshAllData = async () => {
    try {
      const [allBusesRes, currentTripsRes, liveTripsRes] = await Promise.all([
        busService.getAllBuses(),
        busService.getCurrentTrips(),
        busService.getLiveTrips(),
      ]);

      if (allBusesRes.success) {
        setBusList(allBusesRes.data);
        await AsyncStorage.setItem(STORAGE_KEYS.BUS_LIST, JSON.stringify(allBusesRes.data || []));
      }
      if (currentTripsRes.success) {
        setCurrentTrips(currentTripsRes.data);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TRIPS, JSON.stringify(currentTripsRes.data || []));
      }
      if (liveTripsRes.success) {
        setLiveTrips(liveTripsRes.data);
        await AsyncStorage.setItem(STORAGE_KEYS.LIVE_TRIPS, JSON.stringify(liveTripsRes.data || []));
      }
      console.log('🔄 AppContext: All dynamic data synchronized & cached for offline use.');
    } catch (error: any) {
      console.log('🛡️ AppContext: Working in offline mode or Server Error. Using previous cache.', error.message);
    }
  };

  // 💾 login() — এখন token এর ভিতর থেকেই backend-সেট exp বের করে সেভ করবে
  const login = async (userData: any, token: string, role?: string) => {
    try {
      setUser(userData);

      // ✅ প্রথমে token থেকে আসল expiry বের করার চেষ্টা, না পেলে fallback ৭ দিন
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
      console.log(
        '💾 AppContext: Logged in & profile saved. Session expires:',
        new Date(expiresAt),
        decodedExpiry ? '(from backend token)' : '(fallback default)'
      );
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

      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.EXPIRES_AT,
        STORAGE_KEYS.CURRENT_TRIPS,
        STORAGE_KEYS.LIVE_TRIPS,
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
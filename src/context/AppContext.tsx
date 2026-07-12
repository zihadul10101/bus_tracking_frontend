import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { busService, Trip } from '../services/busService'; // আপনার সার্ভিস ফাইল থেকে ইমপোর্ট

// 📝 অ্যাপের গ্লোবাল স্টেটের ডাটা স্ট্রাকচার টাইপ
export interface AppContextType {
  user: any;                   // প্রোফাইল ডেটা স্টেট
  currentTrips: Trip[];       // কারেন্ট ট্রিপস স্টেট
  liveTrips: Trip[];          // লাইভ ট্রিপস স্টেট
  busList: any[];             // বাসের অল লিস্ট স্টেট
  loading: boolean;           // 👈 টাইপ পরিবর্তন: isLoading থেকে loading করা হলো (layout.tsx এর সাথে মিল রেখে)
  isAuthenticated: boolean;   // 👈 নতুন যুক্ত করা হলো (layout.tsx এর এরর ফিক্সের জন্য)
  login: (userData: any, token: string) => Promise<void>; // লগইন ফাংশন
  logout: () => Promise<void>; // লগআউট ফাংশন
  refreshAllData: () => Promise<void>; // ব্যাকগ্রাউন্ড সিঙ্ক ও ক্যাশ রিফ্রেশ ফাংশন
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [currentTrips, setCurrentTrips] = useState<Trip[]>([]);
  const [liveTrips, setLiveTrips] = useState<Trip[]>([]);
  const [busList, setBusList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // 👈 নাম পরিবর্তন করে loading রাখা হলো

  // 🔄 অ্যাপ ওপেন হওয়ার সাথে সাথে অফলাইন স্টোরেজ থেকে সব ডেটা লোড হবে
  useEffect(() => {
    loadAllOfflineData();
  }, []);

  const loadAllOfflineData = async () => {
    try {
      // একসাথে সব ক্যাশ ডেটা রিড করা (Performance Optimised)
      const [
        savedUser,
        savedCurrentTrips,
        savedLiveTrips,
        savedBusList
      ] = await Promise.all([
        AsyncStorage.getItem('@user_profile'),
        AsyncStorage.getItem('@current_trips'),
        AsyncStorage.getItem('@live_trips'),
        AsyncStorage.getItem('@all_bus_list'),
      ]);

      // ১. অফলাইন ডেটা স্টেটে সেট করা (কোনো ইন্টারনেট কল ছাড়াই ইনস্ট্যান্ট শো করবে)
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedCurrentTrips) setCurrentTrips(JSON.parse(savedCurrentTrips));
      if (savedLiveTrips) setLiveTrips(JSON.parse(savedLiveTrips));
      if (savedBusList) setBusList(JSON.parse(savedBusList));

      // অফলাইন ডেটা লোড হওয়ার পর ব্যাকগ্রাউন্ডে একবার এপিআই রিফ্রেশ কল করা (ঐচ্ছিক কিন্তু রিকমেন্ডেড)
      if (savedUser) {
        refreshAllData();
      }

    } catch (error) {
      console.log("🛡️ AppContext: Error loading offline cached data:", error);
    } finally {
      // অফলাইন ডেটা লোড শেষে মেইন লোডিং স্পিনার বন্ধ হবে
      setLoading(false);
    }
  };

  // 📥 ইন্টারনেট থাকলে ব্যাকগ্রাউন্ডে সব API ডেটা ফেচ এবং অফলাইনে ক্যাশ করার ফাংশন
  const refreshAllData = async () => {
    try {
      // একসাথে সব সার্ভিস কল (ইন্টারনেট থাকলে Sync হবে)
      const [allBusesRes, currentTripsRes, liveTripsRes] = await Promise.all([
        busService.getAllBuses(),
        busService.getCurrentTrips(),
        busService.getLiveTrips()
      ]);

      // ১. যদি API রেসপন্স সফল হয়, তবে স্টেটে আপডেট করব
      if (allBusesRes.success) {
        setBusList(allBusesRes.data);
        await AsyncStorage.setItem('@all_bus_list', JSON.stringify(allBusesRes.data || [])); // ক্যাশ
      }
      
      if (currentTripsRes.success) {
        setCurrentTrips(currentTripsRes.data);
        await AsyncStorage.setItem('@current_trips', JSON.stringify(currentTripsRes.data || [])); // ক্যাশ
      }
      
      if (liveTripsRes.success) {
        setLiveTrips(liveTripsRes.data);
        await AsyncStorage.setItem('@live_trips', JSON.stringify(liveTripsRes.data || [])); // ক্যাশ
      }

      console.log("🔄 AppContext: All dynamic data synchronized & cached for offline use.");

    } catch (error: any) {
      // ⚠️ এখানে ম্যাজিক! ইন্টারনেট না থাকলে এপিআই কল ফেইল করবে, তখন অ্যাপ নীরবে ক্যাশ ডেটা ব্যবহার করবে।
      console.log("🛡️ AppContext: Working in offline mode or Server Error. Using previous cache.", error.message);
    }
  };

  // 💾 লগইন করার ফাংশন (অথ সার্ভিস থেকে সফল লগইন ডেটা এখানে পাঠাতে হবে)
  const login = async (userData: any, token: string) => {
    try {
      setUser(userData);
      
      // গুরুত্বপূর্ণ টোকেন এবং প্রোফাইল ক্যাশ করা
      await Promise.all([
        AsyncStorage.setItem('userToken', token), // বাস সার্ভিসের getAuthHeaders-এর জন্য গুরুত্বপূর্ণ
        AsyncStorage.setItem('@user_profile', JSON.stringify(userData))
      ]);
      
      // ইউজার লগইন করার সাথে সাথেই ব্যাকগ্রাউন্ডে সব ট্রিপ এবং বাস ডেটা নামিয়ে ক্যাশ করে দিবে
      refreshAllData(); 
      console.log("💾 AppContext: Logged in & Offline profile saved.");
    } catch (error) {
      console.log("🛡️ AppContext: Error during login data save:", error);
    }
  };

  // 🚪 লগআউট ফাংশন (সব লোকাল ডেটা এবং টোকেন মুছে যাবে)
  const logout = async () => {
    try {
      setUser(null);
      setCurrentTrips([]);
      setLiveTrips([]);
      setBusList([]);
      
      // সব ক্যাশ ক্লিয়ার করা
      await AsyncStorage.multiRemove([
        'userToken', 
        '@user_profile', 
        '@current_trips', 
        '@live_trips', 
        '@all_bus_list'
      ]);
      console.log("🚪 AppContext: Multi-logout successful. All cache cleared.");
    } catch (error) {
      console.log("🛡️ AppContext: Error during logout cache clear:", error);
    }
  };

  // 🛡️ ডাইনামিকালি অথেনটিকেশন চেক (user অবজেক্ট থাকলেই সে ট্রু রিটার্ন করবে)
  const isAuthenticated = !!user;

  return (
    <AppContext.Provider value={{ 
      user, 
      currentTrips, 
      liveTrips, 
      busList, 
      loading,           // 👈 আপডেট ভ্যালু পাস
      isAuthenticated,   // 👈 নতুন ভ্যালু পাস যা layout.tsx খুঁজে পাচ্ছিল না
      login, 
      logout, 
      refreshAllData 
    }}>
      {children}
    </AppContext.Provider>
  );
}

// 🎯 কাস্টম হুক: যেকোনো স্ক্রিন থেকে global state ব্যবহার করার জন্য
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import * as TaskManager from 'expo-task-manager';
// import { DeviceEventEmitter } from 'react-native';
// import { io } from 'socket.io-client';
// import { safeApiCall } from '../utils/safeApiCall'; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
// import api from './api';

// const LOCATION_TASK_NAME = 'background-location-task';
// const LOCATION_UPDATE_EVENT = 'onBackgroundLocationUpdate';

// const SOCKET_URL = 'https://university-bus-backend.onrender.com';

// // ✅ FIX: websocket এর পাশাপাশি polling fallback রাখা হলো —
// // কিছু mobile data/network websocket handshake block করে দেয়,
// // পিওর ['websocket'] দিলে সেসব ক্ষেত্রে socket কখনোই কানেক্ট হয় না।
// export const socket = io(SOCKET_URL, {
//   transports: ['websocket', 'polling'],
// });

// // ===========================================================
// // Background location task — এটাই একমাত্র location watcher।
// // ===========================================================
// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
//   if (error) {
//     if (__DEV__) console.log('Background location task error:', error);
//     return;
//   }

//   if (data) {
//     const { locations } = data;
//     const location = locations?.[0];
//     if (!location) return;

//     const busId = await AsyncStorage.getItem('activeBusId');
//     if (!busId) return;

//     const coords = {
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//       speed: location.coords.speed || 0,
//     };

//     DeviceEventEmitter.emit(LOCATION_UPDATE_EVENT, coords);

//     if (socket.connected) {
//       socket.emit('update-location', {
//         roomId: busId,
//         ...coords,
//       });
//     } else if (__DEV__) {
//       console.log('Socket not connected, skipping location emit');
//     }
//   }
// });

// export const subscribeToLocationUpdates = (
//   callback: (coords: { latitude: number; longitude: number; speed: number }) => void
// ) => {
//   const subscription = DeviceEventEmitter.addListener(LOCATION_UPDATE_EVENT, callback);
//   return () => subscription.remove();
// };

// export const startLocationSharing = async (busId: string) => {
//   await AsyncStorage.setItem('activeBusId', busId);

//   // ১. Foreground permission
//   const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
//   if (fgStatus !== 'granted') {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       throw new Error('Foreground location permission not granted');
//     }
//   }

//   // ✅ FIX: ২. Background permission — এটা মিসিং ছিল, APK তে
//   // startLocationUpdatesAsync silently fail/throw করার মূল কারণ এটাই।
//   // Android এ এটা আলাদা "Allow all the time" রানটাইম প্রম্পট দেখায়।
//   const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
//   if (bgStatus !== 'granted') {
//     const { status } = await Location.requestBackgroundPermissionsAsync();
//     if (status !== 'granted') {
//       throw new Error('Background location permission not granted');
//     }
//   }

//   const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
//   if (alreadyStarted) {
//     if (__DEV__) console.log('Location updates already running, skipping re-start');
//     return;
//   }

//   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//     accuracy: Location.Accuracy.High,
//     timeInterval: 5000,
//     distanceInterval: 10,
//     foregroundService: {
//       notificationTitle: 'Location Sharing',
//       notificationBody: 'Sharing live location with students',
//     },
//   });
// };

// export const stopLocationSharing = async () => {
//   await AsyncStorage.removeItem('activeBusId');
//   const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
//   if (alreadyStarted) {
//     await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
//   }
// };

// export interface Stop {
//   stopName: string;
//   time: string | null;
//   sequence: number;
// }

// export interface LiveRoomData {
//   busId: string;
//   busName: string;
//   busNo: string;
//   [key: string]: any;
// }

// export interface RoomStatusData {
//   busName: string;
//   busNo: string;
//   [key: string]: any;
// }

// const BASE = '/location';

// export const locationService = {
//   getAllLiveRooms: async (): Promise<{ success: boolean; count: number; activeRooms: LiveRoomData[] }> => {
//     return safeApiCall(
//       async () => (await api.get(`${BASE}/active-trips`)).data,
//       { success: false, count: 0, activeRooms: [] },
//       'getAllLiveRooms'
//     );
//   },

//   getRoomStatus: async (roomId: string): Promise<{ success: boolean; data: RoomStatusData | null }> => {
//     if (!roomId) {
//       if (__DEV__) {
//         console.log("🛡️ locationService: getRoomStatus cancelled — roomId is empty.");
//       }
//       return { success: false, data: null };
//     }

//     return safeApiCall(
//       async () => (await api.get(`${BASE}/status/${roomId}`)).data,
//       { success: false, data: null },
//       'getRoomStatus'
//     );
//   },
// };


 import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { io } from 'socket.io-client';

const LOCATION_TASK_NAME = 'background-location-task';

// 🔧 adjust this base path to match how the router is mounted in your app.js (e.g. app.use('/api/v1/location', router))
const API_URL = 'https://university-bus-backend.onrender.com/api/v1/location';

// একটি সিঙ্গেল ইন্সট্যান্স তৈরি করুন
export const socket = io('https://university-bus-backend.onrender.com', {
  transports: ['websocket'], // মোবাইল অ্যাপের জন্য এটি জরুরি
});

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) return;
  if (data) {
    const { locations } = data;
    const location = locations[0];

    // ব্যাকগ্রাউন্ড থেকে বাস আইডি নেওয়া
    const busId = await AsyncStorage.getItem('activeBusId');

    if (busId) {
      socket.emit("update-location", {
        roomId: busId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    }
  }
});

export const startLocationSharing = async (busId: string) => {
  await AsyncStorage.setItem('activeBusId', busId);
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    foregroundService: {
      notificationTitle: "Location Sharing",
      notificationBody: "Sharing live location with students",
    },
  });
};

export const stopLocationSharing = async () => {
  await AsyncStorage.removeItem('activeBusId');
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};

// 🔐 busService-এর মতোই অটোমেটিক অথোরাইজেশন হেডার জেনারেটর
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Warning: Auth Token Not Found in AsyncStorage!");
  }
  return headers;
};

// হেল্পার ফাংশন: নন-জেসন (HTML/Error) রেসপন্স হ্যান্ডেল করার সেফগার্ড
const handleResponse = async (response: Response, defaultMessage: string) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const htmlError = await response.text();
    console.error("🚨 Non-JSON response received:", htmlError);
    throw new Error(`Server error (Status: ${response.status}). Non-JSON received.`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || defaultMessage);
  }
  return data;
};

// 📝 ব্যাকএন্ড রেসপন্সের সাথে মিল রেখে টাইপ ডিফিনিশন
export interface Stop {
  stopName: string;
  time: string | null;
  sequence: number;
}

export interface LiveRoomData {
  busId: string;
  busName: string;
  busNo: string;
  // toSafeTrip(trip)-থেকে আসা বাকি ফিল্ডগুলো (lat/lng, tripTitle, stops ইত্যাদি) স্প্রেড হয়ে এখানে যোগ হবে
  [key: string]: any;
}

export interface RoomStatusData {
  busName: string;
  busNo: string;
  [key: string]: any;
}

export const locationService = {
  // 1. GET ALL ACTIVE/LIVE ROOMS -> /active-trips
  getAllLiveRooms: async (): Promise<{ success: boolean; count: number; activeRooms: LiveRoomData[] }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/active-trips`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, 'Failed to fetch active live rooms');
  },

  // 2. GET SPECIFIC ROOM STATUS -> /status/:roomId
  getRoomStatus: async (roomId: string): Promise<{ success: boolean; data: RoomStatusData }> => {
    if (!roomId) {
      console.warn("🛡️ locationService: getRoomStatus cancelled because roomId is empty.");
      return Promise.reject(new Error('Invalid room ID specification'));
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/status/${roomId}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, 'Bus is currently offline');
  },
};
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import * as TaskManager from 'expo-task-manager';
// import { io } from 'socket.io-client';

// const LOCATION_TASK_NAME = 'background-location-task';

// // 🔧 adjust this base path to match how the router is mounted in your app.js (e.g. app.use('/api/v1/location', router))
// const API_URL = 'http://192.168.0.195:5000/api/v1/location';

// // একটি সিঙ্গেল ইন্সট্যান্স তৈরি করুন
// export const socket = io('http://192.168.0.195:5000', {
//   transports: ['websocket'], // মোবাইল অ্যাপের জন্য এটি জরুরি
// });

// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
//   if (error) return;
//   if (data) {
//     const { locations } = data;
//     const location = locations[0];

//     // ব্যাকগ্রাউন্ড থেকে বাস আইডি নেওয়া
//     const busId = await AsyncStorage.getItem('activeBusId');

//     if (busId) {
//       socket.emit("update-location", {
//         roomId: busId,
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude
//       });
//     }
//   }
// });

// export const startLocationSharing = async (busId: string) => {
//   await AsyncStorage.setItem('activeBusId', busId);
//   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//     accuracy: Location.Accuracy.High,
//     timeInterval: 5000,
//     distanceInterval: 10,
//     foregroundService: {
//       notificationTitle: "Location Sharing",
//       notificationBody: "Sharing live location with students",
//     },
//   });
// };

// export const stopLocationSharing = async () => {
//   await AsyncStorage.removeItem('activeBusId');
//   await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
// };

// // 🔐 busService-এর মতোই অটোমেটিক অথোরাইজেশন হেডার জেনারেটর
// const getAuthHeaders = async () => {
//   const token = await AsyncStorage.getItem('userToken');
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//   };
//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   } else {
//     console.warn("⚠️ Warning: Auth Token Not Found in AsyncStorage!");
//   }
//   return headers;
// };

// // হেল্পার ফাংশন: নন-জেসন (HTML/Error) রেসপন্স হ্যান্ডেল করার সেফগার্ড
// const handleResponse = async (response: Response, defaultMessage: string) => {
//   const contentType = response.headers.get("content-type");
//   if (!contentType || !contentType.includes("application/json")) {
//     const htmlError = await response.text();
//     console.error("🚨 Non-JSON response received:", htmlError);
//     throw new Error(`Server error (Status: ${response.status}). Non-JSON received.`);
//   }

//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.message || defaultMessage);
//   }
//   return data;
// };

// // 📝 ব্যাকএন্ড রেসপন্সের সাথে মিল রেখে টাইপ ডিফিনিশন
// export interface Stop {
//   stopName: string;
//   time: string | null;
//   sequence: number;
// }

// export interface LiveRoomData {
//   busId: string;
//   busName: string;
//   busNo: string;
//   // toSafeTrip(trip)-থেকে আসা বাকি ফিল্ডগুলো (lat/lng, tripTitle, stops ইত্যাদি) স্প্রেড হয়ে এখানে যোগ হবে
//   [key: string]: any;
// }

// export interface RoomStatusData {
//   busName: string;
//   busNo: string;
//   [key: string]: any;
// }

// export const locationService = {
//   // 1. GET ALL ACTIVE/LIVE ROOMS -> /active-trips
//   getAllLiveRooms: async (): Promise<{ success: boolean; count: number; activeRooms: LiveRoomData[] }> => {
//     const headers = await getAuthHeaders();
//     const response = await fetch(`${API_URL}/active-trips`, {
//       method: 'GET',
//       headers,
//     });
//     return handleResponse(response, 'Failed to fetch active live rooms');
//   },

//   // 2. GET SPECIFIC ROOM STATUS -> /status/:roomId
//   getRoomStatus: async (roomId: string): Promise<{ success: boolean; data: RoomStatusData }> => {
//     if (!roomId) {
//       console.warn("🛡️ locationService: getRoomStatus cancelled because roomId is empty.");
//       return Promise.reject(new Error('Invalid room ID specification'));
//     }

//     const headers = await getAuthHeaders();
//     const response = await fetch(`${API_URL}/status/${roomId}`, {
//       method: 'GET',
//       headers,
//     });
//     return handleResponse(response, 'Bus is currently offline');
//   },
// };

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';
// import * as TaskManager from 'expo-task-manager';
// import { io } from 'socket.io-client';
// import api from './api';

// const LOCATION_TASK_NAME = 'background-location-task';

// // 🔧 socket.io এখনও axios ব্যবহার করে না, তাই সরাসরি হোস্ট দরকার —
// // api.ts-এর baseURL-এর সাথে সামঞ্জস্য রাখতে এখান থেকে হোস্টটা টেনে বের করা হচ্ছে
// // (baseURL = "https://university-bus-backend.onrender.com/api/v1" থেকে "/api/v1" বাদ)
// const SOCKET_URL = 'https://university-bus-backend.onrender.com';

// // একটি সিঙ্গেল ইন্সট্যান্স তৈরি করুন
// export const socket = io(SOCKET_URL, {
//   transports: ['websocket'], // মোবাইল অ্যাপের জন্য এটি জরুরি
// });

// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
//   if (error) return;
//   if (data) {
//     const { locations } = data;
//     const location = locations[0];

//     // ব্যাকগ্রাউন্ড থেকে বাস আইডি নেওয়া
//     const busId = await AsyncStorage.getItem('activeBusId');

//     if (busId) {
//       socket.emit("update-location", {
//         roomId: busId,
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude
//       });
//     }
//   }
// });

// export const startLocationSharing = async (busId: string) => {
//   await AsyncStorage.setItem('activeBusId', busId);
//   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//     accuracy: Location.Accuracy.High,
//     timeInterval: 5000,
//     distanceInterval: 10,
//     foregroundService: {
//       notificationTitle: "Location Sharing",
//       notificationBody: "Sharing live location with students",
//     },
//   });
// };

// export const stopLocationSharing = async () => {
//   await AsyncStorage.removeItem('activeBusId');
//   await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
// };

// // 📝 ব্যাকএন্ড রেসপন্সের সাথে মিল রেখে টাইপ ডিফিনিশন
// export interface Stop {
//   stopName: string;
//   time: string | null;
//   sequence: number;
// }

// export interface LiveRoomData {
//   busId: string;
//   busName: string;
//   busNo: string;
//   // toSafeTrip(trip)-থেকে আসা বাকি ফিল্ডগুলো (lat/lng, tripTitle, stops ইত্যাদি) স্প্রেড হয়ে এখানে যোগ হবে
//   [key: string]: any;
// }

// export interface RoomStatusData {
//   busName: string;
//   busNo: string;
//   [key: string]: any;
// }

// const BASE = '/location';

// export const locationService = {
//   // 1. GET ALL ACTIVE/LIVE ROOMS -> /active-trips
//   getAllLiveRooms: async (): Promise<{ success: boolean; count: number; activeRooms: LiveRoomData[] }> => {
//     const res = await api.get(`${BASE}/active-trips`);
//     return res.data;
//   },

//   // 2. GET SPECIFIC ROOM STATUS -> /status/:roomId
//   getRoomStatus: async (roomId: string): Promise<{ success: boolean; data: RoomStatusData }> => {
//     if (!roomId) {
//       console.warn("🛡️ locationService: getRoomStatus cancelled because roomId is empty.");
//       return Promise.reject(new Error('Invalid room ID specification'));
//     }

//     const res = await api.get(`${BASE}/status/${roomId}`);
//     return res.data;
//   },
// };


import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { io } from 'socket.io-client';
import { safeApiCall } from '../utils/safeApiCall'; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import api from './api';

const LOCATION_TASK_NAME = 'background-location-task';

const SOCKET_URL = 'https://university-bus-backend.onrender.com';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
});

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) return;
  if (data) {
    const { locations } = data;
    const location = locations[0];

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

export interface Stop {
  stopName: string;
  time: string | null;
  sequence: number;
}

export interface LiveRoomData {
  busId: string;
  busName: string;
  busNo: string;
  [key: string]: any;
}

export interface RoomStatusData {
  busName: string;
  busNo: string;
  [key: string]: any;
}

const BASE = '/location';

export const locationService = {
  // ===========================================================
  // 🔕 BACKGROUND / POLLING — Live Trip স্ক্রিন এইগুলো বারবার auto-refresh
  //    করে (প্রতি কয়েক সেকেন্ডে)। fail করলে Alert popup দেখালে UX
  //    খুবই বিরক্তিকর হবে, তাই silent fail + fallback ব্যবহার করা হচ্ছে।
  //    Screen নিজে fallback দেখে বুঝে নেবে (যেমন খালি লিস্ট → "কোনো লাইভ ট্রিপ নেই")।
  // ===========================================================

  getAllLiveRooms: async (): Promise<{ success: boolean; count: number; activeRooms: LiveRoomData[] }> => {
    return safeApiCall(
      async () => (await api.get(`${BASE}/active-trips`)).data,
      { success: false, count: 0, activeRooms: [] },
      'getAllLiveRooms'
    );
  },

  getRoomStatus: async (roomId: string): Promise<{ success: boolean; data: RoomStatusData | null }> => {
    if (!roomId) {
      if (__DEV__) {
        console.log("🛡️ locationService: getRoomStatus cancelled — roomId is empty.");
      }
      return { success: false, data: null };
    }

    return safeApiCall(
      async () => (await api.get(`${BASE}/status/${roomId}`)).data,
      { success: false, data: null },
      'getRoomStatus'
    );
  },
};
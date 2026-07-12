// import { Bus } from '../types/bus'; // ✅ single source of truth — reuse the same Bus type the screens use
// import api from './api';

// export interface Stop {
//   stopName: string;
//   time: string | null;
//   sequence: number;
// }

// export interface Trip {
//   _id?: string;
//   tripTitle: string;
//   days: string[];
//   stops: Stop[];
//   from?: { time: string; stop: string };
//   to?: { time: string; stop: string };
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
//   count?: number;
// }

// const BASE = '/buses';

// export const busService = {
//   getAllBuses: async () => {
//     const res = await api.get(`${BASE}/all-bus`);
//     return res.data;
//   },

//   getCurrentTrips: async () => {
//     const res = await api.get(`${BASE}/current-trips`);
//     return res.data;
//   },

//   getLiveTrips: async () => {
//     const res = await api.get(`${BASE}/getLiveTrips`);
//     return res.data;
//   },

//   getTripsStatus: async () => {
//     const res = await api.get(`${BASE}/trip-status`);
//     return res.data;
//   },

//   createBus: async (data: Omit<Bus, '_id' | 'trips'>) => {
//     const res = await api.post(`${BASE}/create-bus`, data);
//     return res.data;
//   },

//   addTrip: async (busId: string, tripData: Omit<Trip, '_id'>) => {
//     const res = await api.post(`${BASE}/${busId}/add-trip`, tripData);
//     return res.data;
//   },

//   updateTrip: async (busId: string, tripId: string, tripData: Partial<Trip>) => {
//     const res = await api.put(`${BASE}/${busId}/trip/${tripId}`, tripData);
//     return res.data;
//   },

//   deleteTrip: async (busId: string, tripId: string) => {
//     const res = await api.delete(`${BASE}/${busId}/trip/${tripId}`);
//     return res.data;
//   },

//   updateBus: async (busId: string, data: Partial<Omit<Bus, '_id'>>) => {
//     const res = await api.put(`${BASE}/${busId}`, data);
//     return res.data;
//   },

//   deleteBus: async (busId: string) => {
//     const res = await api.delete(`${BASE}/${busId}`);
//     return res.data;
//   },

//   getBusById: async (busId: string) => {
//     if (!busId || busId === 'index') {
//       console.warn("🛡️ busService: getBusById cancelled because busId is 'index' or empty.");
//       return { success: false, message: 'Invalid ID specification' };
//     }
//     const res = await api.get(`${BASE}/${busId}`);
//     return res.data;
//   },
// };

import { Bus } from '../types/bus';
import { handleApiError } from '../utils/handleApiError'; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import { safeApiCall } from '../utils/safeApiCall'; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import api from './api';

export interface Stop {
  stopName: string;
  time: string | null;
  sequence: number;
}

export interface Trip {
  _id?: string;
  tripTitle: string;
  days: string[];
  stops: Stop[];
  from?: { time: string; stop: string };
  to?: { time: string; stop: string };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

const BASE = '/buses';

export const busService = {
  // ===========================================================
  // 🔴 CRITICAL — admin/user directly অ্যাকশন নেয়, error দেখা দরকার
  // ===========================================================

  getAllBuses: async () => {
    try {
      const res = await api.get(`${BASE}/all-bus`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'বাসের তালিকা লোড করা যায়নি');
    }
  },

  createBus: async (data: Omit<Bus, '_id' | 'trips'>) => {
    try {
      const res = await api.post(`${BASE}/create-bus`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'নতুন বাস তৈরি করা যায়নি');
    }
  },

  addTrip: async (busId: string, tripData: Omit<Trip, '_id'>) => {
    try {
      const res = await api.post(`${BASE}/${busId}/add-trip`, tripData);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'ট্রিপ যোগ করা যায়নি');
    }
  },

  updateTrip: async (busId: string, tripId: string, tripData: Partial<Trip>) => {
    try {
      const res = await api.put(`${BASE}/${busId}/trip/${tripId}`, tripData);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'ট্রিপ আপডেট করা যায়নি');
    }
  },

  deleteTrip: async (busId: string, tripId: string) => {
    try {
      const res = await api.delete(`${BASE}/${busId}/trip/${tripId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'ট্রিপ মুছে ফেলা যায়নি');
    }
  },

  updateBus: async (busId: string, data: Partial<Omit<Bus, '_id'>>) => {
    try {
      const res = await api.put(`${BASE}/${busId}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'বাসের তথ্য আপডেট করা যায়নি');
    }
  },

  deleteBus: async (busId: string) => {
    try {
      const res = await api.delete(`${BASE}/${busId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'বাস মুছে ফেলা যায়নি');
    }
  },

  getBusById: async (busId: string) => {
    if (!busId || busId === 'index') {
      if (__DEV__) {
        console.log("🛡️ busService: getBusById cancelled — busId is 'index' or empty.");
      }
      return { success: false, message: 'Invalid ID specification' };
    }
    try {
      const res = await api.get(`${BASE}/${busId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'বাসের তথ্য পাওয়া যায়নি');
    }
  },

  // ===========================================================
  // 🔕 BACKGROUND / POLLING — Live Trip স্ক্রিনে বারবার auto-refresh হয়,
  //    তাই ঘন ঘন Alert popup দেখানো ভালো UX না। fail করলে fallback
  //    (আগের data / খালি লিস্ট) থেকে যাবে, পরের সফল refresh এ ঠিক হয়ে যাবে।
  // ===========================================================

  getCurrentTrips: async () => {
    return safeApiCall(
      async () => (await api.get(`${BASE}/current-trips`)).data,
      { success: false, data: [] },
      'getCurrentTrips'
    );
  },

  getLiveTrips: async () => {
    return safeApiCall(
      async () => (await api.get(`${BASE}/getLiveTrips`)).data,
      { success: false, data: [] },
      'getLiveTrips'
    );
  },

  getTripsStatus: async () => {
    return safeApiCall(
      async () => (await api.get(`${BASE}/trip-status`)).data,
      { success: false, data: [] },
      'getTripsStatus'
    );
  },
};
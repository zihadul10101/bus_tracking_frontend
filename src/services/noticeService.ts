// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from './api';

// // 📣 নোটিশ ডাটা ইন্টারফেস
// export interface Notice {
//   _id: string;
//   title: string;
//   message: string;
//   type: string; // e.g., 'General', 'Student', 'Driver', 'Urgent'
//   createdAt?: string;
//   updatedAt?: string;
// }

// const BASE = '/notices';

// // 🆕 Client-side read tracking — cleared automatically on logout via AsyncStorage.clear()
// const LAST_SEEN_KEY = 'notices_last_seen_at';

// // Small helper to normalize the various response shapes you handle elsewhere
// const extractNoticeList = (response: any): Notice[] => {
//   const list = response?.notices || response?.data || response;
//   return Array.isArray(list) ? list : [];
// };

// export const noticeService = {

//   // 1. CREATE -> নতুন নোটিশ তৈরি করা (POST -> /create-notice)
//   createNotice: async (data: Omit<Notice, '_id'>) => {
//     const res = await api.post(`${BASE}/create-notice`, data);
//     return res.data;
//   },

//   // 2. READ ALL -> সব নোটিশ দেখা (GET -> /all-notice)
//   getAllNotices: async () => {
//     const res = await api.get(`${BASE}/all-notice`);
//     return res.data;
//   },

//   // 3. READ SINGLE -> নির্দিষ্ট একটি নোটিশ দেখা (GET -> /single-notice/:id)
//   getNoticeById: async (id: string) => {
//     const res = await api.get(`${BASE}/single-notice/${id}`);
//     return res.data;
//   },

//   // 4. UPDATE -> নোটিশ আপডেট করা (PUT -> /updated-notice/:id)
//   updateNotice: async (id: string, data: Partial<Notice>) => {
//     const res = await api.put(`${BASE}/updated-notice/${id}`, data);
//     return res.data;
//   },

//   // 5. DELETE -> নোটিশ ডিলিট করা (DELETE -> /:id)
//   deleteNotice: async (id: string) => {
//     const res = await api.delete(`${BASE}/${id}`);
//     return res.data;
//   },

//   // 🆕 6. UNREAD COUNT -> কতগুলো নোটিশ এখনো পড়া হয়নি (client-side, AsyncStorage timestamp)
//   getUnreadCount: async (): Promise<number> => {
//     try {
//       const response = await noticeService.getAllNotices();
//       const notices = extractNoticeList(response);
//       if (notices.length === 0) return 0;

//       const lastSeenRaw = await AsyncStorage.getItem(LAST_SEEN_KEY);
//       const lastSeenAt = lastSeenRaw ? new Date(lastSeenRaw).getTime() : 0;

//       return notices.filter((n) => {
//         const createdAt = n.createdAt ? new Date(n.createdAt).getTime() : 0;
//         return createdAt > lastSeenAt;
//       }).length;
//     } catch (error) {
//       console.error('Error computing unread notice count:', error);
//       return 0; // fail quiet — badge just won't show, rather than crashing the drawer
//     }
//   },

//   // 🆕 7. MARK AS READ -> নোটিফিকেশন স্ক্রিন খুললে সব "seen" হিসেবে মার্ক করা
//   //    Pass the already-fetched list if you have it (avoids a second network call);
//   //    otherwise it fetches fresh.
//   markAllAsRead: async (notices?: Notice[]) => {
//     try {
//       let list = notices;
//       if (!list) {
//         const response = await noticeService.getAllNotices();
//         list = extractNoticeList(response);
//       }
//       if (!list || list.length === 0) return;

//       const latestTimestamp = list.reduce((max, n) => {
//         const t = n.createdAt ? new Date(n.createdAt).getTime() : 0;
//         return t > max ? t : max;
//       }, 0);

//       await AsyncStorage.setItem(
//         LAST_SEEN_KEY,
//         new Date(latestTimestamp || Date.now()).toISOString()
//       );
//     } catch (error) {
//       console.error('Error marking notices as read:', error);
//     }
//   },
// };

import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError } from '../utils/handleApiError'; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import { safeApiCall } from '../utils/safeApiCall'; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import api from './api';

// 📣 নোটিশ ডাটা ইন্টারফেস
export interface Notice {
  _id: string;
  title: string;
  message: string;
  type: string; // e.g., 'General', 'Student', 'Driver', 'Urgent'
  createdAt?: string;
  updatedAt?: string;
}

const BASE = '/notices';

// 🆕 Client-side read tracking — cleared automatically on logout via AsyncStorage.clear()
const LAST_SEEN_KEY = 'notices_last_seen_at';

// Small helper to normalize the various response shapes you handle elsewhere
const extractNoticeList = (response: any): Notice[] => {
  const list = response?.notices || response?.data || response;
  return Array.isArray(list) ? list : [];
};

export const noticeService = {
  // ===========================================================
  // 🔴 CRITICAL — user action-based, error হলে UI তে Alert দেখাতে হবে
  //    তাই এগুলো handleApiError দিয়ে throw করে (component catch করে Alert দেখাবে)
  // ===========================================================

  // 1. CREATE -> নতুন নোটিশ তৈরি করা
  createNotice: async (data: Omit<Notice, '_id'>) => {
    try {
      const res = await api.post(`${BASE}/create-notice`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'নোটিশ তৈরি করা যায়নি');
    }
  },

  // 2. READ ALL -> সব নোটিশ দেখা
  getAllNotices: async () => {
    try {
      const res = await api.get(`${BASE}/all-notice`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'নোটিশগুলো লোড করা যায়নি');
    }
  },

  // 3. READ SINGLE -> নির্দিষ্ট একটি নোটিশ দেখা
  getNoticeById: async (id: string) => {
    try {
      const res = await api.get(`${BASE}/single-notice/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'নোটিশের তথ্য পাওয়া যায়নি');
    }
  },

  // 4. UPDATE -> নোটিশ আপডেট করা
  updateNotice: async (id: string, data: Partial<Notice>) => {
    try {
      const res = await api.put(`${BASE}/updated-notice/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'নোটিশ আপডেট করা যায়নি');
    }
  },

  // 5. DELETE -> নোটিশ ডিলিট করা
  deleteNotice: async (id: string) => {
    try {
      const res = await api.delete(`${BASE}/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, 'নোটিশ মুছে ফেলা যায়নি');
    }
  },

  // ===========================================================
  // 🔕 BACKGROUND / SILENT — badge count, read-tracking।
  //    এগুলো কখনো throw করবে না, তাই component এ try/catch লাগবে না
  //    এবং ইউজার কোনো error popup দেখবে না।
  // ===========================================================

  // 6. UNREAD COUNT -> কতগুলো নোটিশ এখনো পড়া হয়নি (client-side, AsyncStorage timestamp)
  getUnreadCount: async (): Promise<number> => {
    return safeApiCall(
      async () => {
        const response = await api.get(`${BASE}/all-notice`);
        const notices = extractNoticeList(response.data);
        if (notices.length === 0) return 0;

        const lastSeenRaw = await AsyncStorage.getItem(LAST_SEEN_KEY);
        const lastSeenAt = lastSeenRaw ? new Date(lastSeenRaw).getTime() : 0;

        return notices.filter((n) => {
          const createdAt = n.createdAt ? new Date(n.createdAt).getTime() : 0;
          return createdAt > lastSeenAt;
        }).length;
      },
      0, // fallback — badge শুধু হাইড থাকবে, কোনো crash/popup হবে না
      'getUnreadCount'
    );
  },

  // 7. MARK AS READ -> নোটিফিকেশন স্ক্রিন খুললে সব "seen" হিসেবে মার্ক করা
  //    Pass the already-fetched list if you have it (avoids a second network call);
  //    otherwise it fetches fresh.
  markAllAsRead: async (notices?: Notice[]): Promise<void> => {
    await safeApiCall(
      async () => {
        let list = notices;
        if (!list) {
          const res = await api.get(`${BASE}/all-notice`);
          list = extractNoticeList(res.data);
        }
        if (!list || list.length === 0) return;

        const latestTimestamp = list.reduce((max, n) => {
          const t = n.createdAt ? new Date(n.createdAt).getTime() : 0;
          return t > max ? t : max;
        }, 0);

        await AsyncStorage.setItem(
          LAST_SEEN_KEY,
          new Date(latestTimestamp || Date.now()).toISOString()
        );
      },
      undefined,
      'markAllAsRead'
    );
  },
};
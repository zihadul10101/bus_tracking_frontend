
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError } from '../utils/handleApiError';
import { safeApiCall } from '../utils/safeApiCall';
import api from './api';

// 📣 নোটিশ ডাটা ইন্টারফেস
export interface Notice {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

const BASE = '/notices';

const LAST_SEEN_KEY = 'notices_last_seen_at';

// Small helper to normalize the various response shapes you handle elsewhere
const extractNoticeList = (response: any): Notice[] => {
  const list = response?.notices || response?.data || response;
  return Array.isArray(list) ? list : [];
};

export const noticeService = {
  // ===========================================================

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
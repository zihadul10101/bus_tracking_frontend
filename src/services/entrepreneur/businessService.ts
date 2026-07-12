import { handleApiError } from '../../utils/handleApiError';
import api from '../api';

const BASE = '/entrepreneur';

export interface BusinessCreateInput {
  name:         string;
  category:     string;
  description:  string;
  contact?: {
    phone?:    string;
    email?:    string;
    whatsapp?: string;
    address?:  string;
  };
  socialLinks?: {
    facebook?:  string;
    instagram?: string;
    twitter?:   string;
    website?:   string;
    youtube?:   string;
  };
  location?: {
    city?:      string;
    area?:      string;
    latitude?:  number;
    longitude?: number;
  };
}

export const businessService = {
  // ── Public ──────────────────────────────────────────────────────────────
  getAll: async (params?: {
    category?: string;
    search?:   string;
    featured?: boolean;
    page?:     number;
    limit?:    number;
    sortBy?:   string;
  }) => {
    try {
      const res = await api.get(`${BASE}/businesses`, { params });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসাগুলোর তালিকা লোড করা যায়নি");
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api.get(`${BASE}/businesses/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসার তথ্য লোড করা যায়নি");
    }
  },

  // ── Student ──────────────────────────────────────────────────────────────
  getMyBusinesses: async () => {
    try {
      const res = await api.get(`${BASE}/businesses/my/list`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "আপনার ব্যবসাগুলো লোড করা যায়নি");
    }
  },

  create: async (data: BusinessCreateInput) => {
    try {
      const res = await api.post(`${BASE}/businesses`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসা তৈরি করা যায়নি");
    }
  },

  update: async (id: string, data: Partial<BusinessCreateInput>) => {
    try {
      const res = await api.patch(`${BASE}/businesses/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসার তথ্য আপডেট করা যায়নি");
    }
  },

  delete: async (id: string) => {
    try {
      const res = await api.delete(`${BASE}/businesses/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসা মুছে ফেলা যায়নি");
    }
  },

  addRating: async (id: string, rating: number, review?: string) => {
    try {
      const res = await api.post(`${BASE}/businesses/${id}/rate`, { rating, review });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "রেটিং জমা দেওয়া যায়নি");
    }
  },

  trackClick: async (id: string) => {
    try {
      const res = await api.post(`${BASE}/businesses/${id}/click`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ক্লিক রেকর্ড করা যায়নি");
    }
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  adminGetAll: async (params?: {
    status?: string;
    page?:   number;
    limit?:  number;
  }) => {
    try {
      const res = await api.get(`${BASE}/admin/businesses`, { params });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসার তালিকা লোড করা যায়নি");
    }
  },

  getDetail: async (id: string) => {
    try {
      const res = await api.get(`${BASE}/admin/businesses/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসার বিস্তারিত তথ্য লোড করা যায়নি");
    }
  },

  adminUpdateStatus: async (id: string, data: {
    status?:          'approved' | 'rejected' | 'suspended';
    rejectionReason?: string;
    isVerified?:      boolean;
    isFeatured?:      boolean;
  }) => {
    try {
      const res = await api.patch(`${BASE}/admin/businesses/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "ব্যবসার স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
  },
};
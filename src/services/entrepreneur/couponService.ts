

import { handleApiError } from '../../utils/handleApiError';
import api from '../api';

const BASE = '/entrepreneur';

export type CouponAppliesTo = 'new' | 'renewal' | 'both';

export const couponService = {
  // ── Student ──────────────────────────────────────────────────────────────
  validate: async (code: string, amount: number) => {
    try {
      const res = await api.post(`${BASE}/coupons/validate`, { code, amount });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপন কোড যাচাই করা যায়নি");
    }
  },

  getByCode: async (code: string) => {
    try {
      const res = await api.get(`${BASE}/coupons/code/${code}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপন কোড পাওয়া যায়নি");
    }
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  adminGetAll: async (params?: { isActive?: boolean }) => {
    try {
      const res = await api.get(`${BASE}/coupons`, { params });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপনের তালিকা লোড করা যায়নি");
    }
  },

  adminGetById: async (id: string) => {
    try {
      const res = await api.get(`${BASE}/coupons/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপনের তথ্য পাওয়া যায়নি");
    }
  },

  create: async (data: {
    code:            string;
    discountType:    'percentage' | 'fixed';
    discountValue:   number;
    maxDiscount?:    number;
    minOrderAmount?: number;
    usageLimit?:     number;
    expiresAt?:      string;
    isActive?:       boolean;
    appliesTo?:      CouponAppliesTo;
  }) => {
    try {
      const res = await api.post(`${BASE}/coupons`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপন তৈরি করা যায়নি");
    }
  },

  update: async (
    id: string,
    data: Partial<{
      code: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      maxDiscount: number;
      minOrderAmount: number;
      usageLimit: number;
      expiresAt: string;
      isActive: boolean;
      appliesTo: CouponAppliesTo;
    }>
  ) => {
    try {
      const res = await api.patch(`${BASE}/coupons/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপন আপডেট করা যায়নি");
    }
  },

  delete: async (id: string) => {
    try {
      const res = await api.delete(`${BASE}/coupons/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "কুপন মুছে ফেলা যায়নি");
    }
  },
};
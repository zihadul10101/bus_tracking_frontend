

import { handleApiError } from '../../utils/handleApiError';
import api from '../api';

const BASE = '/entrepreneur';

export const paymentService = {
  // ── Student ──────────────────────────────────────────────────────────────
  getMyPayments: async () => {
    try {
      const res = await api.get(`${BASE}/payments/my`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "পেমেন্টের তথ্য লোড করা যায়নি");
    }
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  adminGetAll: async (params?: {
    status?: 'pending' | 'verified' | 'rejected' | 'refunded';
    page?:   number;
    limit?:  number;
  }) => {
    try {
      const res = await api.get(`${BASE}/admin/payments`, { params });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "পেমেন্টের তালিকা লোড করা যায়নি");
    }
  },

  adminVerify: async (id: string, data: {
    status: 'verified' | 'rejected' | 'refunded';
    note?:  string;
  }) => {
    try {
      const res = await api.patch(`${BASE}/admin/payments/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "পেমেন্ট ভেরিফাই করা যায়নি");
    }
  },

  adminRevenue: async (params?: { year?: number }) => {
    try {
      const res = await api.get(`${BASE}/admin/revenue`, { params });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "আয়ের হিসাব লোড করা যায়নি");
    }
  },
};
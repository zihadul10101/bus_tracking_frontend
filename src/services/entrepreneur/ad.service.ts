import api from "../api";

const BASE = "/entrepreneur";

type ImageField = string | { url?: string; secure_url?: string; uri?: string } | undefined;

export interface Ad {
  _id: string;
  title: string;
  shortDescription?: string;
  image?: ImageField;
  category?: string;
  isFeatured?: boolean;
  clicks?: number;
  status?: string;
  business?: {
    _id: string;
    name: string;
    logo?: ImageField;
  };
  contactPhone?: string;
  whatsappNumber?: string;
  socialLink?: string;
}

export interface AdSubmitInput {
  businessId: string;
  title: string;
  shortDescription?: string;
  packageId: string;
  couponCode?: string;
  paymentMethod?: "free" | "bkash" | "nagad" | "rocket" | "card" | "cash";
  transactionId?: string;
}

export interface AdminAdFilter {
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminUpdateAdInput {
  status?: "approved" | "rejected" | "hidden" | "expired";
  rejectionReason?: string;
  isFeatured?: boolean;
  endDate?: string;
}

export interface RenewAdInput {
  packageId: string;
  couponCode?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export const adService = {
  // ===========================
  // Public
  // ===========================

  async getApproved(params?: {
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    return (await api.get(`${BASE}/ads`, { params })).data;
  },

  async getById(id: string) {
    return (await api.get(`${BASE}/ads/${id}`)).data;
  },

  // ===========================
  // Student
  // ===========================

  async getMyAds() {
    return (await api.get(`${BASE}/ads/my/list`)).data;
  },

  async submit(data: AdSubmitInput) {
    return (await api.post(`${BASE}/ads`, data)).data;
  },

  async trackClick(
    id: string,
    type: "call" | "whatsapp" | "social" | "share"
  ) {
    return (
      await api.post(`${BASE}/ads/${id}/click`, {
        type,
      })
    ).data;
  },

  async renew(id: string, data: RenewAdInput) {
    return (
      await api.post(`${BASE}/ads/${id}/renew`, data)
    ).data;
  },

  // ===========================
  // Admin
  // ===========================

  async adminGetAll(params?: AdminAdFilter) {
    return (
      await api.get(`${BASE}/admin/ads`, {
        params,
      })
    ).data;
  },

  async adminGetById(id: string) {
    return (
      await api.get(`${BASE}/ads/${id}`)
    ).data;
  },

  async adminUpdateStatus(
    id: string,
    data: AdminUpdateAdInput
  ) {
    return (
      await api.patch(
        `${BASE}/admin/ads/${id}`,
        data
      )
    ).data;
  },

  async adminDashboard() {
    return (
      await api.get(`${BASE}/admin/dashboard`)
    ).data;
  },
};
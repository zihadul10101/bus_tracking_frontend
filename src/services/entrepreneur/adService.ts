

// import api from "../api";

// const BASE = "/entrepreneur";

// export interface AdSubmitInput {
//   businessId: string;
//   title: string;
//   shortDescription?: string;
//   packageId: string;
//   couponCode?: string;
//   paymentMethod?: "free" | "bkash" | "nagad" | "rocket" | "card" | "cash";
//   transactionId?: string;
// }

// export interface AdminAdFilter {
//   status?: string;
//   page?: number;
//   limit?: number;
// }

// export interface AdminUpdateAdInput {
//   status?: "approved" | "rejected" | "hidden" | "expired";
//   rejectionReason?: string;
//   isFeatured?: boolean;
//   endDate?: string;
// }

// export interface RenewAdInput {
//   packageId: string;
//   couponCode?: string;
//   paymentMethod?: string;
//   transactionId?: string;
// }

// export const adService = {
//   // ===========================
//   // Public
//   // ===========================

//   async getApproved(params?: {
//     category?: string;
//     featured?: boolean;
//     page?: number;
//     limit?: number;
//   }) {
//     return (await api.get(`${BASE}/ads`, { params })).data;
//   },

//   async getById(id: string) {
//     return (await api.get(`${BASE}/ads/${id}`)).data;
//   },

//   // ===========================
//   // Student
//   // ===========================

//   async getMyAds() {
//     return (await api.get(`${BASE}/ads/my/list`)).data;
//   },

//   async submit(data: AdSubmitInput) {
//     return (await api.post(`${BASE}/ads`, data)).data;
//   },

//   async trackClick(
//     id: string,
//     type: "call" | "whatsapp" | "social" | "share"
//   ) {
//     return (
//       await api.post(`${BASE}/ads/${id}/click`, {
//         type,
//       })
//     ).data;
//   },

//   async renew(id: string, data: RenewAdInput) {
//     return (
//       await api.post(`${BASE}/ads/${id}/renew`, data)
//     ).data;
//   },

//   // ===========================
//   // Admin
//   // ===========================

//   async adminGetAll(params?: AdminAdFilter) {
//     return (
//       await api.get(`${BASE}/admin/ads`, {
//         params,
//       })
//     ).data;
//   },

//   async adminGetById(id: string) {
//     return (
//       await api.get(`${BASE}/ads/${id}`)
//     ).data;
//   },

//   async adminUpdateStatus(
//     id: string,
//     data: AdminUpdateAdInput
//   ) {
//     return (
//       await api.patch(
//         `${BASE}/admin/ads/${id}`,
//         data
//       )
//     ).data;
//   },

//   async adminDashboard() {
//     return (
//       await api.get(`${BASE}/admin/dashboard`)
//     ).data;
//   },
// };

import { handleApiError } from "../../utils/handleApiError";
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
    try {
      return (await api.get(`${BASE}/ads`, { params })).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপনগুলো লোড করা যায়নি");
    }
  },

  async getById(id: string) {
    try {
      return (await api.get(`${BASE}/ads/${id}`)).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপনের তথ্য পাওয়া যায়নি");
    }
  },

  // ===========================
  // Student
  // ===========================

  async getMyAds() {
    try {
      return (await api.get(`${BASE}/ads/my/list`)).data;
    } catch (error) {
      throw handleApiError(error, "আপনার বিজ্ঞাপনগুলো লোড করা যায়নি");
    }
  },

  async submit(data: AdSubmitInput) {
    try {
      return (await api.post(`${BASE}/ads`, data)).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপন জমা দেওয়া যায়নি");
    }
  },

  async trackClick(id: string, type: "call" | "whatsapp" | "social" | "share") {
    try {
      return (await api.post(`${BASE}/ads/${id}/click`, { type })).data;
    } catch (error) {
      // এটা silent track — user কে বিরক্ত না করে শুধু log রাখাই যথেষ্ট
      throw handleApiError(error, "ক্লিক রেকর্ড করা যায়নি");
    }
  },

  async renew(id: string, data: RenewAdInput) {
    try {
      return (await api.post(`${BASE}/ads/${id}/renew`, data)).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপন নবায়ন করা যায়নি");
    }
  },

  // ===========================
  // Admin
  // ===========================

  async adminGetAll(params?: AdminAdFilter) {
    try {
      return (await api.get(`${BASE}/admin/ads`, { params })).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপনের তালিকা লোড করা যায়নি");
    }
  },

  async adminGetById(id: string) {
    try {
      return (await api.get(`${BASE}/ads/${id}`)).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপনের তথ্য পাওয়া যায়নি");
    }
  },

  async adminUpdateStatus(id: string, data: AdminUpdateAdInput) {
    try {
      return (await api.patch(`${BASE}/admin/ads/${id}`, data)).data;
    } catch (error) {
      throw handleApiError(error, "বিজ্ঞাপনের স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
  },

  async adminDashboard() {
    try {
      return (await api.get(`${BASE}/admin/dashboard`)).data;
    } catch (error) {
      throw handleApiError(error, "ড্যাশবোর্ডের তথ্য লোড করা যায়নি");
    }
  },
};
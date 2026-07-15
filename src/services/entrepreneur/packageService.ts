

import { handleApiError } from "../../utils/handleApiError";
import api from "../api";

const BASE = "/entrepreneur";

export interface PackageData {
  _id: string;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  isFree: boolean;
  isActive: boolean;
  features: string[];
  maxAdsPerStudent: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageInput {
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  isFree?: boolean;
  features?: string[];
  maxAdsPerStudent?: number;
}

export interface UpdatePackageInput {
  name?: string;
  description?: string;
  durationDays?: number;
  price?: number;
  isFree?: boolean;
  isActive?: boolean;
  features?: string[];
  maxAdsPerStudent?: number;
}

export const packageService = {
  // Public
  getAll: async () => {
    try {
      const res = await api.get(`${BASE}/packages`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "প্যাকেজের তালিকা লোড করা যায়নি");
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api.get(`${BASE}/packages/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "প্যাকেজের তথ্য পাওয়া যায়নি");
    }
  },

  // Admin
  create: async (data: CreatePackageInput) => {
    try {
      const res = await api.post(`${BASE}/packages`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "প্যাকেজ তৈরি করা যায়নি");
    }
  },

  update: async (id: string, data: UpdatePackageInput) => {
    try {
      const res = await api.patch(`${BASE}/packages/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "প্যাকেজ আপডেট করা যায়নি");
    }
  },

  delete: async (id: string) => {
    try {
      const res = await api.delete(`${BASE}/packages/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "প্যাকেজ মুছে ফেলা যায়নি");
    }
  },
};
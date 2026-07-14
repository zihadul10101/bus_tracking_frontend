import { handleApiError } from "../utils/handleApiError";
import api from "./api";
import { authService } from "./authService";

export interface Driver {
  _id: string;
  name: string;
  mobile: string;
  licenseNumber: string;
  loginName: string;
  role: "driver";
  isOnline: boolean;
  busId?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverCreateInput {
  name: string;
  mobile: string;
  licenseNumber: string;
  loginName: string;
  password: string;
  role: "driver";
}

const BASE = "/drivers";

export const driverService = {
  // সবগুলোই admin/driver directly interact করে — 🔴 CRITICAL, error দেখানো দরকার

  create: async (data: DriverCreateInput) => {
    try {
      const response = await api.post(`${BASE}/create-driver`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "নতুন ড্রাইভার তৈরি করা যায়নি");
    }
  },

  login: async (loginName: string, password: string) => {
    try {
      const response = await api.post("/drivers/login", { loginName, password });

      if (response.data.success) {
        await authService.saveSession(response.data.token, response.data.data, "driver");
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error, "লগইন করা যায়নি। লগইন নেম/পাসওয়ার্ড আবার চেক করুন");
    }
  },

  getAll: async () => {
    try {
      const response = await api.get(`${BASE}/all-driver`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "ড্রাইভারদের তালিকা লোড করা যায়নি");
    }
  },

  getById: async (driverId: string) => {
    try {
      const response = await api.get(`${BASE}/single-driver/${driverId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "ড্রাইভারের তথ্য পাওয়া যায়নি");
    }
  },

  update: async (id: string, data: Partial<Driver> & { password?: string }) => {
    try {
      const response = await api.put(`${BASE}/update-driver/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "ড্রাইভারের তথ্য আপডেট করা যায়নি");
    }
  },

  assignBus: async (driverId: string, busId: string) => {
    try {
      const response = await api.post(`${BASE}/assign-bus/${driverId}`, { busId });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "বাস অ্যাসাইন করা যায়নি");
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`${BASE}/delete-driver/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "ড্রাইভার মুছে ফেলা যায়নি");
    }
  },
};
import { handleApiError } from "../utils/handleApiError";
import api from "./api";

export interface Permissions {
  canManageBuses?: boolean;
  canManageStudents?: boolean;
  canPostNotices?: boolean;
  canViewTracking?: boolean;
}

export interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "sub_admin";
  permissions?: Permissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubAdminDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  permissions?: Permissions;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

export const subAdminService = {
  // সবগুলোই admin management action — 🔴 CRITICAL, error দেখানো দরকার

  create: async (data: CreateSubAdminDto) => {
    try {
      const res = await api.post<ApiResponse<SubAdmin>>("/admin/create-sub-admin", data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "সাব-অ্যাডমিন তৈরি করা যায়নি");
    }
  },

  getAll: async () => {
    try {
      const res = await api.get<ApiResponse<SubAdmin[]>>("/admin/sub-admins");
      return res.data;
    } catch (error) {
      throw handleApiError(error, "সাব-অ্যাডমিনদের তালিকা লোড করা যায়নি");
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api.get<ApiResponse<SubAdmin>>("/admin/single-sub-admin", {
        params: { id },
      });
      return res.data;
    } catch (error) {
      throw handleApiError(error, "সাব-অ্যাডমিনের তথ্য পাওয়া যায়নি");
    }
  },

  update: async (id: string, data: Partial<CreateSubAdminDto>) => {
    try {
      const res = await api.put<ApiResponse<SubAdmin>>(`/admin/sub-admin/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "সাব-অ্যাডমিনের তথ্য আপডেট করা যায়নি");
    }
  },

  delete: async (id: string) => {
    try {
      const res = await api.delete<ApiResponse<null>>(`/admin/sub-admin/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error, "সাব-অ্যাডমিন মুছে ফেলা যায়নি");
    }
  },
};
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import {
//   DepartmentResearchResponse,
//   LatestResearchResponse,
//   ResearchFilter,
//   ResearchListResponse,
//   TopResearcherResponse,
// } from "../types/Research.service.types";
// import api from "./api";

// // ==========================================

// import type {
//   AdminActionPayload,
//   AdminResearchFilter,
//   MySubmissionsFilter,
//   ResearchSubmitPayload,
//   ResearchUpdatePayload,
//   SingleResearchResponse,
//   UnreadCountResponse,
// } from "../types/Research.service.types";

// // Local file for a document picked via expo-document-picker / image-picker
// type PickedFile = {
//   uri: string;
//   name: string;
//   type: string;
// } | null;

// // Reuse the same base URL your axios instance already points at,
// // so this file isn't a second place to update if it ever changes.
// const API_BASE_URL = api.defaults.baseURL as string;

// // ==========================================
// // Auth header helper
// // ==========================================
// // No interceptor on the `api` instance, so EVERY call in this file —
// // axios or fetch — attaches its own Authorization header explicitly
// // via this one function.

// const getAuthHeaders = async (isMultipart = false) => {
//   const token = await AsyncStorage.getItem("userToken");
//   const headers: Record<string, string> = {};

//   if (!isMultipart) {
//     // Never set Content-Type for multipart requests — fetch/axios need
//     // to generate it themselves so they can attach the boundary string.
//     headers["Content-Type"] = "application/json";
//   }

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   } else {
//     console.warn("⚠️ Warning: Auth Token Not Found in AsyncStorage!");
//   }

//   return headers;
// };

// const handleResponse = async (response: Response, defaultMessage: string) => {
//   const contentType = response.headers.get("content-type");
//   if (!contentType || !contentType.includes("application/json")) {
//     const htmlError = await response.text();
//     console.error("🚨 Non-JSON response received:", htmlError);
//     throw new Error(`Server error (Status: ${response.status}). Non-JSON received.`);
//   }
//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.message || defaultMessage);
//   }
//   return data;
// };

// // ==========================================
// // FormData helper (used by submit/update)
// // ==========================================

// function toFormData(
//   payload: Record<string, any>,
//   file?: PickedFile,
//   fileField = "verificationDocument"
// ) {
//   const form = new FormData();

//   Object.entries(payload).forEach(([key, value]) => {
//     if (value === undefined || value === null) return;

//     if (Array.isArray(value)) {
//       // authors / keywords -> comma separated, backend already splits on ","
//       form.append(key, value.join(","));
//     } else {
//       form.append(key, String(value));
//     }
//   });

//   if (file) {
//     // @ts-expect-error - React Native FormData file shape
//     form.append(fileField, {
//       uri: file.uri,
//       name: file.name,
//       type: file.type,
//     });
//   }

//   return form;
// }

// class ResearchService {
//   // ==========================================
//   // Public routes
//   // ==========================================
//   // (No token required by the backend for these — headers omitted
//   // on purpose. Add them too if that ever changes.)

//   /** GET /research */
//   async getAll(filters?: ResearchFilter) {
//     const { data } = await api.get<ResearchListResponse>("/research", {
//       params: filters,
//     });
//     return data;
//   }

//   /** GET /research/latest */
//   async getLatest(limit = 10) {
//     const { data } = await api.get<LatestResearchResponse>(
//       "/research/latest",
//       { params: { limit } }
//     );
//     return data;
//   }

//   /** GET /research/top-researchers */
//   async getTopResearchers(limit = 10) {
//     const { data } = await api.get<TopResearcherResponse>(
//       "/research/top-researchers",
//       { params: { limit } }
//     );
//     return data;
//   }

//   /** GET /research/department-wise */
//   async getDepartmentWise() {
//     const { data } = await api.get<DepartmentResearchResponse>(
//       "/research/department-wise"
//     );
//     return data;
//   }

//   /** GET /research/:id (public single paper) */
//   async getById(id: string) {
//     const { data } = await api.get<SingleResearchResponse>(
//       `/research/${id}`
//     );
//     return data;
//   }

//   // ==========================================
//   // Student routes (all require auth)
//   // ==========================================

//   /** POST /research/submit (multipart — uses fetch + getAuthHeaders/handleResponse) */
//   async submitResearch(payload: ResearchSubmitPayload, file?: PickedFile) {
//     const form = toFormData(payload, file);
//     const headers = await getAuthHeaders(true);

//     const response = await fetch(`${API_BASE_URL}/research/submit`, {
//       method: "POST",
//       headers,
//       body: form,
//     });

//     return handleResponse(response, "Could not submit research") as Promise<SingleResearchResponse>;
//   }

//   /** PUT /research/:id (multipart — uses fetch + getAuthHeaders/handleResponse) */
//   async updateResearch(
//     id: string,
//     payload: ResearchUpdatePayload,
//     file?: PickedFile
//   ) {
//     const form = toFormData(payload, file);
//     const headers = await getAuthHeaders(true);

//     const response = await fetch(`${API_BASE_URL}/research/${id}`, {
//       method: "PUT",
//       headers,
//       body: form,
//     });

//     return handleResponse(response, "Could not update research") as Promise<SingleResearchResponse>;
//   }

//   /** GET /research/my/submissions */
//   async getMySubmissions(filters?: MySubmissionsFilter) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.get<ResearchListResponse>(
//       "/research/my/submissions",
//       { params: filters, headers }
//     );
//     return data;
//   }

//   /** GET /research/my/submissions/:id */
//   async getMySubmissionById(id: string) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.get<SingleResearchResponse>(
//       `/research/my/submissions/${id}`,
//       { headers }
//     );
//     return data;
//   }

//   /** DELETE /research/:id (drafts only) */
//   async deleteResearch(id: string) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.delete<{ success: boolean; message: string }>(
//       `/research/${id}`,
//       { headers }
//     );
//     return data;
//   }

//   /** GET /research/my/unread-count */
//   async getUnreadCount() {
//     const headers = await getAuthHeaders();
//     const { data } = await api.get<UnreadCountResponse>(
//       "/research/my/unread-count",
//       { headers }
//     );
//     return data;
//   }

//   /** PATCH /research/my/mark-viewed */
//   async markAllAsViewed() {
//     const headers = await getAuthHeaders();
//     const { data } = await api.patch<{ success: boolean; message: string }>(
//       "/research/my/mark-viewed",
//       undefined,
//       { headers }
//     );
//     return data;
//   }

//   // ==========================================
//   // Admin routes (all require auth)
//   // ==========================================

//   /** GET /research/admin/all */
//   async getAllForAdmin(filters?: AdminResearchFilter) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.get<ResearchListResponse>(
//       "/research/admin/all",
//       { params: filters, headers }
//     );
//     return data;
//   }

//   /** GET /research/admin/duplicate-check */
//   async duplicateCheck(params: { paperTitle?: string; paperLink?: string }) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.get<{
//       success: boolean;
//       duplicate: boolean;
//       matches?: any[];
//     }>("/research/admin/duplicate-check", { params, headers });
//     return data;
//   }

//   /** GET /research/admin/:id */
//   async getOneForAdmin(id: string) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.get<SingleResearchResponse>(
//       `/research/admin/${id}`,
//       { headers }
//     );
//     return data;
//   }

//   /** PATCH /research/admin/:id/approve */
//   async approveResearch(id: string, payload?: AdminActionPayload) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.patch<SingleResearchResponse>(
//       `/research/admin/${id}/approve`,
//       payload,
//       { headers }
//     );
//     return data;
//   }

//   /** PATCH /research/admin/:id/reject */
//   async rejectResearch(id: string, payload?: AdminActionPayload) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.patch<SingleResearchResponse>(
//       `/research/admin/${id}/reject`,
//       payload,
//       { headers }
//     );
//     return data;
//   }

//   /** PATCH /research/admin/:id/request-changes */
//   async requestChanges(id: string, payload: AdminActionPayload) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.patch<SingleResearchResponse>(
//       `/research/admin/${id}/request-changes`,
//       payload,
//       { headers }
//     );
//     return data;
//   }

//   /** POST /research/admin/:id/notes */
//   async addInternalNote(id: string, note: string) {
//     const headers = await getAuthHeaders();
//     const { data } = await api.post<{ success: boolean; data: any }>(
//       `/research/admin/${id}/notes`,
//       { note },
//       { headers }
//     );
//     return data;
//   }
// }

// export default new ResearchService();

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DepartmentResearchResponse,
  LatestResearchResponse,
  ResearchFilter,
  ResearchListResponse,
  TopResearcherResponse,
} from "../types/Research.service.types";
import { handleApiError } from "../utils/handleApiError"; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import { safeApiCall } from "../utils/safeApiCall"; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import api from "./api";

// ==========================================

import type {
  AdminActionPayload,
  AdminResearchFilter,
  MySubmissionsFilter,
  ResearchSubmitPayload,
  ResearchUpdatePayload,
  SingleResearchResponse,
  UnreadCountResponse,
} from "../types/Research.service.types";

// Local file for a document picked via expo-document-picker / image-picker
type PickedFile = {
  uri: string;
  name: string;
  type: string;
} | null;

// Reuse the same base URL your axios instance already points at,
// so this file isn't a second place to update if it ever changes.
const API_BASE_URL = api.defaults.baseURL as string;

// ==========================================
// Auth header helper
// ==========================================
// 📝 নোট: আপনার `api.ts`-এর request interceptor ইতিমধ্যে প্রতিটা axios কলে
// Authorization header attach করে দেয় — তাই api.get/post/put/delete কলগুলোতে
// এই getAuthHeaders() ব্যবহার redundant (কিন্তু ক্ষতিকর না, তাই ভাঙিনি)।
// শুধু raw fetch() (submitResearch/updateResearch) এ এটা আসলেই দরকার,
// কারণ fetch axios instance ব্যবহার করে না, interceptor সেখানে কাজ করে না।

const getAuthHeaders = async (isMultipart = false) => {
  const token = await AsyncStorage.getItem("userToken");
  const headers: Record<string, string> = {};

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (__DEV__) {
    console.warn("⚠️ Warning: Auth Token Not Found in AsyncStorage!");
  }

  return headers;
};

// fetch()-based calls (multipart) দিয়ে error হ্যান্ডল করার জন্য —
// এখানে axios error shape নেই, তাই handleApiError ব্যবহার হয় না,
// বরং সরাসরি বাংলা fallback সহ Error throw করা হয়।
const handleResponse = async (response: Response, defaultMessage: string) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const htmlError = await response.text();
    if (__DEV__) {
      console.log("🚨 Non-JSON response received:", htmlError);
    }
    throw new Error(`সার্ভারে একটি সমস্যা হয়েছে (Status: ${response.status})। পরে আবার চেষ্টা করুন।`);
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || defaultMessage);
  }
  return data;
};

// ==========================================
// FormData helper (used by submit/update)
// ==========================================

function toFormData(
  payload: Record<string, any>,
  file?: PickedFile,
  fileField = "verificationDocument"
) {
  const form = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      form.append(key, value.join(","));
    } else {
      form.append(key, String(value));
    }
  });

  if (file) {
    // @ts-expect-error - React Native FormData file shape
    form.append(fileField, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
  }

  return form;
}

class ResearchService {
  // ==========================================
  // 🔴 CRITICAL — Public routes (মূল কন্টেন্ট, error দেখানো দরকার)
  // ==========================================

  /** GET /research */
  async getAll(filters?: ResearchFilter) {
    try {
      const { data } = await api.get<ResearchListResponse>("/research", { params: filters });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণাপত্রগুলো লোড করা যায়নি");
    }
  }

  /** GET /research/latest */
  async getLatest(limit = 10) {
    try {
      const { data } = await api.get<LatestResearchResponse>("/research/latest", { params: { limit } });
      return data;
    } catch (error) {
      throw handleApiError(error, "সাম্প্রতিক গবেষণাপত্র লোড করা যায়নি");
    }
  }

  /** GET /research/top-researchers */
  async getTopResearchers(limit = 10) {
    try {
      const { data } = await api.get<TopResearcherResponse>("/research/top-researchers", { params: { limit } });
      return data;
    } catch (error) {
      throw handleApiError(error, "শীর্ষ গবেষকদের তালিকা লোড করা যায়নি");
    }
  }

  /** GET /research/department-wise */
  async getDepartmentWise() {
    try {
      const { data } = await api.get<DepartmentResearchResponse>("/research/department-wise");
      return data;
    } catch (error) {
      throw handleApiError(error, "বিভাগ অনুযায়ী তথ্য লোড করা যায়নি");
    }
  }

  /** GET /research/:id (public single paper) */
  async getById(id: string) {
    try {
      const { data } = await api.get<SingleResearchResponse>(`/research/${id}`);
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণাপত্রের তথ্য পাওয়া যায়নি");
    }
  }

  // ==========================================
  // 🔴 CRITICAL — Student routes (all require auth)
  // ==========================================

  /** POST /research/submit (multipart — uses fetch + getAuthHeaders/handleResponse) */
  async submitResearch(payload: ResearchSubmitPayload, file?: PickedFile) {
    try {
      const form = toFormData(payload, file);
      const headers = await getAuthHeaders(true);

      const response = await fetch(`${API_BASE_URL}/research/submit`, {
        method: "POST",
        headers,
        body: form,
      });

      return (await handleResponse(response, "গবেষণা জমা দেওয়া যায়নি")) as SingleResearchResponse;
    } catch (error: any) {
      if (__DEV__) {
        console.log("[ResearchService] submitResearch failed:", error?.message || error);
      }
      // fetch নেটওয়ার্ক error হলে (server অফলাইন/ইন্টারনেট নেই) error.message
      // সাধারণত ইংরেজি টেকনিক্যাল টেক্সট হয় ("Network request failed"),
      // তাই সেটাকে চেনার চেষ্টা করে বাংলা fallback দেওয়া হচ্ছে।
      if (error?.message === "Network request failed") {
        throw new Error("🌐 ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
      throw new Error(error?.message || "গবেষণা জমা দেওয়া যায়নি");
    }
  }

  /** PUT /research/:id (multipart — uses fetch + getAuthHeaders/handleResponse) */
  async updateResearch(id: string, payload: ResearchUpdatePayload, file?: PickedFile) {
    try {
      const form = toFormData(payload, file);
      const headers = await getAuthHeaders(true);

      const response = await fetch(`${API_BASE_URL}/research/${id}`, {
        method: "PUT",
        headers,
        body: form,
      });

      return (await handleResponse(response, "গবেষণা আপডেট করা যায়নি")) as SingleResearchResponse;
    } catch (error: any) {
      if (__DEV__) {
        console.log("[ResearchService] updateResearch failed:", error?.message || error);
      }
      if (error?.message === "Network request failed") {
        throw new Error("🌐 ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
      throw new Error(error?.message || "গবেষণা আপডেট করা যায়নি");
    }
  }

  /** GET /research/my/submissions */
  async getMySubmissions(filters?: MySubmissionsFilter) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.get<ResearchListResponse>("/research/my/submissions", {
        params: filters,
        headers,
      });
      return data;
    } catch (error) {
      throw handleApiError(error, "আপনার জমা দেওয়া গবেষণাগুলো লোড করা যায়নি");
    }
  }

  /** GET /research/my/submissions/:id */
  async getMySubmissionById(id: string) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.get<SingleResearchResponse>(`/research/my/submissions/${id}`, { headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণার তথ্য পাওয়া যায়নি");
    }
  }

  /** DELETE /research/:id (drafts only) */
  async deleteResearch(id: string) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.delete<{ success: boolean; message: string }>(`/research/${id}`, { headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণা মুছে ফেলা যায়নি");
    }
  }

  // ==========================================
  // 🔕 BACKGROUND / SILENT — badge count, read-tracking
  //    কখনো throw করবে না, component এ try/catch লাগবে না
  // ==========================================

  /** GET /research/my/unread-count */
  async getUnreadCount() {
    return safeApiCall(
      async () => {
        const headers = await getAuthHeaders();
        const { data } = await api.get<UnreadCountResponse>("/research/my/unread-count", { headers });
        return data;
      },
      { success: false, count: 0 } as UnreadCountResponse,
      "getUnreadCount"
    );
  }

  /** PATCH /research/my/mark-viewed */
  async markAllAsViewed() {
    return safeApiCall(
      async () => {
        const headers = await getAuthHeaders();
        const { data } = await api.patch<{ success: boolean; message: string }>(
          "/research/my/mark-viewed",
          undefined,
          { headers }
        );
        return data;
      },
      { success: false, message: "silent-fail" },
      "markAllAsViewed"
    );
  }

  // ==========================================
  // 🔴 CRITICAL — Admin routes (all require auth)
  // ==========================================

  /** GET /research/admin/all */
  async getAllForAdmin(filters?: AdminResearchFilter) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.get<ResearchListResponse>("/research/admin/all", { params: filters, headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণাপত্রের তালিকা লোড করা যায়নি");
    }
  }

  /** GET /research/admin/duplicate-check */
  async duplicateCheck(params: { paperTitle?: string; paperLink?: string }) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.get<{ success: boolean; duplicate: boolean; matches?: any[] }>(
        "/research/admin/duplicate-check",
        { params, headers }
      );
      return data;
    } catch (error) {
      throw handleApiError(error, "ডুপ্লিকেট চেক করা যায়নি");
    }
  }

  /** GET /research/admin/:id */
  async getOneForAdmin(id: string) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.get<SingleResearchResponse>(`/research/admin/${id}`, { headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণার তথ্য পাওয়া যায়নি");
    }
  }

  /** PATCH /research/admin/:id/approve */
  async approveResearch(id: string, payload?: AdminActionPayload) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.patch<SingleResearchResponse>(`/research/admin/${id}/approve`, payload, { headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণা অনুমোদন করা যায়নি");
    }
  }

  /** PATCH /research/admin/:id/reject */
  async rejectResearch(id: string, payload?: AdminActionPayload) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.patch<SingleResearchResponse>(`/research/admin/${id}/reject`, payload, { headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "গবেষণা প্রত্যাখ্যান করা যায়নি");
    }
  }

  /** PATCH /research/admin/:id/request-changes */
  async requestChanges(id: string, payload: AdminActionPayload) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.patch<SingleResearchResponse>(
        `/research/admin/${id}/request-changes`,
        payload,
        { headers }
      );
      return data;
    } catch (error) {
      throw handleApiError(error, "পরিবর্তনের অনুরোধ পাঠানো যায়নি");
    }
  }

  /** POST /research/admin/:id/notes */
  async addInternalNote(id: string, note: string) {
    try {
      const headers = await getAuthHeaders();
      const { data } = await api.post<{ success: boolean; data: any }>(`/research/admin/${id}/notes`, { note }, { headers });
      return data;
    } catch (error) {
      throw handleApiError(error, "নোট যোগ করা যায়নি");
    }
  }
}

export default new ResearchService();


import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleApiError } from "../utils/handleApiError"; // path adjust করুন আপনার utils ফোল্ডার অনুযায়ী
import api from "./api";

export const authService = {
  // ===========================================================
  // 🔴 CRITICAL — সব auth action, error হলে UI তে Alert দেখানো দরকার
  // ===========================================================

  // Student Registration
  // registerStudent: async (data: any) => {
  //   try {
  //     const response = await api.post("/students/register", data);
  //     return response.data;
  //   } catch (error) {
  //     throw handleApiError(error, "রেজিস্ট্রেশন সম্পন্ন করা যায়নি");
  //   }
  // },

  // Student Registration
  registerStudent: async (data: any) => {
    try {
      const response = await api.post("/students/register", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "রেজিস্ট্রেশন সম্পন্ন করা যায়নি");
    }
  },

  // Verify OTP (Email Verification after Registration)
  verifyOtp: async (userId: string, otp: string) => {
    try {
      const response = await api.post("/students/verify-otp", { userId, otp });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "OTP ভেরিফাই করা যায়নি");
    }
  },

  // Resend OTP
  resendOtp: async (userId: string) => {
    try {
      const response = await api.post("/students/resend-otp", { userId });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "নতুন OTP পাঠানো যায়নি");
    }
  },
  // Login (Admin / Student)
  login: async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
// console.log("LOGIN RESPONSE:", JSON.stringify(data, null, 2))
      if (data.success) {
        // Student role may be null from backend
        const role = data.role;

        await AsyncStorage.multiSet([
          ["userToken", data.token],
          ["userRole", role],
          ["userData", JSON.stringify(data.user)],
        ]);

        data.role = role;
      }

      return data;
    } catch (error) {
      throw handleApiError(error, "লগইন করা যায়নি। ইমেইল/পাসওয়ার্ড আবার চেক করুন");
    }
  },

  // Forgot Password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "পাসওয়ার্ড রিসেট অনুরোধ পাঠানো যায়নি");
    }
  },

  // Reset Password
  resetPassword: async (
    email: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "পাসওয়ার্ড রিসেট করা যায়নি");
    }
  },

  // Get Current Logged User
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "ইউজার তথ্য লোড করা যায়নি");
    }
  },

  // Driver Login
  driverLogin: async (loginName: string, password: string) => {
    try {
      const response = await api.post("/drivers/login", { loginName, password });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "লগইন করা যায়নি। লগইন নেম/পাসওয়ার্ড আবার চেক করুন");
    }
  },

  // Refresh User Data
  refreshUser: async () => {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success) {
        await AsyncStorage.setItem("userData", JSON.stringify(response.data.data));
        await AsyncStorage.setItem("userRole", response.data.role);
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error, "ইউজার তথ্য রিফ্রেশ করা যায়নি");
    }
  },

  // ===========================================================
  // 🧰 LOCAL ONLY — এগুলো কোনো API কল করে না (শুধু AsyncStorage),
  //    তাই handleApiError এর দরকার নেই। AsyncStorage নিজেই খুব কম fail করে,
  //    আর fail করলে সেটা raw throw হওয়াই ঠিক আছে (silent হওয়া উচিত না,
  //    কারণ token/session সংক্রান্ত bug হলে সেটা invisible থাকা বিপজ্জনক)।
  // ===========================================================

  saveSession: async (token: string, user: any, role: string) => {
    await AsyncStorage.multiSet([
      ["userToken", token],
      ["userRole", role],
      ["userData", JSON.stringify(user)],
    ]);
  },

  getToken: async () => {
    return await AsyncStorage.getItem("userToken");
  },

  getUser: async () => {
    const user = await AsyncStorage.getItem("userData");
    return user ? JSON.parse(user) : null;
  },

  getRole: async () => {
    return await AsyncStorage.getItem("userRole");
  },

  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem("userToken");
    return !!token;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(["userToken", "userRole", "userData"]);
  },
};
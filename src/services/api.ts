import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "https://university-bus-backend.onrender.com/api/v1",
  timeout: 60000,
});

// =======================
// Request Interceptor
// =======================
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// Response Interceptor
// =======================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    let userMessage = "দুঃখিত! একটি সমস্যা হয়েছে।";

    // Timeout
    if (error.code === "ECONNABORTED") {
      userMessage =
        "⏳ অনুরোধের সময় শেষ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
    }

    // Network Error
    else if (
      !error.response ||
      error.message === "Network Error" ||
      error.message === "Network request failed"
    ) {
      userMessage =
        "🌐 ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";
    }

    // Server Error
    else {
      switch (error.response.status) {
        case 400:
          userMessage =
            error.response.data?.message ??
            "অনুরোধটি সঠিক নয়।";
          break;

        case 401:
          userMessage =
            "আপনার লগইন সেশন শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।";
          break;

        case 403:
          userMessage =
            "এই কাজটি করার অনুমতি আপনার নেই।";
          break;

        case 404:
          userMessage =
            error.response.data?.message ??
            "কোনো তথ্য পাওয়া যায়নি।";
          break;

        case 409:
          userMessage =
            error.response.data?.message ??
            "তথ্যটি ইতোমধ্যে বিদ্যমান।";
          break;

        case 422:
          userMessage =
            error.response.data?.message ??
            "অনুগ্রহ করে আপনার দেওয়া তথ্য যাচাই করুন।";
          break;

        case 429:
          userMessage =
            "অতিরিক্ত অনুরোধ করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
          break;

        case 500:
          userMessage =
            "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।";
          break;

        case 502:
          userMessage =
            "সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
          break;

        case 503:
          userMessage =
            "সার্ভার সাময়িকভাবে বন্ধ রয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।";
          break;

        default:
          userMessage =
            error.response.data?.message ??
            "অপ্রত্যাশিত একটি সমস্যা হয়েছে।";
      }
    }

    error.userMessage = userMessage;

    return Promise.reject(error);
  }
);

export default api;
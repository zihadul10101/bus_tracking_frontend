// utils/handleApiError.ts

/**
 * সব service ফাংশনে ব্যবহার করার জন্য একটা reusable error handler।
 * এটা raw AxiosError কে ধরে, console এ log করে,
 * এবং একটা সহজ Error throw করে যাতে userMessage (বাংলা মেসেজ) থাকে।
 *
 * ব্যবহার:
 *   try {
 *     const res = await api.get(...);
 *     return res.data;
 *   } catch (error) {
 *     throw handleApiError(error, "ব্যবসার তথ্য লোড করা যায়নি");
 *   }
 */
// utils/handleApiError.ts

/**
 * সব service ফাংশনে ব্যবহার করার জন্য একটা reusable error handler।
 * এটা raw AxiosError কে ধরে, console এ log করে,
 * এবং একটা সহজ Error throw করে যাতে userMessage (বাংলা মেসেজ) থাকে।
 *
 * ব্যবহার:
 *   try {
 *     const res = await api.get(...);
 *     return res.data;
 *   } catch (error) {
 *     throw handleApiError(error, "ব্যবসার তথ্য লোড করা যায়নি");
 *   }
 */
export function handleApiError(error: any, fallbackMessage: string): Error {
  // interceptor আগেই error.userMessage বসিয়ে দিয়েছে (api.ts এ)
  const message = error?.userMessage || fallbackMessage;

  // 🔒 শুধু development মোডে log হবে — production build এ এই ব্লক
  // পুরোপুরি বাদ পড়ে যায় (Metro/Hermes __DEV__ কে dead-code হিসেবে ধরে),
  // তাই sensitive backend data বা user info production log এ যাবে না।
  if (__DEV__) {
    console.log("[API Error]", {
      message,
      status: error?.response?.status,
      url: error?.config?.url,
      raw: error?.response?.data || error?.message,
    });
  }

  const finalError = new Error(message);
  // component এ চাইলে raw status/data ও অ্যাক্সেস করতে পারবে
  (finalError as any).status = error?.response?.status;
  (finalError as any).original = error;

  return finalError;
}
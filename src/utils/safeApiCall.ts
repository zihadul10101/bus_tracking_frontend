/**
 * background/non-critical API call এর জন্য ব্যবহার করুন —
 * যেমন unread count, ads slider, click tracking, badge count।
 *
 * এই ফাংশন কখনো throw করে না — error হলে fallbackValue রিটার্ন করে
 * এবং শুধু __DEV__ এ console.log করে। UI/component কে try/catch
 * লেখারই দরকার নেই, ইউজারও কোনো Alert/popup দেখবে না।
 *
 * ব্যবহার (service ফাইলে):
 *   getUnreadCount: async () => {
 *     return safeApiCall(
 *       async () => (await api.get(`${BASE}/notices/unread-count`)).data,
 *       0 // fallback value
 *     );
 *   }
 */
export async function safeApiCall<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (__DEV__) {
      console.log(`[Silent API Error]${context ? ` [${context}]` : ''}`, error?.message || error);
    }
    return fallbackValue;
  }
}
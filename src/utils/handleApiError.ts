// utils/handleApiError.ts


export function handleApiError(error: any, fallbackMessage: string): Error {
  // interceptor আগেই error.userMessage বসিয়ে দিয়েছে (api.ts এ)
  const message = error?.userMessage || fallbackMessage;


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
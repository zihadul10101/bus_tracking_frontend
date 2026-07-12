import axios from "axios";

export const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    if (!error.response) {
      return "No internet connection or server unavailable.";
    }

    return (
      error.response.data?.message ||
      "Something went wrong."
    );
  }

  return "Unexpected error occurred.";
};
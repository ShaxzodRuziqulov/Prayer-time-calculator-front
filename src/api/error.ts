import axios from "axios";

interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "Serverga ulanib bo'lmadi";
    }

    const status = error.response.status;
    const data = error.response.data;
    const rawData: unknown = data;

    if (typeof rawData === "string" && rawData.trim().length > 0) {
      return rawData;
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }

    if (status === 401) return "Avtorizatsiya talab qilinadi";
    if (status === 403) return "Ushbu amal uchun ruxsat yo'q";
    if (status === 404) return "Ma'lumot topilmadi";
    if (status === 409) return "Konflikt xatoligi";
    if (status === 400) return "So'rov noto'g'ri yuborildi";
    return "So'rovda xatolik";
  }
  return "Noma'lum xatolik";
}

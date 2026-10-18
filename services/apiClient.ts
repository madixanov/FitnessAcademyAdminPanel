import { ApiError, parseApiResponse } from "./apiError";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL не задан в .env");
}

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    return await parseApiResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "Не удалось связаться с сервером. Проверьте подключение",
      0,
      error
    );
  }
}
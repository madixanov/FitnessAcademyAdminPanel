import { ApiError, parseApiResponse } from "./apiError";

// uploadApiClient.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadApiClient<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
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

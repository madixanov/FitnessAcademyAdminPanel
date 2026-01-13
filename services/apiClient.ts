const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL не задан в .env");
}

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data: T | null = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error((data as any)?.message || "Произошла ошибка")
  }

  return data as T;
}
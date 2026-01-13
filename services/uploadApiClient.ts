// uploadApiClient.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadApiClient<T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMessage = typeof data === "string" ? data : data?.message || "Ошибка";
    throw new Error(errorMessage);
  }

  return data as T;
}

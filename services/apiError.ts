export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return undefined;

  const response = data as { message?: unknown; error?: unknown };
  const message = response.message ?? response.error;

  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");

  return undefined;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      getResponseMessage(data) ||
      response.statusText ||
      "Произошла ошибка при обращении к серверу";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return error.message || "Проверьте введенные данные";
      case 401:
        return "Необходимо войти в систему";
      case 403:
        return "Недостаточно прав для выполнения этого действия";
      case 404:
        return "Запрашиваемые данные не найдены";
      case 409:
        return error.message || "Данные конфликтуют с уже существующими";
      case 429:
        return "Слишком много запросов. Попробуйте позже";
      default:
        if (error.status >= 500) {
          return "Ошибка сервера. Попробуйте позже";
        }
        return error.message;
    }
  }

  if (error instanceof TypeError) {
    return "Не удалось связаться с сервером. Проверьте подключение";
  }

  if (error instanceof Error) return error.message;
  return "Произошла неизвестная ошибка";
}

export function handleApiError(error: unknown, context: string): string {
  console.error(context, error);
  return getApiErrorMessage(error);
}

export function notifyApiError(error: unknown): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("api-error", {
      detail: { message: getApiErrorMessage(error) },
    })
  );
}

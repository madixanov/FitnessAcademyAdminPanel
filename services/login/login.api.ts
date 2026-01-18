import Cookies from "js-cookie";
import { apiClient } from "../apiClient";

export type UserRole = "ADMIN" | "TEACHER" | "USER";

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "PENDING";
  img: string | null;
  experience: number | null;
}

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "TEACHER"];

// ------------------------
// LOGIN
// ------------------------
export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<MeResponse> {
  const loginData = await apiClient<LoginResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Сохраняем accessToken и refreshToken
  const cookieOptions = { expires: rememberMe ? 30 : undefined, path: "/" };
  Cookies.set("accessToken", loginData.accessToken, cookieOptions);

  const me = await apiClient<MeResponse>("/auth/me", {
    headers: { Authorization: `Bearer ${loginData.accessToken}` },
  });

  if (me.status !== "ACTIVE") {
    await logout();
    throw new Error("USER_BLOCKED");
  }

  if (!ALLOWED_ROLES.includes(me.role)) {
    await logout();
    throw new Error("NO_ACCESS");
  }

  Cookies.set("role", me.role, cookieOptions);
  Cookies.set("rememberMe", rememberMe ? "true" : "false", cookieOptions);

  return me;
}

// ------------------------
// LOGOUT
// ------------------------
export async function logout() {
  const token = Cookies.get("accessToken");

  if (token) {
    try {
      await apiClient("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("Ошибка при logout на сервере:", err);
    }
  }

  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("role");
  Cookies.remove("rememberMe");
}

// ------------------------
// REFRESH TOKEN
// ------------------------
export async function refreshToken(): Promise<string | null> {
  const currentRefreshToken = Cookies.get("refreshToken");
  if (!currentRefreshToken) return null;

  try {
    const data = await apiClient<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    // Обновляем accessToken
    const rememberMe = Cookies.get("rememberMe") === "true";
    Cookies.set("accessToken", data.accessToken, {
      expires: rememberMe ? 30 : undefined,
      path: "/",
    });

    return data.accessToken;
  } catch (err) {
    await logout();
    return null;
  }
}

// ------------------------
// API CLIENT WRAPPER С АВТО REFRESH
// ------------------------
export async function apiWithAuth<T>(url: string, options: any = {}): Promise<T> {
  const token = Cookies.get("accessToken");

  try {
    return await apiClient<T>(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err: any) {
    // Если 401 — пробуем обновить токен
    if (err?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        return await apiClient<T>(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }
    throw err;
  }
}

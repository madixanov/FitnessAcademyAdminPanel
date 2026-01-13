import { apiClient } from "@/services/apiClient";
import Cookies from "js-cookie"; 

export type UserRole = "USER" | "ADMIN" | "TEACHER";
export type UserStatus = "ACTIVE" | "PENDING";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;       // всегда строка
  role: UserRole;
  status: UserStatus;
  img: string;               // пустая строка, если нет фото
  createdAt: string;
}

export interface UserPayload {
  name?: string;
  phoneNumber?: string;
  img?: string;   
}

export interface MyCourse {
  id: string;
  courseId: string;
  userId: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;

  course: {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string[];
    status: "ACTIVE" | "INACTIVE";
  };

  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: "USER" | "ADMIN" | "TEACHER";
    img: string | null;
    status: "ACTIVE" | "PENDING";
    createdAt: string;
  };
}


export const getProfile = async (accessToken: string): Promise<any> => {
  return apiClient<any>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export async function uploadProfilePhoto(file: File) {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("Нет токена");

  const formData = new FormData();
  formData.append("image", file, file.name);

  // В fetch с FormData НЕ ставим Content-Type
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Ошибка при загрузке фото");
  }

  return res.json(); // возвращаем то, что отдаёт сервер
}

export async function getUsers(): Promise<User[]> {
  return await apiClient<User[]>("/user/users", {
    method: "GET",
  });
}

export async function patchUser(
  id: string,
  payload: UserPayload
): Promise<User> {
  return await apiClient<User>(`/user/user/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export const getMyCourses = async (): Promise<MyCourse[]> => {
  return apiClient<MyCourse[]>("/mycourse/all");
};
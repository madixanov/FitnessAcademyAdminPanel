import { apiClient } from "../apiClient";

export type MyCourseStatus =
  | "DROPPED"
  | "ACTIVE"
  | "COMPLETED";

export interface MyCourse {
  id: string;
  userId: string;
  courseId: string;
  status: MyCourseStatus;
  createdAt: string;
}

// -------------------------
// Получить курсы пользователя
// -------------------------
export async function getMyCoursesByUser(
): Promise<MyCourse[]> {
  return apiClient<MyCourse[]>(`/mycourse/all`);
}

export async function getMyCoursesByUserId(id: string): Promise<MyCourse[]> {
  if (!id) {
    console.error("getMyCoursesByUserId: ID пользователя не указан");
    return [];
  }
  
  // Отправляем запрос на получение списка курсов конкретного пользователя
  return apiClient<MyCourse[]>(`/mycourse/${id}`);
}

// -------------------------
// Обновить статус по ID
// -------------------------
export async function patchMyCourseById(
  id: string,
  status: MyCourseStatus
): Promise<MyCourse> {
  return apiClient<MyCourse>(`/mycourse/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

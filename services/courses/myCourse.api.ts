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

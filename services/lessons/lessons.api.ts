import { apiClient } from "../apiClient";

// ------------------------------------
// Payload для создания / обновления урока
// ------------------------------------
export interface LessonPayload {
  modulId: string;
  courseId: string;
  name: string;
  title: string;
  video: string;
  img: string[];
  desc: string;
  duration: number;
  startsAt?: string; // ISO дата начала
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; // статус урока
}

// ------------------------------------
// Урок с ID и createdAt
// ------------------------------------
export interface Lesson extends LessonPayload {
  id: string;
  createdAt: string;
}

// -------------------------
// Создание урока
// -------------------------
export async function createLesson(
  payload: Omit<Lesson, "id" | "createdAt">
): Promise<Lesson> {
  return await apiClient<Lesson>("/lessons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// -------------------------
// Обновление урока
// -------------------------
export async function patchLesson(
  id: string,
  payload: Omit<Lesson, "id" | "createdAt">
): Promise<Lesson> {
  return await apiClient<Lesson>(`/lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// -------------------------
// Получение всех уроков
// -------------------------
export async function getLessonsByModule(
  moduleId: string
): Promise<Lesson[]> {
  try {
    return await apiClient<Lesson[]>(`/lessons/module/${moduleId}`);
  } catch (err: any) {
    console.error("Ошибка при получении уроков:", err.message);
    return [];
  }
}

// ------------------------------------
// Урок по ID
// ------------------------------------
export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    return await apiClient<Lesson>(`/lessons/${id}`);
  } catch (err: any) {
    console.error("Ошибка при получении урока:", err.message);
    return null;
  }
}

// -------------------------
// Удаление урока
// -------------------------
export async function deleteLesson(id: string): Promise<boolean> {
  try {
    await apiClient(`/lessons/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err: any) {
    console.error(`Ошибка при удалении урока ${id}:`, err.message);
    return false;
  }
}

// -------------------------
// Все уроки
// -------------------------
export async function getAllLessons(): Promise<Lesson[]> {
  try {
    return await apiClient<Lesson[]>("/lessons");
  } catch (err: any) {
    console.error("Ошибка при получении всех lessons:", err.message);
    return [];
  }
}

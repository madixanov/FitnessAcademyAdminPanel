import { apiClient } from "../apiClient";

// Интерфейс для курса (payload для создания/обновления)
export interface CoursePayload {
  name: string;
  price: number;
  description: string;
  date: string;
  image: string[];
  level: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "COMPLETED";
  trainerId: string;
  Course_duration?: string;
  Number_of_lessons?: string;
  Training_format?: "ONLINE" | "OFFLINE";
  Course_Benefits_Sheet?: string;
}

// Интерфейс курса с ID и createdAt
export interface Course extends CoursePayload {
  id: string;
  createdAt: string;
}

// -------------------------
// Создание курса
// -------------------------
export async function createCourse(
  payload: Omit<Course, "id" | "createdAt">
): Promise<Course> {
  return await apiClient<Course>("/course", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// -------------------------
// Обновление курса
// -------------------------
export async function patchCourse(
  id: string,
  payload: Omit<Course, "id" | "createdAt">
): Promise<Course> {
  return await apiClient<Course>(`/course/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// -------------------------
// Получение всех курсов
// -------------------------
export async function getCourses(): Promise<Course[]> {
  try {
    const data = await apiClient<Course[]>("/course");
    return data;
  } catch (err: any) {
    console.error("Ошибка при получении курсов:", err.message);
    return [];
  }
}

// -------------------------
// Получение одного курса по ID
// -------------------------
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const data = await apiClient<Course>(`/course/${id}`);
    return data;
  } catch (err: any) {
    console.error(`Ошибка при получении курса ${id}:`, err.message);
    return null;
  }
}

// -------------------------
// Удаление курса
// -------------------------
export async function deleteCourse(id: string): Promise<boolean> {
  try {
    await apiClient(`/course/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err: any) {
    console.error(`Ошибка при удалении курса ${id}:`, err.message);
    return false;
  }
}

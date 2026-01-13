import { apiClient } from "../apiClient";

// ------------------------------------
// Payload для создания / обновления ДЗ
// ------------------------------------
export interface HomeworkPayload {
  lessonId: string;
  title: string;
  description: string;
  files: string[];
  deadline: string; // ISO
}

// ------------------------------------
// Homework entity
// ------------------------------------
export interface Homework extends HomeworkPayload {
  id: string;
  createdAt: string;
  lesson: {
    lessonId: string;
    courseId: string;
    moduleId: string;
  };
}

// ------------------------------------
// Получить ДЗ по уроку
// GET /homework-tasks/lesson/:lessonId
// ------------------------------------
export async function getHomeworkByLesson(
  lessonId: string
): Promise<Homework[]> {
  try {
    return await apiClient<Homework[]>(`/homework-tasks/lesson/${lessonId}`);
  } catch (err: any) {
    console.error("Ошибка при получении homework:", err.message);
    return [];
  }
}

// ------------------------------------
// Создать ДЗ
// POST /homework-tasks
// ------------------------------------
export async function createHomework(
  payload: HomeworkPayload
): Promise<Homework> {
  try {
    return await apiClient<Homework>("/homework-tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.error("Ошибка при создании homework:", err.message);
    throw err;
  }
}

// ------------------------------------
// Удалить ДЗ
// DELETE /homework-tasks/:id
// ------------------------------------
export async function deleteHomework(id: string): Promise<boolean> {
  try {
    await apiClient(`/homework-tasks/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err: any) {
    console.error(`Ошибка при удалении homework ${id}:`, err.message);
    return false;
  }
}

// ------------------------------------
// Получить все ДЗ
// GET /homework-tasks
// ------------------------------------
export async function getAllHomeworks(): Promise<Homework[]> {
  try {
    return await apiClient<Homework[]>("/homework-tasks");
  } catch (err: any) {
    console.error("Ошибка при получении всех homework:", err.message);
    return [];
  }
}

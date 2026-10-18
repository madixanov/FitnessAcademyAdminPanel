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
  return apiClient<Homework[]>(`/homework-tasks/lesson/${lessonId}`);
}

// ------------------------------------
// Создать ДЗ
// POST /homework-tasks
// ------------------------------------
export async function createHomework(
  payload: HomeworkPayload
): Promise<Homework> {
  return apiClient<Homework>("/homework-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ------------------------------------
// Удалить ДЗ
// DELETE /homework-tasks/:id
// ------------------------------------
export async function deleteHomework(id: string): Promise<boolean> {
  await apiClient(`/homework-tasks/${id}`, {
    method: "DELETE",
  });
  return true;
}

// ------------------------------------
// Получить все ДЗ
// GET /homework-tasks
// ------------------------------------
export async function getAllHomeworks(): Promise<Homework[]> {
  return apiClient<Homework[]>("/homework-tasks");
}

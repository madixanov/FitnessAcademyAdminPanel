import { apiClient } from "../apiClient";

// ------------------------------------
// Payload для создания/обновления решения
// ------------------------------------
export interface HomeworkSolutionPayload {
  homeworkId: string;
  text: string;
  files: string[];
}

// ------------------------------------
// Пользователь, отправивший решение
// ------------------------------------
export interface HomeworkUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  img?: string;
  role: string;
  createdAt: string;
  status: string;
  [key: string]: any;
}

// ------------------------------------
// Решение домашки (Homework Solution)
// ------------------------------------
export interface HomeworkSolution extends HomeworkSolutionPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "CHECKED" | "REJECTED";
  userId: string;
  user?: HomeworkUser;
}

// ------------------------------------
// Получить решение по homeworkId
// GET /homework-submissions/:homeworkId
// ------------------------------------
export async function getHomeworkSolutions(
  homeworkId: string
): Promise<HomeworkSolution[]> {
  try {
    return await apiClient<HomeworkSolution[]>(
      `/homework-submissions/homework/${homeworkId}`
    );
  } catch (err: any) {
    console.error(
      `Ошибка при получении решений домашки ${homeworkId}:`,
      err.message
    );
    return [];
  }
}

// ------------------------------------
// Обновить решение
// PATCH /homework-submissions/:id
// ------------------------------------
export async function patchHomeworkSolution(
  id: string,
  payload: { status: "PENDING" | "CHECKED" | "REJECTED" }
): Promise<HomeworkSolution> {
  return await apiClient<HomeworkSolution>(`/homework-submissions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

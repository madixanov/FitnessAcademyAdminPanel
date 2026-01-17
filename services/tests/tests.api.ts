import { apiClient } from "../apiClient";
import { Question } from "@/types/questions.types";

export type TestStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export interface Test {
  id?: string;
  name: string;
  courseId: string;
  duration: number;
  quantity: number;      // <-- добавлено
  startDate: string;     // ISO string
  status: TestStatus;
  createdAt?: string;
  questions?: Question[];
}

export interface TestPayload {
  name: string;
  courseId: string;
  duration: number;
  quantity?: number;     // <-- добавлено (необязательное)
  startDate: string;
  status: TestStatus;
  questions?: Question[];
}

// Получить все тесты
export const getTests = async (): Promise<Test[]> => {
  return apiClient<Test[]>("/tests");
};

// Получить один тест
export const getTest = async (id: string): Promise<Test> => {
  return apiClient<Test>(`/tests/${id}`);
};

// Создать тест
export const createTest = async (payload: TestPayload): Promise<Test> => {
  return apiClient<Test>("/tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

// Обновить тест
export const patchTest = async (
  id: string,
  payload: Partial<TestPayload>
): Promise<Test> => {
  return apiClient<Test>(`/tests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

// Удалить тест
export const deleteTest = async (id: string): Promise<void> => {
  return apiClient<void>(`/tests/${id}`, {
    method: "DELETE",
  });
};

// services/courses/modules.api.ts
import { apiClient } from "../apiClient";

export interface Module {
  id: string;
  courseId: string;
  name: string;
  title: string;
  desc: string;
}

export interface ModulePayload {
  courseId: string;
  name: string;
  title: string;
  desc: string;
}


// Получить все модули курса
export const getModules = async (courseId: string): Promise<Module[]> => {
  return apiClient<Module[]>(`/modules/course/${courseId}`);
};

// Создать модуль
export const createModule = async (payload: ModulePayload): Promise<Module> => {
  return apiClient<Module>("/modules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const patchModule = async (id: string, payload: Partial<ModulePayload>): Promise<Module> => {
  return apiClient<Module>(`/modules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

// Удалить модуль
export const deleteModule = async (id: string): Promise<void> => {
  return apiClient<void>(`/modules/${id}`, { method: "DELETE" });
};

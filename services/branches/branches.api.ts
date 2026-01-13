import { apiClient } from "../apiClient";

export interface Branch {
  id: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  mapLink: string;
  createdAt?: string;
}

export interface BranchPayload {
  city: string;
  phone: string;
  email: string;
  address: string;
  mapLink: string;
}

// Получить все филиалы
export const getBranches = async (): Promise<Branch[]> => {
  return apiClient<Branch[]>("/branches");
};

// Создать новый филиал
export const createBranch = async (payload: BranchPayload): Promise<Branch> => {
  return apiClient<Branch>("/branches", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Обновить филиал
export const patchBranch = async (id: string, payload: BranchPayload): Promise<Branch> => {
  return apiClient<Branch>(`/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Удалить филиал
export const deleteBranch = async (id: string): Promise<void> => {
  return apiClient<void>(`/branches/${id}`, {
    method: "DELETE",
  });
};

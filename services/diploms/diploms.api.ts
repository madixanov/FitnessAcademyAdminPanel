import { apiClient } from "../apiClient";

export interface Diploma {
  id?: string;
  codeDiplom: string;
  courseId: string;
  course?: {
    id: string;
    name: string;
    price?: number;
  };
  teacherId: string;
  userId: string;
  img: string[]; 
  createdAt?: string;
  issuedAt: string;
  courseFinishedAt: string
}

// Получить все дипломы
export const getDiplomas = async (): Promise<Diploma[]> => {
  return apiClient<Diploma[]>("/diploms");
};

// Загрузить новый диплом
export const uploadDiploma = async (payload: Diploma): Promise<Diploma> => {
  return apiClient<Diploma>("/diploms", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Удалить диплом
export const deleteDiploma = async (id: string): Promise<void> => {
  return apiClient<void>(`/diploms/${id}`, {
    method: "DELETE",
  });
};

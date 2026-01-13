import { apiClient } from "../apiClient";

export interface TrainerPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  img?: string | null;
  experience: number;
  description: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  img?: string | null;
  experience: number;
  description: string;
  createdAt: string;  
}

export async function createTrainer(payload: Omit<TrainerPayload, "id" | "createdAt">): Promise<TrainerPayload> {
  return await apiClient<TrainerPayload>("/trainers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchTrainer(
  id: string,
  payload: Omit<TrainerPayload, "id" | "createdAt">
): Promise<TrainerPayload> {
  return await apiClient<TrainerPayload>(`/trainers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getTrainers(): Promise<Trainer[]> {
  try {
    const data = await apiClient<Trainer[]>("/trainers");
    return data;
  } catch (err: any) {
    console.error("Ошибка при получении тренеров:", err.message);
    return [];
  }
}

export async function deleteTrainer(id: string): Promise<boolean> {
  try {
    await apiClient(`/trainers/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err: any) {
    console.error("Ошибка при удалении тренера:", err.message);
    return false;
  }
}

import { apiClient } from "../apiClient";

/* ===== TYPES ===== */
export interface CreatePhotoPayload {
  imageUrl: string;
}

export interface Photo {
  id: string;
  imageUrl: string;
  createdAt: string;
}

/* ===== GET PHOTOS ===== */
export const getPhotos = async (): Promise<Photo[]> => {
  return apiClient<Photo[]>("/photos", {
    method: "GET",
  });
};

/* ===== CREATE PHOTO ===== */
export const createPhoto = async (
  payload: CreatePhotoPayload
): Promise<Photo> => {
  return apiClient<Photo>("/photos", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/* ===== DELETE PHOTO ===== */
export const deletePhoto = async (id: string): Promise<void> => {
  return apiClient<void>(`/photos/${id}`, {
    method: "DELETE",
  });
};
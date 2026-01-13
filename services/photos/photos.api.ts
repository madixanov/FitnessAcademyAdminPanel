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

/* ===== CREATE PHOTO ===== */
export const getPhotos = async (): Promise<Photo[]> => {
  return apiClient<Photo[]>("/photos", {
    method: "GET",
  });
};

/* ===== CREATE ===== */
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

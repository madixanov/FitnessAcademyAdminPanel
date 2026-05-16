import { apiClient } from "../apiClient";

export interface QrCode {
  id?: string;
  title: string;
  photo_url: string;
  createdAt?: string;
}

// Получить все QR-коды
export const getQrCodes = async (): Promise<QrCode[]> => {
  return apiClient<QrCode[]>("/qrcode");
};

// Получить QR-код по ID
export const getQrCodeById = async (id: string): Promise<QrCode> => {
  return apiClient<QrCode>(`/qrcode/${id}`);
};

// Создать QR-код
export const createQrCode = async (
  payload: QrCode
): Promise<QrCode> => {
  return apiClient<QrCode>("/qrcode", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Удалить QR-код
export const deleteQrCode = async (
  id: string
): Promise<void> => {
  return apiClient<void>(`/qrcode/${id}`, {
    method: "DELETE",
  });
};
import { uploadApiClient } from "../uploadApiClient";

export interface UploadResponse {
  url: string;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  if (!files.length) return [];

  const formData = new FormData();
  formData.append("image", files[0]); // как в curl

  const res = await uploadApiClient<UploadResponse>("/auth/upload-all", formData);

  return [res.url];
}

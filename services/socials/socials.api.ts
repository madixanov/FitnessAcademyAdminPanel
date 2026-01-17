import { apiClient } from "../apiClient";

export interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

// ================= GET =================
export const getSocialNetworks = async (): Promise<SocialNetwork[]> => {
  return apiClient<SocialNetwork[]>("/social-networks", {
    method: "GET",
  });
};

export const getSocialNetworkById = async (id: string): Promise<SocialNetwork> => {
  return apiClient<SocialNetwork>(`/social-networks/${id}`, {
    method: "GET",
  });
};

// ================= CREATE =================
export interface CreateSocialNetworkPayload {
  name: string;
  url: string;
}

export const createSocialNetwork = async (payload: CreateSocialNetworkPayload): Promise<SocialNetwork> => {
  return apiClient<SocialNetwork>("/social-networks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// ================= UPDATE =================
export interface UpdateSocialNetworkPayload {
  name?: string;
  url?: string;
}

export const patchSocialNetwork = async (id: string, payload: UpdateSocialNetworkPayload): Promise<SocialNetwork> => {
  return apiClient<SocialNetwork>(`/social-networks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

// ================= DELETE =================
export const deleteSocialNetwork = async (id: string): Promise<void> => {
  return apiClient<void>(`/social-networks/${id}`, {
    method: "DELETE",
  });
};

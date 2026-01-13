import { apiClient } from "../apiClient";

export interface Answer {
  id?: string;
  text: string;
  isRight: boolean;
  questionId: string;
}

export interface AnswerPayload {
  text: string;
  isRight: boolean;
  questionId: string;
}

// создать ответ
export const createAnswer = async (payload: AnswerPayload): Promise<Answer> => {
  return apiClient<Answer>("/tests/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

// обновить ответ
export const patchAnswer = async (id: string, payload: AnswerPayload): Promise<Answer> => {
  return apiClient<Answer>(`/tests/answer/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

// удалить ответ
export const deleteAnswer = async (id: string): Promise<void> => {
  return apiClient<void>(`/tests/answer/${id}`, {
    method: "DELETE",
  });
};

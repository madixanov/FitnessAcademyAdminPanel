import { apiClient } from "../apiClient";

export interface Question {
  id?: string;
  questionNumber: number;
  question: string;
  testId: string;
  img?: string[];
  createdAt?: string;
}

export interface QuestionPayload {
  questionNumber: number;
  question: string;
  testId: string;
  img?: string[];
}

/* ===== CREATE QUESTION ===== */
export const createQuestion = async (testId: string, payload: QuestionPayload): Promise<Question> => {
  return apiClient<Question>(`/tests/question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

/* ===== PATCH QUESTION ===== */
export const patchQuestion = async (testId: string, questionId: string, payload: QuestionPayload): Promise<Question> => {
  return apiClient<Question>(`/tests/question/${questionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

/* ===== DELETE QUESTION ===== */
export const deleteQuestion = async (testId: string, questionId: string): Promise<void> => {
  return apiClient<void>(`/tests/question/${questionId}`, {
    method: "DELETE",
  });
};

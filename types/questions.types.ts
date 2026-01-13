// question.types.ts
export interface Answer {
  id?: string;
  text: string;
  isRight: boolean;
  questionId: string;
}

export interface Question {
  id?: string;
  questionNumber: number;
  question: string;
  testId: string;
  img?: string[];
  answers?: Answer[];
}

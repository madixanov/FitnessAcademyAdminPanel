"use client";

import { useEffect, useState } from "react";
import { getTest } from "@/services/tests/tests.api";
import {
  createQuestion,
  patchQuestion,
  deleteQuestion,
  Question,
  QuestionPayload,
} from "@/services/tests/question.api";
import AnswersModal from "./AnswerModal";

interface Props {
  testId: string;
  onClose: () => void;
}

export default function QuestionsModal({ testId, onClose }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Question | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    question: "",
    img: [] as string[],
  });

  const fetchQuestions = async () => {
    const test = await getTest(testId);
    setQuestions(test.questions || []);
  };

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: QuestionPayload = {
      testId,
      question: form.question,
      img: form.img,
      questionNumber: editing ? editing.questionNumber : questions.length,
    };

    if (editing?.id) {
      await patchQuestion(testId, editing.id, payload);
    } else {
      await createQuestion(testId, payload);
    }

    setEditing(null);
    setForm({ question: "", img: [] });
    fetchQuestions();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить вопрос?")) return;
    await deleteQuestion(testId, id);
    fetchQuestions();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-lg rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Вопросы</h3>

          <form onSubmit={submit} className="space-y-2 mb-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="Текст вопроса"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              required
            />

            <button className="bg-orange-500 text-white px-4 py-2 rounded">
              {editing ? "Сохранить" : "Добавить"}
            </button>
          </form>

          <div className="space-y-2">
            {questions.map(q => (
              <div key={q.id} className="border p-2 rounded flex justify-between">
                <span>{q.question}</span>

                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditing(q);
                    setForm({ question: q.question, img: q.img || [] });
                  }}>
                    ✏️
                  </button>

                  <button onClick={() => remove(q.id!)}>🗑️</button>

                  <button
                    className="text-green-600"
                    onClick={() => setActiveQuestionId(q.id!)}
                  >
                    Ответы
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={onClose} className="mt-4 text-sm text-gray-500">
            Закрыть
          </button>
        </div>
      </div>

      {activeQuestionId && (
        <AnswersModal
          testId={testId}
          questionId={activeQuestionId}
          onClose={() => setActiveQuestionId(null)}
        />
      )}
    </>
  );
}

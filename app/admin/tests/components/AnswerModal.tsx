"use client";

import { useEffect, useState } from "react";
import { getTest } from "@/services/tests/tests.api";
import {
  createAnswer,
  patchAnswer,
  deleteAnswer,
  Answer,
} from "@/services/tests/answer.api";

interface Props {
  testId: string;
  questionId: string;
  onClose: () => void;
}

export default function AnswersModal({ testId, questionId, onClose }: Props) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [editing, setEditing] = useState<Answer | null>(null);
  const [text, setText] = useState("");
  const [isRight, setIsRight] = useState(false);

  const fetchAnswers = async () => {
    const test = await getTest(testId);
    const q = test.questions.find(q => q.id === questionId);
    setAnswers(q?.answers || []);
  };

  useEffect(() => {
    fetchAnswers();
  }, [testId, questionId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { text, isRight, questionId };

    if (editing?.id) {
      await patchAnswer(editing.id, payload);
    } else {
      await createAnswer(payload);
    }

    setEditing(null);
    setText("");
    setIsRight(false);
    fetchAnswers();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить ответ?")) return;
    await deleteAnswer(id);
    fetchAnswers();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-4 w-full max-w-md rounded-lg">
        <h4 className="font-semibold mb-3">Ответы</h4>

        <form onSubmit={submit} className="space-y-2 mb-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Ответ"
            value={text}
            onChange={e => setText(e.target.value)}
            required
          />

          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={isRight}
              onChange={e => setIsRight(e.target.checked)}
            />
            Правильный
          </label>

          <button className="bg-orange-500 text-white px-3 py-1 rounded">
            {editing ? "Сохранить" : "Добавить"}
          </button>
        </form>

        {answers.map(a => (
          <div key={a.id} className="border p-2 rounded flex justify-between">
            <span>{a.text} {a.isRight && "✅"}</span>

            <div className="flex gap-2">
              <button onClick={() => {
                setEditing(a);
                setText(a.text);
                setIsRight(a.isRight);
              }}>
                ✏️
              </button>
              <button onClick={() => remove(a.id!)}>🗑️</button>
            </div>
          </div>
        ))}

        <button onClick={onClose} className="mt-3 text-sm text-gray-500">
          Закрыть
        </button>
      </div>
    </div>
  );
}

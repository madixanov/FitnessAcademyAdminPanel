"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Ошибка приложения:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Произошла ошибка
        </h1>
        <p className="text-gray-600">
          Не удалось загрузить страницу. Попробуйте повторить действие.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}

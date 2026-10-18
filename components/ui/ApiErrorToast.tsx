"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ApiErrorToastItem {
  id: number;
  message: string;
}

export default function ApiErrorToast() {
  const [toasts, setToasts] = useState<ApiErrorToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timerMap = timers.current;

    const dismiss = (id: number) => {
      const timer = timerMap.get(id);
      if (timer) clearTimeout(timer);
      timerMap.delete(id);
      setToasts(current => current.filter(toast => toast.id !== id));
    };

    const onApiError = (event: Event) => {
      const { message } = (event as CustomEvent<{ message: string }>).detail;
      const id = nextId.current++;

      setToasts(current => [...current, { id, message }]);
      timerMap.set(id, setTimeout(() => dismiss(id), 6000));
    };

    window.addEventListener("api-error", onApiError);
    return () => {
      window.removeEventListener("api-error", onApiError);
      timerMap.forEach(timer => clearTimeout(timer));
      timerMap.clear();
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="assertive"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-white p-4 text-red-800 shadow-lg"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Закрыть уведомление"
            onClick={() => {
              const timer = timers.current.get(toast.id);
              if (timer) clearTimeout(timer);
              timers.current.delete(toast.id);
              setToasts(current => current.filter(item => item.id !== toast.id));
            }}
            className="shrink-0 text-red-600 hover:text-red-800"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

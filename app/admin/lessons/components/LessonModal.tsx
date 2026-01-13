"use client";

import { useState, useEffect } from "react";
import { uploadFiles } from "@/services/upload/upload.api";
import { Lesson, LessonPayload } from "@/services/lessons/lessons.api";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onSubmit: (payload: LessonPayload & { startsAt: string; status: string }) => void;
  initialData?: {
    courseId: string;
    modulId: string;
  };
}

export default function LessonModal({ isOpen, onClose, lesson, onSubmit, initialData }: LessonModalProps) {
  const [formData, setFormData] = useState({
    courseId: initialData?.courseId || "",
    modulId: initialData?.modulId || "",
    name: lesson?.name || "",
    title: lesson?.title || "",
    video: lesson?.video || "",
    img: lesson?.img || [],
    desc: lesson?.desc || "",
    duration: lesson?.duration?.toString() || "",
    startsAt: lesson?.startsAt || "",
    status: lesson?.status || "DRAFT",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      duration: Number(formData.duration),
    });
  };

  useEffect(() => {
    // если редактируем или открываем новый урок, обновляем formData
    setFormData({
      courseId: initialData?.courseId || lesson?.courseId || "",
      modulId: initialData?.modulId || lesson?.modulId || "",
      name: lesson?.name || "",
      title: lesson?.title || "",
      video: lesson?.video || "",
      img: lesson?.img || [],
      desc: lesson?.desc || "",
      duration: lesson?.duration?.toString() || "",
      startsAt: lesson?.startsAt || "",
      status: lesson?.status || "DRAFT",
    });
  }, [lesson, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <h2 className="text-xl font-semibold">{lesson ? "Редактировать урок" : "Добавить урок"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium">Название урока</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          {/* Заголовок */}
          <div>
            <label className="block text-sm font-medium">Заголовок</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium">Описание</label>
            <textarea
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              className="w-full border rounded-md p-2"
              rows={3}
            />
          </div>

          {/* Видео */}
          <div>
            <label className="block text-sm font-medium">Видео (URL)</label>
            <input
              type="text"
              value={formData.video}
              onChange={e => setFormData({ ...formData, video: e.target.value })}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Изображения */}
          <div>
            <label className="block text-sm font-medium mb-1">Файлы урока</label>

            {/* Превью файлов */}
            <div className="flex flex-wrap gap-3 mb-2">
              {formData.img.length > 0 ? (
                formData.img.map((url, idx) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                  return (
                    <div
                      key={idx}
                      className="relative w-32 h-20 border rounded overflow-hidden flex items-center justify-center"
                    >
                      {isImage ? (
                        <img src={url} alt={`file-${idx}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-gray-700 px-1 text-center">
                          {url.split("/").pop()}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            img: prev.img.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">Файлы не добавлены</p>
              )}
            </div>

            {/* Загрузка новых файлов */}
            <input
              type="file"
              multiple
              onChange={async e => {
                if (!e.target.files) return;

                const files = Array.from(e.target.files);

                try {
                  // Загружаем все выбранные файлы и получаем массив URL
                  const urls = await uploadFiles(files);

                  // Добавляем новые URL в массив img
                  setFormData(prev => ({
                    ...prev,
                    img: [...prev.img, ...urls],
                  }));
                } catch (err) {
                  console.error("Ошибка загрузки файлов", err);
                }
              }}
              className="block w-full text-sm"
            />
          </div>

          {/* Длительность */}
          <div>
            <label className="block text-sm font-medium">Длительность (мин)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: e.target.value })}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Дата начала */}
          <div>
            <label className="block text-sm font-medium">Дата начала</label>
            <input
              type="datetime-local"
              value={formData.startsAt}
              onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium">Статус</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED" })}
              className="w-full border rounded-md p-2"
            >
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликован</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
              {lesson ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Dialog, Transition } from "@headlessui/react";
import { X, Trash2 } from "lucide-react";
import React, { Fragment } from "react";

import { HomeworkPayload } from "@/services/homeworks/homeworks.api";

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Omit<HomeworkPayload, "lessonId"> & { lessonId: string };
  setFormData: React.Dispatch<
    React.SetStateAction<
      Omit<HomeworkPayload, "lessonId"> & { lessonId: string }
    >
  >;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HomeworkModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isUploading,
  handleFileChange,
}: HomeworkModalProps) {
  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 transition hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <Dialog.Title className="mb-4 text-xl font-semibold">
                Добавить домашнее задание
              </Dialog.Title>

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Название */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Название
                  </label>

                  <input
                    type="text"
                    className="w-full rounded-md border p-2 outline-none focus:border-orange-500"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Описание */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Описание
                  </label>

                  <textarea
                    className="w-full rounded-md border p-2 outline-none focus:border-orange-500"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Дедлайн */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Дедлайн
                  </label>

                  <input
                    type="datetime-local"
                    className="w-full rounded-md border p-2 outline-none focus:border-orange-500"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Файлы */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Файлы
                  </label>

                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full cursor-pointer rounded-md border p-2 text-sm"
                    disabled={isUploading}
                  />

                  {isUploading && (
                    <p className="mt-1 text-sm text-gray-500">
                      Загрузка файлов...
                    </p>
                  )}

                  {/* Список файлов */}
                  {formData.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.files.map((file, index) => {
                        const fileName = file.split("/").pop() || file;

                        return (
                          <div
                            key={`${file}-${index}`}
                            className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2"
                          >
                            <span
                              className="min-w-0 truncate text-sm text-gray-700"
                              title={fileName}
                            >
                              {fileName}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="ml-3 shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                              title="Удалить файл"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Кнопки */}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    className="rounded-md bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
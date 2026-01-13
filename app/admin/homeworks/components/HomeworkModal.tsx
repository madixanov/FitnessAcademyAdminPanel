"use client";

import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import React, { Fragment } from "react";
import { HomeworkPayload } from "@/services/homeworks/homeworks.api";

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Omit<HomeworkPayload, "lessonId"> & { lessonId: string };
  setFormData: React.Dispatch<
    React.SetStateAction<Omit<HomeworkPayload, "lessonId"> & { lessonId: string }>
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
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        {/* Modal panel */}
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
            <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <Dialog.Title className="text-xl font-semibold mb-4">
                Добавить домашнее задание
              </Dialog.Title>

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Название */}
                <div>
                  <label className="block text-sm font-medium mb-1">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-md w-full"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>

                {/* Описание */}
                <div>
                  <label className="block text-sm font-medium mb-1">Описание</label>
                  <textarea
                    className="border p-2 rounded-md w-full"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    required
                  />
                </div>

                {/* Дедлайн */}
                <div>
                  <label className="block text-sm font-medium mb-1">Дедлайн</label>
                  <input
                    type="datetime-local"
                    className="border p-2 rounded-md w-full"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                    required
                  />
                </div>

                {/* Файлы */}
                <div>
                  <label className="block text-sm font-medium mb-1">Файлы</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-sm text-gray-500 mt-1">Загрузка файлов...</p>
                  )}
                  {formData.files.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      {formData.files.map((f, i) => (
                        <li key={i}>{f.split("/").pop()}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Кнопки */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
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

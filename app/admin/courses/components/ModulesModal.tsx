"use client";

import { useEffect, useState } from "react";
import { getModules, createModule, patchModule, deleteModule, Module, ModulePayload } from "@/services/courses/modules.api";

interface ModulesModalProps {
  courseId: string;
  onClose: () => void;
}

export default function ModulesModal({ courseId, onClose }: ModulesModalProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModulePayload>({ name: "", title: "", desc: "", courseId });

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const data = await getModules(courseId);
      setModules(data);
    } catch (err) {
      console.error("Ошибка загрузки модулей", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const openEditModule = (mod: Module) => {
    setEditingModule(mod);
    setFormData({ name: mod.name, title: mod.title, desc: mod.desc, courseId: mod.courseId });
  };

  const openCreateModule = () => {
    setEditingModule(null);
    setFormData({ name: "", title: "", desc: "", courseId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await patchModule(editingModule.id, formData);
      } else {
        await createModule(formData);
      }
      await fetchModules();
      setEditingModule(null);
      setFormData({ name: "", title: "", desc: "", courseId });
    } catch (err) {
      console.error("Ошибка сохранения модуля", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить модуль?")) return;
    try {
      await deleteModule(id);
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Ошибка удаления модуля", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full sm:w-11/12 md:w-3/4 lg:w-2/3 max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Модули курса</h3>

        <button 
          onClick={openCreateModule} 
          className="mb-3 px-4 py-2 bg-green-500 text-white rounded w-full sm:w-auto"
        >
          Добавить модуль
        </button>

        {isLoading ? (
          <p>Загрузка...</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {modules.map(mod => (
              <li key={mod.id} className="border p-2 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium">{mod.name}</p>
                  <p className="text-sm text-gray-600">{mod.title}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button className="text-blue-500 text-sm" onClick={() => openEditModule(mod)}>Редактировать</button>
                  <button className="text-red-500 text-sm" onClick={() => handleDelete(mod.id)}>Удалить</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Название"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Заголовок"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <textarea
            className="w-full border px-3 py-2 rounded"
            placeholder="Описание"
            value={formData.desc}
            onChange={e => setFormData(prev => ({ ...prev, desc: e.target.value }))}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 border rounded w-full sm:w-auto"
              onClick={() => { setEditingModule(null); setFormData({ name: "", title: "", desc: "", courseId }); }}
            >
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded w-full sm:w-auto">
              {editingModule ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </form>

        <button onClick={onClose} className="mt-2 px-4 py-2 border rounded w-full">
          Закрыть
        </button>
      </div>
    </div>
  );
}

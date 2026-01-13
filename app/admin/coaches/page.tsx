"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import StatCard from "@/components/ui/StatCard";
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import {
  createTrainer,
  patchTrainer,
  getTrainers,
  deleteTrainer,
  TrainerPayload,
  Trainer,
} from "@/services/coaches/coaches.api";
import Skeleton from "./components/CoachesSkeleton";
import Cookies from "js-cookie";

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    experience: "",
    img: null as File | null,
    preview: "",
    description: "",
  });

  const [role, setRole] = useState<string | null>(null);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setRole(Cookies.get("role") || null);
  }, []);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const data = await getTrainers();
      setTrainers(data);
    } catch (err: any) {
      console.error("Ошибка при получении тренеров:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openAddModal = () => {
    setEditingTrainer(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      experience: "",
      img: null,
      preview: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phoneNumber: trainer.phoneNumber,
      password: trainer.password || "",
      experience: trainer.experience.toString(),
      img: null,
      preview: trainer.img || "",
      description: trainer.description || "",
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, img: file, preview: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: TrainerPayload = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      experience: Number(formData.experience),
      description: formData.description,
      password: formData.password,
    };

    try {
      if (editingTrainer) {
        await patchTrainer(editingTrainer.id, payload);
      } else {
        await createTrainer(payload);
      }

      await fetchTrainers();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Ошибка:", err.message);
    }
  };

  const deleteTrainerFunc = async (id: string) => {
    const ok = await deleteTrainer(id);
    if (!ok) return;
    setTrainers((prev) => prev.filter((t) => t.id !== id));
  };

  // Поиск
  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Всего тренеров" value={trainers.length.toString()} icon="🧑‍🏫" />
        <StatCard
          title="Средний опыт"
          value={
            trainers.length
              ? Math.round(trainers.reduce((a, t) => a + t.experience, 0) / trainers.length) + " лет"
              : "0"
          }
          icon="⭐"
        />
        <StatCard title="Контакты" value={trainers.length.toString()} icon="📞" />
      </div>

      {/* Поиск и кнопка добавить */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Поиск по имени, email или телефону..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        {role === "ADMIN" && (
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm"
            onClick={openAddModal}
          >
            Добавить тренера
          </button>
        )}
      </div>

      {/* Таблица */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto mt-2">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-sm font-medium text-gray-600">Фото</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">Имя</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden sm:table-cell">Email</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden sm:table-cell">Телефон</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden md:table-cell">Опыт</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden lg:table-cell">Дата добавления</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">Действия</th>
            </tr>
          </thead>
          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {paginatedTrainers.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {t.img ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={t.img.startsWith("http") ? t.img : `/uploads/${t.img}`}
                          alt={t.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                    )}
                  </td>
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{t.email}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{t.phoneNumber}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{t.experience} лет</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{t.createdAt}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {role === "ADMIN" ? (
                      <>
                        <button className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => openEditModal(t)}>Редактировать</button>
                        <button className="text-red-500 hover:text-red-700 text-sm" onClick={() => deleteTrainerFunc(t.id)}>Удалить</button>
                      </>
                    ) : (<p>Недостаточно прав</p>)}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-1 rounded-md ${p === currentPage ? "bg-orange-500 text-white" : "bg-gray-200"}`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Модалка */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-4">{editingTrainer ? "Редактировать тренера" : "Добавить тренера"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Имя" className="w-full border p-2 rounded-md" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
              <input type="email" placeholder="Email" className="w-full border p-2 rounded-md" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
              <input type="text" placeholder="Телефон" className="w-full border p-2 rounded-md" value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} required />
              <input type="number" placeholder="Опыт (лет)" className="w-full border p-2 rounded-md" value={formData.experience} onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))} required />
              <textarea placeholder="Описание" className="w-full border p-2 rounded-md h-24 resize-none" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="focus:outline-none border px-5 py-2 rounded-md w-full pr-12" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-5 h-5 text-[#999]" /> : <Eye className="w-5 h-5 text-[#999]" />}
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded-md" onClick={() => setIsModalOpen(false)}>Отмена</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md">{editingTrainer ? "Сохранить" : "Добавить"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

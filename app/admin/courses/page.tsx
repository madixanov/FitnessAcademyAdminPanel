"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Cookies from "js-cookie";
import {
  getCourses,
  createCourse,
  patchCourse,
  deleteCourse,
  CoursePayload,
  Course
} from "@/services/courses/courses.api";
import { getTrainers, Trainer } from "@/services/coaches/coaches.api";
import ModulesModal from "./components/ModulesModal";
import { uploadFiles } from "@/services/upload/upload.api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminCourses() {
  const [role, setRole] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [modulesCourseId, setModulesCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Omit<CoursePayload, "id">>({
    name: "",
    price: 0,
    description: "",
    date: "",
    image: [],
    level: 1,
    status: "INACTIVE",
    trainerId: "",
    Course_duration: "",
    Number_of_lessons: "",
    Training_format: "OFFLINE",
    Course_Benefits_Sheet: "",
  });

  useEffect(() => {
    setRole(Cookies.get("role") || null);
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (e) {
      console.error("Ошибка загрузки курсов", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const data = await getTrainers();
      setTrainers(data);
    } catch (e) {
      console.error("Ошибка загрузки тренеров", e);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      date: "",
      image: [],
      level: 1,
      status: "ACTIVE",
      trainerId: "",
      Course_duration: "",
      Number_of_lessons: "",
      Training_format: "OFFLINE",
      Course_Benefits_Sheet: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      price: course.price,
      description: course.description,
      date: course.date,
      image: course.image || [],
      level: course.level,
      status: course.status,
      trainerId: course.trainerId || "",
      Course_duration: course.Course_duration,
      Number_of_lessons: course.Number_of_lessons,
      Training_format: course.Training_format,
      Course_Benefits_Sheet: course.Course_Benefits_Sheet,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCourse && !formData.trainerId) {
      alert("При редактировании курса необходимо выбрать тренера");
      return;
    }

    try {
      const payload: CoursePayload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (editingCourse) {
        await patchCourse(editingCourse.id, payload);
      } else {
        await createCourse(payload);
      }

      await fetchCourses();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Ошибка сохранения курса", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить курс?")) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Ошибка удаления", e);
    }
  };

  const activeCourses = courses.filter(c => c.status === "ACTIVE").length;

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index),
    }));
  };

  const handleUploadImages = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    try {
      const files = Array.from(e.target.files);
      const uploaded = await uploadFiles(files);
      setFormData(prev => ({
        ...prev,
        image: [...prev.image, ...uploaded],
      }));
    } catch (err) {
      console.error("Ошибка загрузки изображений", err);
    }
  };

  // ===== Фильтрация по поиску =====
  const filteredCourses = courses.filter(c => {
    const trainerName = trainers.find(t => t.id === c.trainerId)?.name || "";
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-gray-50 w-full">
      {/* ===== STATISTICS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Все курсы" value={courses.length.toString()} icon="📚" />
        <StatCard title="Активные" value={activeCourses.toString()} icon="✅" />
        <StatCard title="Тренеры" value={trainers.length.toString()} icon="🧑‍🏫" />
      </div>

      {/* ===== SEARCH & ADD ===== */}
      <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Поиск по названию или тренеру..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        {role === "ADMIN" && (
          <button
            onClick={openCreateModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm"
          >
            Добавить курс
          </button>
        )}
      </div>

      {/* ===== COURSES TABLE ===== */}
      <div className="bg-white p-2 sm:p-4 rounded-xl shadow-sm overflow-x-auto mt-2">
        <table className="w-full text-left table-auto text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 sm:px-4 sm:py-2">Название</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">Цена</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">Тренер</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2">Статус</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">Дата</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">Длительность</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">Уроки</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">Формат</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden xl:table-cell">Преимущества</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2">Действия</th>
            </tr>
          </thead>

          <tbody>
            {!isLoading && paginatedCourses.map(course => (
              <tr key={course.id} className="border-b hover:bg-gray-50">
                <td className="px-2 py-1 sm:px-4 sm:py-2">{course.name}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">${course.price}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">{trainers.find(t => t.id === course.trainerId)?.name || "—"}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2">{course.status}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">{course.date.slice(0,10)}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">{course.Course_duration || "—"}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">{course.Number_of_lessons || "—"}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">{course.Training_format}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 hidden xl:table-cell max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{course.Course_Benefits_Sheet || "—"}</td>
                <td className="px-2 py-1 sm:px-4 sm:py-2 flex flex-wrap gap-1 sm:gap-2">
                  <button className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => openEditModal(course)}>✏️</button>
                  <button className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleDelete(course.id)}>🗑️</button>
                  <button className="text-green-500 hover:text-green-700 text-sm" onClick={() => setModulesCourseId(course.id)}>📚</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-gray-200 rounded-md disabled:opacity-50">
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => handlePageChange(p)} className={`px-3 py-1 rounded-md ${p === currentPage ? "bg-orange-500 text-white" : "bg-gray-200"}`}>
                {p}
              </button>
            ))}

            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-gray-200 rounded-md disabled:opacity-50">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ===== COURSE MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium">Название курса</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              {/* Цена */}
              <div>
                <label className="block text-sm font-medium">Цена</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: +e.target.value })}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>

              {/* Дата начала */}
              <div>
                <label className="block text-sm font-medium">Дата начала</label>
                <input
                  type="date"
                  value={formData.date.slice(0, 10)}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              {/* Уровень */}
              <div>
                <label className="block text-sm font-medium">Уровень</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: +e.target.value })}
                  className="w-full border rounded-md p-2"
                />
              </div>

              {/* Статус */}
              <div>
                <label className="block text-sm font-medium">Статус</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" | "PENDING" | "COMPLETED" })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="ACTIVE">Активный</option>
                  <option value="INACTIVE">Неактивный</option>
                  <option value="PENDING">Набор</option>
                  <option value="COMPLETED">Окончен</option>
                </select>
              </div>

              {/* Тренер */}
              <div>
                <label className="block text-sm font-medium">Тренер</label>
                <select
                  value={formData.trainerId}
                  onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="">Выберите тренера</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Длительность */}
              <div>
                <label className="block text-sm font-medium">Длительность курса</label>
                <input
                  type="text"
                  value={formData.Course_duration}
                  onChange={e => setFormData({ ...formData, Course_duration: e.target.value })}
                  className="w-full border rounded-md p-2"
                  placeholder="Например: 3 недели"
                />
              </div>

              {/* Уроки */}
              <div>
                <label className="block text-sm font-medium">Количество уроков</label>
                <input
                  type="text"
                  value={formData.Number_of_lessons}
                  onChange={e => setFormData({ ...formData, Number_of_lessons: e.target.value })}
                  className="w-full border rounded-md p-2"
                  placeholder="Например: 12"
                />
              </div>

              {/* Формат */}
              <div>
                <label className="block text-sm font-medium">Формат обучения</label>
                <select
                  value={formData.Training_format}
                  onChange={e => setFormData({ ...formData, Training_format: e.target.value as "ONLINE" | "OFFLINE" })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="OFFLINE">Офлайн</option>
                  <option value="ONLINE">Онлайн</option>
                </select>
              </div>

              {/* Преимущества */}
              <div>
                <label className="block text-sm font-medium">Преимущества курса</label>
                <textarea
                  value={formData.Course_Benefits_Sheet}
                  onChange={e => setFormData({ ...formData, Course_Benefits_Sheet: e.target.value })}
                  className="w-full border rounded-md p-2"
                  rows={3}
                  placeholder="Например: Доступ к материалам, Сертификат и т.д."
                />
              </div>

              {/* Изображения */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Фотографии курса</label>
                <div className="flex flex-wrap gap-3">
                  {formData.image.length > 0 ? (
                    formData.image.map((img, index) => (
                      <div
                        key={index}
                        className="relative group w-24 h-24 rounded overflow-hidden border"
                      >
                        <img
                          src={img}
                          alt="course"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full
                                    w-6 h-6 flex items-center justify-center text-sm
                                    opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Фотографии не добавлены</p>
                  )}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImages}
                  className="block w-full text-sm"
                />
              </div>

              {/* Кнопки */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
                >
                  {editingCourse ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODULES MODAL ===== */}
      {modulesCourseId && (
        <ModulesModal courseId={modulesCourseId} onClose={() => setModulesCourseId(null)} />
      )}
    </div>
  );
}

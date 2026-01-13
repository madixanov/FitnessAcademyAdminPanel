"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import StatCard from "@/components/ui/StatCard";
import { uploadFiles } from "@/services/upload/upload.api";

import {
  createLesson,
  patchLesson,
  getLessonsByModule,
  getAllLessons,
  deleteLesson,
  Lesson,
  LessonPayload,
} from "@/services/lessons/lessons.api";

import { getCourses, Course } from "@/services/courses/courses.api";
import { getModules, Module } from "@/services/courses/modules.api";

import Skeleton from "./components/LessonSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LessonModal from "./components/LessonModal";

const role = Cookies.get("role");

export default function AdminLessons() {
  // -------------------------
  // DATA
  // -------------------------
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  // -------------------------
  // UI STATE
  // -------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [isModulesLoading, setIsModulesLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // -------------------------
  // SEARCH & PAGINATION
  // -------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -------------------------
  // FORM
  // -------------------------
  const [formData, setFormData] = useState<{
    courseId: string;
    modulId: string;
    name: string;
    title: string;
    video: string;
    img: string[]; // массив картинок
    desc: string;
    duration: string;
    startsAt: string;
    status: string;
  }>({
    courseId: "",
    modulId: "",
    name: "",
    title: "",
    video: "",
    img: [],
    desc: "",
    duration: "",
    startsAt: "",
    status: "DRAFT",
  });

  // -------------------------
  // LOAD COURSES
  // -------------------------
  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  // -------------------------
  // LOAD ALL LESSONS
  // -------------------------
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await getAllLessons();
        setAllLessons(data);
        setLessons(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // -------------------------
  // LOAD MODULES
  // -------------------------
  const fetchModules = async (courseId: string) => {
    setIsModulesLoading(true);
    try {
      const data = await getModules(courseId);
      setModules(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsModulesLoading(false);
    }
  };

  // -------------------------
  // LOAD LESSONS BY MODULE
  // -------------------------
  const fetchLessonsByModule = async (moduleId: string) => {
    setIsLoading(true);
    try {
      const data = await getLessonsByModule(moduleId);
      setLessons(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // MODALS
  // -------------------------
  const openAddModal = () => {
  setEditingLesson(null);
  setFormData({
    courseId: selectedCourse,   // <- вот здесь
    modulId: selectedModule,    // <- и здесь
    name: "",
    title: "",
    video: "",
    img: [],
    desc: "",
    duration: "",
    startsAt: "",
    status: "DRAFT",
  });
  setIsModalOpen(true);
};

const openEditModal = async (lesson: Lesson) => {
  setEditingLesson(lesson);
  setFormData({
    courseId: lesson.courseId,
    modulId: lesson.modulId,
    name: lesson.name,
    title: lesson.title,
    video: lesson.video,
    img: lesson.img || [],
    desc: lesson.desc,
    duration: lesson.duration.toString(),
    startsAt: lesson.startsAt || "",
    status: lesson.status || "DRAFT",
  });
  await fetchModules(lesson.courseId);
  setIsModalOpen(true);
};

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: LessonPayload & { startsAt: string; status: string } = {
      courseId: formData.courseId,
      modulId: formData.modulId,
      name: formData.name,
      title: formData.title,
      video: formData.video,
      img: formData.img,
      desc: formData.desc,
      duration: Number(formData.duration),
      startsAt: formData.startsAt,
      status: formData.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    };

    try {
      if (editingLesson) {
        await patchLesson(editingLesson.id, payload);
      } else {
        await createLesson(payload);
      }

      if (selectedModule) {
        await fetchLessonsByModule(formData.modulId);
      } else {
        const data = await getAllLessons();
        setAllLessons(data);
        setLessons(data);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const saveLesson = async (payload: LessonPayload & { startsAt: string; status: string }) => {
    try {
      // Преобразуем дату в ISO
      const formattedPayload = {
        ...payload,
        startsAt: payload.startsAt ? new Date(payload.startsAt).toISOString() : "",
      };

      if (editingLesson) {
        await patchLesson(editingLesson.id, formattedPayload);
      } else {
        await createLesson(formattedPayload);
      }

      if (selectedModule) {
        await fetchLessonsByModule(formattedPayload.modulId);
      } else {
        const data = await getAllLessons();
        setAllLessons(data);
        setLessons(data);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err.message);
    }
  };


  // -------------------------
  // DELETE
  // -------------------------
  const deleteLessonFunc = async (id: string) => {
    const ok = await deleteLesson(id);
    if (!ok) return;
    setLessons(prev => prev.filter(l => l.id !== id));
    setAllLessons(prev => prev.filter(l => l.id !== id));
  };

  // -------------------------
  // FILTERING + SEARCH
  // -------------------------
  const filteredLessons = allLessons
    .filter(l => (selectedCourse ? l.courseId === selectedCourse : true))
    .filter(l => (selectedModule ? l.modulId === selectedModule : true))
    .filter(l =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, selectedModule, searchTerm]);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Уроков" value={lessons.length.toString()} icon="📘" />
        <StatCard
          title="Длительность"
          value={lessons.length ? lessons.reduce((a, l) => a + l.duration, 0) + " мин" : "0"}
          icon="⏱️"
        />
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Поиск по уроку..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          className="border p-2 rounded-md"
          value={selectedCourse}
          onChange={e => {
            const courseId = e.target.value;
            setSelectedCourse(courseId);
            setSelectedModule("");
            setModules([]);
            if (courseId) fetchModules(courseId);
          }}
        >
          <option value="">Выберите курс</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded-md disabled:bg-gray-100"
          value={selectedModule}
          onChange={e => {
            const moduleId = e.target.value;
            setSelectedModule(moduleId);
            if (moduleId) fetchLessonsByModule(moduleId);
          }}
          disabled={!modules.length}
        >
          <option value="">{isModulesLoading ? "Загрузка модулей..." : "Выберите модуль"}</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {selectedModule && (
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md" onClick={openAddModal}>
            Добавить урок
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Урок</th>
              <th className="px-4 py-2">Длительность</th>
              <th className="px-4 py-2">Дата начала</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {paginatedLessons.map(l => (
                <tr key={l.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.title}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{l.duration} мин</td>
                  <td className="px-4 py-3 text-center">
                    {l.startsAt ? new Date(l.startsAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3 justify-center">
                    <button onClick={() => openEditModal(l)} className="text-blue-500">Редактировать</button>
                    <button onClick={() => deleteLessonFunc(l.id)} className="text-red-500">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* PAGINATION */}
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

      <LessonModal
        isOpen={isModalOpen}                 // открыта ли модалка
        onClose={() => setIsModalOpen(false)} // закрытие модалки
        lesson={editingLesson}               // урок, который редактируем (null для нового)
        onSubmit={saveLesson}              // функция отправки данных
        initialData={{
          courseId: selectedCourse,   // <- передаем выбранный курс
          modulId: selectedModule,    // <- передаем выбранный модуль
        }}
      />
    </div>
  );
}

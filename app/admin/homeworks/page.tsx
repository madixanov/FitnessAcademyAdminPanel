"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import StatCard from "@/components/ui/StatCard";
import HomeworkModal from "./components/HomeworkModal";
import Skeleton from "./components/HomeworkSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  createHomework,
  deleteHomework,
  getHomeworkByLesson,
  getAllHomeworks,
  Homework,
  HomeworkPayload,
} from "@/services/homeworks/homeworks.api";

import { getCourses, Course } from "@/services/courses/courses.api";
import { getModules, Module } from "@/services/courses/modules.api";
import { getLessonsByModule, Lesson } from "@/services/lessons/lessons.api";

import { uploadFiles } from "@/services/upload/upload.api";

const role = Cookies.get("role");

export default function AdminHomework() {
  // -------------------------
  // DATA
  // -------------------------
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  // -------------------------
  // UI STATE
  // -------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [isModulesLoading, setIsModulesLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // -------------------------
  // SEARCH & PAGINATION
  // -------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -------------------------
  // FORM
  // -------------------------
  const [formData, setFormData] = useState<Omit<HomeworkPayload, "lessonId"> & { lessonId: string }>({
    title: "",
    description: "",
    files: [],
    deadline: "",
    lessonId: selectedLesson,
  });

  // -------------------------
  // LOAD COURSES
  // -------------------------
  useEffect(() => {
    getCourses().then(setCourses);
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
  // LOAD LESSONS
  // -------------------------
  const fetchLessons = async (moduleId: string) => {
    setIsLessonsLoading(true);
    try {
      const data = await getLessonsByModule(moduleId);
      setLessons(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLessonsLoading(false);
    }
  };

  // -------------------------
  // LOAD HOMEWORK
  // -------------------------
  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHomeworks();
      setAllHomeworks(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHomeworkByLesson = async (lessonId: string) => {
    setIsLoading(true);
    try {
      const data = await getHomeworkByLesson(lessonId);
      setAllHomeworks(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // -------------------------
  // MODAL
  // -------------------------
  const openAddModal = () => {
    setFormData({
      title: "",
      description: "",
      files: [],
      deadline: "",
      lessonId: selectedLesson,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      files: [],
      deadline: "",
      lessonId: selectedLesson,
    });
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lessonId) return;

    const payload: HomeworkPayload = {
      ...formData,
      deadline: new Date(formData.deadline).toISOString(),
    };

    try {
      await createHomework(payload);
      fetchHomeworkByLesson(formData.lessonId);
      closeModal();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------
  const deleteHomeworkFunc = async (id: string) => {
    const ok = await deleteHomework(id);
    if (!ok) return;
    setAllHomeworks(prev => prev.filter(h => h.id !== id));
  };

  // -------------------------
  // FILE UPLOAD
  // -------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    try {
      const urls = await uploadFiles(Array.from(files));
      setFormData(prev => ({ ...prev, files: [...prev.files, ...urls] }));
    } catch (err: any) {
      console.error("Ошибка загрузки файлов:", err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // -------------------------
  // FILTER + SEARCH + PAGINATION
  // -------------------------
  const filteredHomeworks = allHomeworks
    .filter(h => (selectedLesson ? h.lessonId === selectedLesson : true))
    .filter(h =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredHomeworks.length / itemsPerPage);
  const paginatedHomeworks = filteredHomeworks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => setCurrentPage(1), [selectedCourse, selectedModule, selectedLesson, searchTerm]);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="ДЗ" value={filteredHomeworks.length.toString()} icon="📝" />
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Поиск по домашке..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          className="border p-2 rounded-md"
          value={selectedCourse}
          onChange={(e) => {
            const courseId = e.target.value;
            setSelectedCourse(courseId);
            setSelectedModule("");
            setSelectedLesson("");
            setModules([]);
            setLessons([]);
            if (courseId) fetchModules(courseId);
          }}
        >
          <option value="">Выберите курс</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className="border p-2 rounded-md disabled:bg-gray-100"
          value={selectedModule}
          onChange={(e) => {
            const moduleId = e.target.value;
            setSelectedModule(moduleId);
            setSelectedLesson("");
            setLessons([]);
            if (moduleId) fetchLessons(moduleId);
          }}
          disabled={!modules.length}
        >
          <option value="">{isModulesLoading ? "Загрузка модулей..." : "Выберите модуль"}</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <select
          className="border p-2 rounded-md disabled:bg-gray-100"
          value={selectedLesson}
          onChange={(e) => {
            const lessonId = e.target.value;
            setSelectedLesson(lessonId);
            setFormData(prev => ({ ...prev, lessonId })); // синхронизация
            if (lessonId) fetchHomeworkByLesson(lessonId);
          }}
          disabled={!lessons.length}
        >
          <option value="">{isLessonsLoading ? "Загрузка уроков..." : "Выберите урок"}</option>
          {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>

        {selectedLesson && (
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md" onClick={openAddModal}>
            Добавить ДЗ
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Название</th>
              <th className="px-4 py-2">Дедлайн</th>
              <th className="px-4 py-2">Файлы</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>

          {isLoading ? <Skeleton /> : (
            <tbody>
              {paginatedHomeworks.map(hw => (
                <tr key={hw.id} className="border-b">
                  <td className="px-4 py-3">{hw.title}</td>
                  <td className="px-4 py-3 text-center">{new Date(hw.deadline).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {hw.files.map((f, i) => (
                      <a key={i} href={f} target="_blank" className="block text-blue-500 underline">
                        {f.split("/").pop()}
                      </a>
                    ))}
                  </td>
                  <td className="px-4 py-3 flex gap-3 justify-center">
                    <button onClick={() => deleteHomeworkFunc(hw.id)} className="text-red-500">Удалить</button>
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

      {/* MODAL */}
      <HomeworkModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
      />
    </div>
  );
}

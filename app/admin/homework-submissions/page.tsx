"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import StatCard from "@/components/ui/StatCard";
import { getAllHomeworks, Homework } from "@/services/homeworks/homeworks.api";
import { getHomeworkSolutions, patchHomeworkSolution, HomeworkSolution } from "@/services/homeworks/submissions.api";
import { getCourses, Course } from "@/services/courses/courses.api";
import { getModules, Module } from "@/services/courses/modules.api";
import { getLessonsByModule, Lesson } from "@/services/lessons/lessons.api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const role = Cookies.get("role");

export default function AdminHomeworkSolutions() {
  // -------------------------
  // DATA
  // -------------------------
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [solutions, setSolutions] = useState<HomeworkSolution[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedHomework, setSelectedHomework] = useState("");

  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [statusForm, setStatusForm] = useState<"PENDING" | "CHECKED" | "REJECTED">("PENDING");

  const [isLoading, setIsLoading] = useState(false);
  const [isModulesLoading, setIsModulesLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);

  // -------------------------
  // SEARCH & PAGINATION
  // -------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -------------------------
  // LOAD COURSES
  // -------------------------
  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

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

  const fetchHomeworks = async (lessonId: string) => {
    setIsLoading(true);
    try {
      const data = await getAllHomeworks();
      const filtered = lessonId ? data.filter(hw => hw.lessonId === lessonId) : data;
      setHomeworks(filtered);
      setSelectedHomework("");
      setSolutions([]);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSolutions = async (homeworkId: string) => {
    if (!homeworkId) {
      setSolutions([]);
      return;
    }
    setIsLoading(true);
    try {
      const sols = await getHomeworkSolutions(homeworkId);
      setSolutions(sols);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // HANDLE EDIT
  // -------------------------
  const openEditModal = (sol: HomeworkSolution) => {
    setEditingSolutionId(sol.id);
    setStatusForm(sol.status);
  };

  const handlePatchSolution = async () => {
    if (!editingSolutionId) return;
    try {
      await patchHomeworkSolution(editingSolutionId, { status: statusForm });
      await fetchSolutions(selectedHomework);
      setEditingSolutionId(null);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // -------------------------
  // FILTER + SEARCH + PAGINATION
  // -------------------------
  const filteredSolutions = solutions
    .filter(sol =>
      sol.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredSolutions.length / itemsPerPage);
  const paginatedSolutions = filteredSolutions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedHomework]);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Решений" value={solutions.length.toString()} icon="📝" />
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Поиск по студенту, email, тексту..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          className="border p-2 rounded-md"
          value={selectedCourse}
          onChange={async e => {
            const courseId = e.target.value;
            setSelectedCourse(courseId);
            setSelectedModule("");
            setSelectedLesson("");
            setSelectedHomework("");
            setLessons([]);
            setModules([]);
            setHomeworks([]);
            setSolutions([]);
            if (courseId) await fetchModules(courseId);
          }}
        >
          <option value="">Выберите курс</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className="border p-2 rounded-md disabled:bg-gray-100"
          value={selectedModule}
          onChange={async e => {
            const moduleId = e.target.value;
            setSelectedModule(moduleId);
            setSelectedLesson("");
            setSelectedHomework("");
            setHomeworks([]);
            setSolutions([]);
            if (moduleId) await fetchLessons(moduleId);
          }}
          disabled={!modules.length}
        >
          <option value="">Выберите модуль</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <select
          className="border p-2 rounded-md disabled:bg-gray-100"
          value={selectedLesson}
          onChange={async e => {
            const lessonId = e.target.value;
            setSelectedLesson(lessonId);
            await fetchHomeworks(lessonId);
          }}
          disabled={!lessons.length}
        >
          <option value="">Выберите урок</option>
          {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>

        <select
          className="border p-2 rounded-md disabled:bg-gray-100"
          value={selectedHomework}
          onChange={async e => {
            const hwId = e.target.value;
            setSelectedHomework(hwId);
            await fetchSolutions(hwId);
          }}
          disabled={!homeworks.length}
        >
          <option value="">Выберите домашку</option>
          {homeworks.map(hw => <option key={hw.id} value={hw.id}>{hw.title}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Студент</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Телефон</th>
              <th className="px-4 py-2 text-left">Решение</th>
              <th className="px-4 py-2">Файлы</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr key="loading"><td colSpan={7}>Загрузка...</td></tr>
            ) : paginatedSolutions.length === 0 ? (
              <tr key="no-solutions">
                <td colSpan={7} className="text-center py-4">
                  Пока нет выполненных заданий
                </td>
              </tr>
            ) : (
              paginatedSolutions.map(sol => (
                <tr key={sol.id} className="border-b">
                  <td className="px-4 py-3">{sol.user?.name || "-"}</td>
                  <td className="px-4 py-3">{sol.user?.email || "-"}</td>
                  <td className="px-4 py-3">{sol.user?.phoneNumber || "-"}</td>
                  <td className="px-4 py-3">{sol.text}</td>
                  <td className="px-4 py-3">
                    {sol.files?.filter(Boolean).map(f => (
                      <a
                        key={f}
                        href={f}
                        target="_blank"
                        className="block text-blue-500 underline"
                      >
                        {f.split("/").pop()}
                      </a>
                    ))}
                  </td>
                  <td className="px-4 py-3">{sol.status}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(sol)}
                      className="text-blue-500"
                    >
                      Редактировать
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
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

      {/* EDIT MODAL */}
      {editingSolutionId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Изменить статус решения</h2>

            <select
              className="w-full border p-2 rounded-md"
              value={statusForm}
              onChange={e => setStatusForm(e.target.value as "PENDING" | "CHECKED" | "REJECTED")}
            >
              <option value="PENDING">PENDING</option>
              <option value="CHECKED">CHECKED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setEditingSolutionId(null)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Отмена
              </button>
              <button
                onClick={handlePatchSolution}
                className="px-4 py-2 bg-orange-500 text-white rounded-md"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

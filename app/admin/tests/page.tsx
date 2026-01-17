"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Cookies from "js-cookie";
import {
  getTests,
  createTest,
  patchTest,
  deleteTest,
  Test,
  TestPayload,
} from "@/services/tests/tests.api";
import { getCourses, Course } from "@/services/courses/courses.api";
import QuestionsModal from "./components/QuestionModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminTests() {
  const [role, setRole] = useState<string | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [questionsModalTestId, setQuestionsModalTestId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    courseId: string;
    duration: number;
    quantity: number;
    startDateLocal: string;
    status: TestPayload["status"];
  }>({
    name: "",
    courseId: "",
    duration: 60,
    quantity: 0,
    startDateLocal: "",
    status: "DRAFT",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ====== GET ROLE ======
  useEffect(() => {
    setRole(Cookies.get("role") || null);
  }, []);

  // ====== FETCH DATA ======
  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);

      const names: Record<string, string> = {};
      data.forEach(c => c.id && (names[c.id] = c.name));
      setCourseNames(names);
    } catch (e) {
      console.error("Ошибка загрузки курсов", e);
    }
  };

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const data = await getTests();
      setTests(data || []);
    } catch (e) {
      console.error("Ошибка загрузки тестов", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTests();
  }, []);

  // ====== MODAL HANDLERS ======
  const openCreateModal = () => {
    setEditingTest(null);
    setFormData({
      name: "",
      courseId: "",
      duration: 60,
      quantity: 0,
      startDateLocal: "",
      status: "DRAFT",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (test: Test) => {
    setEditingTest(test);
    setFormData({
      name: test.name,
      courseId: test.courseId,
      duration: test.duration,
      quantity: test.quantity ?? 0,
      startDateLocal: test.startDate ? test.startDate.slice(0, 16) : "",
      status: test.status,
    });
    setIsModalOpen(true);
  };

  // ====== SUBMIT ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: TestPayload = {
        name: formData.name,
        courseId: formData.courseId,
        duration: formData.duration,
        quantity: formData.quantity,
        status: formData.status,
        startDate: formData.startDateLocal
          ? new Date(formData.startDateLocal).toISOString()
          : new Date().toISOString(),
      };

      if (editingTest?.id) {
        await patchTest(editingTest.id, payload);
      } else {
        await createTest(payload);
      }

      await fetchTests();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Ошибка сохранения теста", e);
    }
  };

  // ====== DELETE ======
  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Удалить тест?")) return;
    try {
      await deleteTest(id);
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error("Ошибка удаления теста", e);
    }
  };

  // ====== FILTER + PAGINATION ======
  const filteredTests = tests.filter(
    t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (courseNames[t.courseId]?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const activeTests = tests.filter(t => t.status === "ACTIVE").length;

  // ====== RENDER ======
  return (
    <div className="space-y-8 p-4 bg-gray-50 w-full">
      {/* ===== STAT ===== */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Все тесты" value={tests.length.toString()} icon="📝" />
        <StatCard title="Активные" value={activeTests.toString()} icon="✅" />
      </div>

      {/* ===== FILTERS ===== */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Поиск по названию или курсу..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {role === "ADMIN" && (
          <button
            onClick={openCreateModal}
            className="bg-orange-500 text-white px-4 py-2 rounded-md"
          >
            Добавить тест
          </button>
        )}
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Название</th>
              <th className="p-2">Курс</th>
              <th className="p-2">Мин</th>
              <th className="p-2">Вопросов</th>
              <th className="p-2">Дата старта</th>
              <th className="p-2">Статус</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && paginatedTests.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Нет тестов
                </td>
              </tr>
            )}

            {!isLoading &&
              paginatedTests.map(test => (
                <tr key={test.id} className="border-b">
                  <td className="p-2">{test.name}</td>
                  <td className="p-2">{courseNames[test.courseId]}</td>
                  <td className="p-2">{test.duration}</td>
                  <td className="p-2">{test.quantity ?? 0}</td>
                  <td className="p-2">
                    {test.startDate
                      ? new Date(test.startDate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-2">{test.status}</td>
                  <td className="p-2 flex gap-2">
                    {role === "ADMIN" && (
                      <>
                        <button onClick={() => openEditModal(test)}>✏️</button>
                        <button onClick={() => handleDelete(test.id)}>🗑️</button>
                        <button onClick={() => setQuestionsModalTestId(test.id || null)}>
                          ❓ Вопросы
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-1 rounded-md ${
                  p === currentPage ? "bg-orange-500 text-white" : "bg-gray-200"
                }`}
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

      {/* ===== TEST MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg space-y-4 w-full max-w-md overflow-y-auto max-h-[90vh]"
          >
            {/* Название */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Название</label>
              <input
                className="w-full border p-2 rounded"
                placeholder="Название"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            {/* Курс */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Курс</label>
              <select
                className="w-full border p-2 rounded"
                value={formData.courseId}
                onChange={e => setFormData(p => ({ ...p, courseId: e.target.value }))}
                required
              >
                <option value="">Выберите курс</option>
                {courses.map(c => c.id && <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Длительность */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Длительность (мин)</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={formData.duration}
                onChange={e => setFormData(p => ({ ...p, duration: +e.target.value }))}
              />
            </div>

            {/* Количество вопросов */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Количество вопросов</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={formData.quantity}
                onChange={e => setFormData(p => ({ ...p, quantity: +e.target.value }))}
                min={0}
              />
            </div>

            {/* Дата начала */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Дата и время начала</label>
              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={formData.startDateLocal}
                onChange={e => setFormData(p => ({ ...p, startDateLocal: e.target.value }))}
                required
              />
            </div>

            {/* Статус */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Статус</label>
              <select
                className="w-full border p-2 rounded"
                value={formData.status}
                onChange={e => setFormData(p => ({ ...p, status: e.target.value as TestPayload["status"] }))}
              >
                <option value="DRAFT">Черновик</option>
                <option value="ACTIVE">Активен</option>
                <option value="INACTIVE">Неактивен</option>
              </select>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setIsModalOpen(false)}>Отмена</button>
              <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== QUESTIONS MODAL ===== */}
      {questionsModalTestId && (
        <QuestionsModal
          testId={questionsModalTestId}
          onClose={() => setQuestionsModalTestId(null)}
        />
      )}
    </div>
  );
}

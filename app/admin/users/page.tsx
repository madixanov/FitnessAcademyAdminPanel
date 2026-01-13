"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Cookies from "js-cookie";
import Skeleton from "./components/UserSkeleton";
import { getUsers, patchUser, User, UserPayload, getMyCourses } from "@/services/user/user.api";
import { getCourses, Course } from "@/services/courses/courses.api";
import { Edit, Eye, X } from "lucide-react";
import { getUserTestResults, UserTestResult } from "@/services/tests/test-submissions.api";

const role = Cookies.get("role");

interface UserWithCourse extends User {
  course?: {
    id: string;
    name: string;
  };
}

type FilterOption = "ALL" | "WITH_COURSE" | "WITHOUT_COURSE";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [courses, setCourses] = useState<Course[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<UserWithCourse | null>(null);
  const [viewingUser, setViewingUser] = useState<UserWithCourse | null>(null);

  const [formData, setFormData] = useState<UserPayload>({
    name: "",
    phoneNumber: "",
    img: ""
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ======================
  // FETCH USERS + COURSES + PARTICIPANTS
  // ======================
  const fetchUsersAndCourses = async () => {
    setIsLoading(true);
    try {
      const [allUsers, participants, allCourses] = await Promise.all([
        getUsers(),
        getMyCourses(),
        getCourses()
      ]);

      setCourses(allCourses);

      const courseMap = new Map<string, { id: string; name: string }>();
      participants.forEach(p => {
        courseMap.set(p.user.id, { id: p.course.id, name: p.course.name });
      });

      const merged: UserWithCourse[] = allUsers.map(u => ({
        ...u,
        course: courseMap.get(u.id)
      }));

      setUsers(merged);
    } catch (e) {
      console.error("Ошибка загрузки данных", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndCourses();
  }, []);

  // ======================
  // FILTER + SEARCH
  // ======================
  const filteredUsers = users
    .filter(u => {
      if (filter === "WITH_COURSE") return !!u.course;
      if (filter === "WITHOUT_COURSE") return !u.course;
      return true;
    })
    .filter(u => {
      if (selectedCourseId) return u.course?.id === selectedCourseId;
      return true;
    })
    .filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, selectedCourseId]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ======================
  // EDIT MODAL
  // ======================
  const openEditModal = (user: UserWithCourse) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phoneNumber: user.phoneNumber,
      img: user.img ?? ""
    });
    setImagePreview(user.img || null);
    setImageFile(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setImagePreview(null);
    setImageFile(null);
  };

  // ======================
  // INFO MODAL + ТЕСТЫ
  // ======================
  const [userTestResults, setUserTestResults] = useState<UserTestResult[]>([]);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const openInfoModal = async (user: UserWithCourse) => {
    setViewingUser(user);
    setIsInfoModalOpen(true);

    setIsTestLoading(true);
    try {
      const results = await getUserTestResults(user.id);
      setUserTestResults(results);
    } catch (e) {
      console.error("Ошибка загрузки результатов тестов", e);
      setUserTestResults([]);
    } finally {
      setIsTestLoading(false);
    }
  };

  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
    setViewingUser(null);
    setUserTestResults([]);
  };

  // ======================
  // IMAGE CHANGE
  // ======================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ======================
  // SUBMIT EDIT
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await patchUser(editingUser.id, formData);
      await fetchUsersAndCourses();
      closeEditModal();
    } catch (e) {
      console.error("Ошибка обновления пользователя", e);
    }
  };

  const activeUsers = users.filter(u => u.status === "ACTIVE").length;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const translateRole = (role: string) =>
    ({"USER": "Пользователь", "ADMIN": "Администратор", "TEACHER": "Преподаватель"} as Record<string, string>)[role] || role;

  const translateStatus = (status: string) =>
    ({"ACTIVE": "Активный", "INACTIVE": "Неактивный", "PENDING": "Ожидание"} as Record<string, string>)[status] || status;

  // ======================
  // RENDER
  // ======================
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Всего пользователей" value={users.length.toString()} icon="👥" />
        <StatCard title="Активные" value={activeUsers.toString()} icon="✅" />
      </div>

      {/* FILTER BUTTONS + COURSE SELECT */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button
          className={`px-4 py-2 rounded ${filter === "ALL" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("ALL")}
        >
          Все
        </button>
        <button
          className={`px-4 py-2 rounded ${filter === "WITH_COURSE" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("WITH_COURSE")}
        >
          С курсами
        </button>
        <button
          className={`px-4 py-2 rounded ${filter === "WITHOUT_COURSE" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("WITHOUT_COURSE")}
        >
          Без курсов
        </button>

        <select
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
          className="border rounded px-3 py-2 ml-2"
        >
          <option value="">Все курсы</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 border rounded px-3 py-2"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Пользователи</h3>

        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Имя</th>
              <th className="px-4 py-2 hidden sm:table-cell">Email</th>
              <th className="px-4 py-2 hidden md:table-cell">Курс</th>
              <th className="px-4 py-2 hidden md:table-cell">Роль</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2 hidden lg:table-cell">Дата</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>

          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.course ? (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{u.course.name}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{translateRole(u.role)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {translateStatus(u.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openInfoModal(u)}><Eye className="w-4 h-4" /></button>
                      {role === "ADMIN" && <button onClick={() => openEditModal(u)}><Edit className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-1 rounded ${p === currentPage ? "bg-orange-500 text-white" : "bg-gray-200"}`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* INFO MODAL */}
      {isInfoModalOpen && viewingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Информация</h3>
              <button onClick={closeInfoModal}><X className="w-5 h-5" /></button>
            </div>

            <p><b>Имя:</b> {viewingUser.name}</p>
            <p><b>Email:</b> {viewingUser.email}</p>
            <p><b>Курс:</b> {viewingUser.course?.name || "Не записан"}</p>
            <p><b>Роль:</b> {translateRole(viewingUser.role)}</p>
            <p><b>Статус:</b> {translateStatus(viewingUser.status)}</p>
            <p><b>Дата:</b> {formatDate(viewingUser.createdAt)}</p>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Результаты тестов:</h4>
              {isTestLoading ? (
                <p>Загрузка...</p>
              ) : userTestResults.length === 0 ? (
                <p>Пользователь ещё не сдавал тесты.</p>
              ) : (
                <ul className="space-y-2">
                  {userTestResults.map((res) => (
                    <li key={res.testId} className="p-2 border rounded">
                      <p><b>Тест:</b> {res.test.name}</p>
                      <p><b>Баллы:</b> {res.score} / {res.total}</p>
                      <p><b>Дата:</b> {formatDate(res.date)}</p>
                      <p><b>Статус:</b> {res.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full sm:max-w-lg">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Редактировать пользователя</h3>
              <button onClick={closeEditModal}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Фото</label>
                <input type="file" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} className="mt-2 w-24 h-24 object-cover rounded-full" />}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded bg-gray-200">Отмена</button>
                <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

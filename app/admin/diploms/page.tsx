"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Cookies from "js-cookie";
import {
  getDiplomas,
  uploadDiploma,
  deleteDiploma,
  Diploma,
} from "@/services/diploms/diploms.api";
import { getCourses, Course } from "@/services/courses/courses.api";
import { getUsers, User } from "@/services/user/user.api";
import { getTrainers, Trainer } from "@/services/coaches/coaches.api";
import { uploadFiles } from "@/services/upload/upload.api";
import Skeleton from "./components/DiplomasSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminDiplomas() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  const [codeDiplom, setCodeDiplom] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [role, setRole] = useState<string | null>(null);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(diplomas.length / itemsPerPage);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );


  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setRole(Cookies.get("role") || null);
  }, []);

  useEffect(() => {
    fetchDiplomas();
    fetchCourses();
    fetchUsers();
    fetchTrainers();
  }, []);

  const fetchDiplomas = async () => {
    setIsLoading(true);
    try {
      const data = await getDiplomas();
      setDiplomas(data);
    } catch (err) {
      console.error("Ошибка загрузки дипломов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
    }
  };

  const fetchTrainers = async () => {
    try {
      const data = await getTrainers();
      setTrainers(data);
    } catch (err) {
      console.error("Ошибка загрузки тренеров:", err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    try {
      const urls = await uploadFiles([selectedFile]);
      if (urls.length > 0) {
        setUploadedFileUrl(urls[0]);
      } else {
        throw new Error("Файл не был загружен");
      }
    } catch (err: any) {
      console.error("Ошибка загрузки файла:", err.message || err);
      alert("Не удалось загрузить файл. Возможно, слишком большой.");
      setFile(null);
      setUploadedFileUrl("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileUrl || !codeDiplom || !courseId || !teacherId || !userId)
      return;

    try {
      await uploadDiploma({
        codeDiplom,
        courseId,
        teacherId,
        userId,
        img: [uploadedFileUrl],
      });

      setIsModalOpen(false);
      setFile(null);
      setUploadedFileUrl("");
      setCodeDiplom("");
      setCourseId("");
      setTeacherId("");
      setUserId("");
      await fetchDiplomas();
    } catch (err) {
      console.error("Ошибка при загрузке диплома:", err);
      alert("Не удалось добавить диплом");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить диплом?")) return;
    try {
      await deleteDiploma(id);
      setDiplomas((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
      alert("Не удалось удалить диплом");
    }
  };

  // Поиск
  const filteredDiplomas = diplomas.filter((d) => {
    const courseName = d.course?.name || "";
    const userName = users.find((u) => u.id === d.userId)?.name || "";
    return (
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Пагинация
  const paginatedDiplomas = filteredDiplomas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-2 sm:p-6 bg-gray-50 w-full">
      {/* ===== STATISTICS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего дипломов"
          value={diplomas.length.toString()}
          icon="📄"
        />
      </div>

      {/* ===== SEARCH & ADD ===== */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Поиск по курсу или пользователю..."
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // сброс на первую страницу при поиске
          }}
        />
        {role === "ADMIN" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm"
          >
            Добавить диплом
          </button>
        )}
      </div>

      {/* ===== DIPLOMAS TABLE ===== */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto mt-2">
        <table className="w-full min-w-[500px] sm:min-w-full text-left table-auto text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 sm:px-4 sm:py-2">Код диплома</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2">Файл</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">
                Пользователь
              </th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                Дата загрузки
              </th>
              <th className="px-2 py-1 sm:px-4 sm:py-2">Действия</th>
            </tr>
          </thead>

          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {paginatedDiplomas.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1 sm:px-4 sm:py-2">{d.codeDiplom}</td>
                  <td className="px-2 py-1 sm:px-4 sm:py-2">
                    {d.img.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md">
                          {d.img[0].endsWith(".pdf") ? (
                            <span className="text-gray-700 font-bold text-xs">
                              PDF
                            </span>
                          ) : (
                            <img
                              src={d.img[0]}
                              alt={d.codeDiplom}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                        </div>
                        <a
                          href={d.img[0]}
                          target="_blank"
                          className="text-blue-500 underline text-sm"
                        >
                          Скачать
                        </a>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">
                    {users.find((u) => u.id === d.userId)?.name || d.userId}
                  </td>
                  <td className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                    {d.createdAt?.slice(0, 10) || "—"}
                  </td>
                  <td className="px-2 py-1 sm:px-4 sm:py-2 flex gap-1 sm:gap-2">
                    <button
                      className="text-red-500"
                      onClick={() => handleDelete(d.id!)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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

      {/* ===== UPLOAD MODAL ===== */}
      {isModalOpen && role === "ADMIN" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Загрузка диплома</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <input
                type="text"
                placeholder="Код диплома"
                className="w-full border px-3 py-2 rounded"
                value={codeDiplom}
                onChange={(e) => setCodeDiplom(e.target.value)}
                required
              />

              <select
                className="w-full border px-3 py-2 rounded"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">Выберите курс</option>
                {courses.map(
                  (c) =>
                    c.id && (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    )
                )}
              </select>

              <select
                className="w-full border px-3 py-2 rounded"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
              >
                <option value="">Выберите учителя</option>
                {trainers.map(
                  (t) =>
                    t.id && (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    )
                )}
              </select>

              {/* Пользователь с поиском */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Выберите пользователя..."
                  className="w-full border px-3 py-2 rounded"
                  value={
                    users.find(u => u.id === userId)?.name || userSearchTerm
                  }
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  onFocus={() => setUserDropdownOpen(true)}
                  autoComplete="off"
                  required
                />

                {userDropdownOpen && (
                  <ul className="absolute z-10 w-full max-h-48 overflow-y-auto bg-white border rounded mt-1 shadow-md">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <li
                          key={u.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setUserId(u.id);
                            setUserSearchTerm(u.name);
                            setUserDropdownOpen(false);
                          }}
                        >
                          {u.name}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-400">Ничего не найдено</li>
                    )}
                  </ul>
                )}
              </div>


              <input
                type="file"
                accept=".pdf,.jpg,.png"
                className="w-full"
                onChange={handleFileChange}
                required
              />

              {file && uploadedFileUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md">
                    {uploadedFileUrl.endsWith(".pdf") ? (
                      <span className="text-gray-700 font-bold text-xs">PDF</span>
                    ) : (
                      <img
                        src={uploadedFileUrl}
                        alt="preview"
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                  </div>
                  <span className="text-sm text-green-600">Файл загружен</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md"
                >
                  Загрузить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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

// Форматирование дат
const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU");
};

export default function AdminDiplomas() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");

  const [codeDiplom, setCodeDiplom] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [userId, setUserId] = useState("");

  const [issuedAt, setIssuedAt] = useState("");
  const [courseFinishedAt, setCourseFinishedAt] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(Cookies.get("role") || null);
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => setCourses(await getCourses());
  const fetchUsers = async () => setUsers(await getUsers());
  const fetchTrainers = async () => setTrainers(await getTrainers());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    try {
      const urls = await uploadFiles([selectedFile]);
      setUploadedFileUrl(urls[0]);
    } catch {
      alert("Ошибка загрузки файла");
      setFile(null);
      setUploadedFileUrl("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedFileUrl("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileUrl || !codeDiplom || !courseId || !teacherId || !userId || !issuedAt || !courseFinishedAt) {
      alert("Заполните все поля");
      return;
    }

    try {
      await uploadDiploma({
        codeDiplom,
        courseId,
        teacherId,
        userId,
        img: [uploadedFileUrl],
        issuedAt: new Date(issuedAt).toISOString(),
        courseFinishedAt: new Date(courseFinishedAt).toISOString(),
      });

      // Сброс формы
      setIsModalOpen(false);
      setFile(null);
      setUploadedFileUrl("");
      setCodeDiplom("");
      setCourseId("");
      setTeacherId("");
      setUserId("");
      setIssuedAt("");
      setCourseFinishedAt("");
      fetchDiplomas();
    } catch {
      alert("Не удалось добавить диплом");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить диплом?")) return;
    await deleteDiploma(id);
    setDiplomas(prev => prev.filter(d => d.id !== id));
  };

  // Фильтрация дипломов
  const filteredDiplomas = diplomas.filter((d) => {
    const courseName = d.course?.name || "";
    const userName = users.find(u => u.id === d.userId)?.name || "";
    const matchesSearch =
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourseId || d.courseId === selectedCourseId;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 p-6 bg-gray-50 w-full">
      <StatCard title="Всего дипломов" value={diplomas.length.toString()} icon="📄" />

      <div className="flex gap-4 w-full">
        <input
          className="border p-2 rounded w-full"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-2 rounded w-[220px]"
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
        >
          <option value="">Все курсы</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {role === "ADMIN" && (
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-4 rounded">
            Добавить
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Код</th>
              <th className="p-3 text-left">Файл</th>
              <th className="p-3 text-left">Пользователь</th>
              <th className="p-3 text-left">Окончание курса</th>
              <th className="p-3 text-left">Дата выдачи</th>
              <th className="p-3 text-center">Действия</th>
            </tr>
          </thead>
          {isLoading ? <Skeleton /> : (
            <tbody>
              {filteredDiplomas.map(d => (
                <tr key={d.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{d.codeDiplom}</td>
                  <td className="p-3">
                    {d.img?.length ? (
                      <a href={d.img[0]} target="_blank" className="text-orange-600 underline">Скачать</a>
                    ) : "—"}
                  </td>
                  <td className="p-3">{users.find(u => u.id === d.userId)?.name || "—"}</td>
                  <td className="p-3 text-gray-600">{formatDate(d.courseFinishedAt)}</td>
                  <td className="p-3 text-gray-600">{formatDate(d.issuedAt)}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(d.id!)} className="text-red-500 hover:text-red-700 transition">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl w-full max-w-md space-y-3">
            <input
              className="border p-2 w-full"
              placeholder="Код диплома"
              value={codeDiplom}
              onChange={e => setCodeDiplom(e.target.value)}
              required
            />
            <select className="border p-2 w-full" value={courseId} onChange={e => setCourseId(e.target.value)} required>
              <option value="">Курс</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="border p-2 w-full" value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
              <option value="">Учитель</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="border p-2 w-full" value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">Пользователь</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="date" className="border p-2 w-full" value={courseFinishedAt} onChange={e => setCourseFinishedAt(e.target.value)} required />
            <input type="date" className="border p-2 w-full" value={issuedAt} onChange={e => setIssuedAt(e.target.value)} required />
            {!uploadedFileUrl ? (
              <input type="file" onChange={handleFileChange} required />
            ) : (
              <div className="flex justify-between items-center border p-2 rounded">
                <span className="text-green-600">Файл загружен</span>
                <button type="button" onClick={handleRemoveFile} className="text-red-500">Удалить</button>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1 border rounded">Отмена</button>
              <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">Загрузить</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

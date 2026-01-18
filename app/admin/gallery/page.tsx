"use client";

import { useEffect, useRef, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Cookies from "js-cookie";

import { uploadFiles } from "@/services/upload/upload.api";
import { createPhoto, getPhotos, deletePhoto } from "@/services/photos/photos.api";

/* ===== TYPES ===== */
interface Photo {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export default function AdminPhotos() {
  const [role, setRole] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ===== ROLE ===== */
  useEffect(() => {
    setRole(Cookies.get("role") || null);
  }, []);

  /* ===== FETCH PHOTOS ===== */
  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const data = await getPhotos();
      setPhotos(data);
    } catch (e) {
      console.error("Ошибка загрузки фото", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  /* ===== SELECT FILES ===== */
  const handleSelectFiles = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    try {
      const urls = await uploadFiles(Array.from(files));
      setPreviewUrls(urls);
      setUploadedUrls(urls);
    } catch (e) {
      console.error("Ошибка загрузки изображений", e);
    } finally {
      setIsUploading(false);
    }
  };

  /* ===== CONFIRM SAVE ===== */
  const handleConfirm = async () => {
    if (!uploadedUrls.length) return;

    setIsLoading(true);
    try {
      const createdPhotos = await Promise.all(
        uploadedUrls.map(imageUrl => createPhoto({ imageUrl }))
      );

      setPhotos(prev => [...createdPhotos, ...prev]);

      // очистка
      setPreviewUrls([]);
      setUploadedUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      console.error("Ошибка сохранения фото", e);
      alert("Не удалось сохранить фотографии");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===== DELETE PHOTO ===== */
  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это фото?")) return;

    try {
      await deletePhoto(id);
      // Обновляем список локально
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Ошибка при удалении фото", e);
      alert("Ошибка при удалении фото");
    }
  };

  /* ===== CANCEL ===== */
  const handleCancel = () => {
    setPreviewUrls([]);
    setUploadedUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ===== FILTERED + PAGINATED DATA ===== */
  const filteredPhotos = photos.filter(photo =>
    photo.imageUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
  const paginatedPhotos = filteredPhotos.slice(
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

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-gray-50 w-full">
      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Всего фото" value={photos.length.toString()} icon="🖼️" />
        <StatCard title="В ожидании" value={previewUrls.length.toString()} icon="⏳" />
        <StatCard title="Роль" value={role || "—"} icon="👤" />
      </div>

      {/* ===== UPLOAD ===== */}
      {role === "ADMIN" && (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Загрузка фотографий</h3>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={e => handleSelectFiles(e.target.files)}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm"
          >
            📸 Выбрать фотографии
          </button>

          {isUploading && <p className="text-sm text-gray-500">Загрузка...</p>}

          {previewUrls.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 pt-2">
                {previewUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                >
                  ✅ Подтвердить
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                >
                  ❌ Отмена
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== SEARCH ===== */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Поиск по URL..."
          className="border p-2 rounded-md w-full sm:w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white p-2 sm:p-4 rounded-xl shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Загруженные фото</h3>

        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Фото</th>
              <th className="px-3 py-2 hidden sm:table-cell">URL</th>
              <th className="px-3 py-2 hidden md:table-cell">Дата</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>

          <tbody>
            {!isLoading &&
              paginatedPhotos.map(photo => (
                <tr key={photo.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <img
                      src={photo.imageUrl}
                      alt="photo"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell truncate max-w-[200px]">
                    {photo.imageUrl}
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {photo.createdAt.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {role === "ADMIN" && (
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            {paginatedPhotos.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Фото не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Назад
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

import StatCard from "@/components/ui/StatCard";
import Skeleton from "./components/QrSkeleton";

import {
  getQrCodes,
  createQrCode,
  deleteQrCode,
  QrCode,
} from "@/services/qr/qr.api";

import { uploadFiles } from "@/services/upload/upload.api";

export default function AdminQrCodes() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [photoUrl, setPhotoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(Cookies.get("role") || null);
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    setIsLoading(true);

    try {
      const data = await getQrCodes();
      setQrCodes(data);
    } catch (error) {
      console.error("Ошибка загрузки QR-кодов:", error);
      alert("Не удалось загрузить QR-коды");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const selectedFile = e.target.files[0];

    setFile(selectedFile);

    try {
      const urls = await uploadFiles([selectedFile]);
      const uploadedUrl = urls[0];

      if (!uploadedUrl) {
        throw new Error("URL загруженного файла отсутствует");
      }

      setPhotoUrl(uploadedUrl);
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
      alert("Ошибка загрузки файла");

      setFile(null);
      setPhotoUrl("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPhotoUrl("");
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!photoUrl) {
      alert("Загрузите изображение QR-кода");
      return;
    }

    try {
      await createQrCode({
        photo_url: photoUrl,
      });

      setPhotoUrl("");
      setFile(null);
      setIsModalOpen(false);

      await fetchQrCodes();
    } catch (error) {
      console.error("Ошибка создания QR-кода:", error);
      alert("Не удалось создать QR-код");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить QR-код?")) return;

    try {
      await deleteQrCode(id);

      setQrCodes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Ошибка удаления QR-кода:", error);
      alert("Не удалось удалить QR-код");
    }
  };

  // Безопасная фильтрация: photo_url может отсутствовать в ответе API.
  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredQrCodes = qrCodes.filter((item) =>
    (item.photo_url ?? "").toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 w-full">
      <StatCard
        title="Всего QR-кодов"
        value={qrCodes.length.toString()}
        icon="📱"
      />

      <div className="flex gap-4 w-full">
        <input
          className="border p-2 rounded w-full"
          placeholder="Поиск QR-кода..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {role === "ADMIN" && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 text-white px-4 rounded"
          >
            Добавить
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Название</th>
              <th className="p-3 text-left">QR</th>
              <th className="p-3 text-left">URL</th>
              <th className="p-3 text-center">Действия</th>
            </tr>
          </thead>

          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {filteredQrCodes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "QR-коды не найдены"
                      : "QR-кодов пока нет"}
                  </td>
                </tr>
              ) : (
                filteredQrCodes.map((item) => (
                  <tr
                    key={item.id ?? item.photo_url}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">QR-код</td>

                    <td className="p-3">
                      {item.photo_url ? (
                        <div className="relative w-16 h-16 rounded overflow-hidden border">
                          <Image
                            src={item.photo_url}
                            alt="QR-код"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          Нет изображения
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-gray-600 max-w-[250px] truncate">
                      {item.photo_url || "URL отсутствует"}
                    </td>

                    <td className="p-3 text-center">
                      {item.id != null && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id!)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          🗑
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="text-xl font-semibold">
              Добавить QR-код
            </h2>

            {!photoUrl ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            ) : (
              <div className="border rounded p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded overflow-hidden border">
                    <Image
                      src={photoUrl}
                      alt="Предпросмотр QR-кода"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <span className="text-green-600 text-sm">
                    QR-код загружен
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500"
                >
                  Удалить
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 border rounded"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={!photoUrl}
                className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
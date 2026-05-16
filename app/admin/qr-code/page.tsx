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

  const [title, setTitle] = useState("");
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

      setPhotoUrl(urls[0]);
    } catch {
      alert("Ошибка загрузки файла");

      setFile(null);
      setPhotoUrl("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPhotoUrl("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !photoUrl) {
      alert("Заполните все поля");
      return;
    }

    try {
      await createQrCode({
        title,
        photo_url: photoUrl,
      });

      setTitle("");
      setPhotoUrl("");
      setFile(null);

      setIsModalOpen(false);

      fetchQrCodes();
    } catch {
      alert("Не удалось создать QR-код");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить QR-код?")) return;

    await deleteQrCode(id);

    setQrCodes((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredQrCodes = qrCodes.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
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
              {filteredQrCodes.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">
                    {item.title}
                  </td>

                  <td className="p-3">
                    <div className="relative w-16 h-16 rounded overflow-hidden border">
                      <Image
                        src={item.photo_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="p-3 text-gray-600 max-w-[250px] truncate">
                    {item.photo_url}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
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

            <input
              className="border p-2 w-full rounded"
              placeholder="Название QR-кода"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

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
                      alt="QR Preview"
                      fill
                      className="object-cover"
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
                className="bg-orange-500 text-white px-4 py-2 rounded"
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
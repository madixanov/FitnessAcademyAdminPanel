"use client";

import Image from "next/image";
import { Pen, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getProfile, uploadProfilePhoto, patchUser, User, UserPayload } from "@/services/user/user.api";
import ProfileSkeleton from "./ProfileSkeleton";

export default function ProfileInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Состояния для редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserPayload>({
    name: "",
    phoneNumber: "",
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("accessToken");
        if (!token) throw new Error("Нет токена");

        const data = await getProfile(token);
        setUser(data);
        // Инициализируем данные для редактирования
        setEditData({
          name: data.name || "",
          phoneNumber: data.phoneNumber || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    // Проверка размера файла
    if (file.size > 5 * 1024 * 1024) {
      setMessage({text: "Файл слишком большой. Максимальный размер: 5MB", type: 'error'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      await uploadProfilePhoto(selectedFile);

      const token = Cookies.get("accessToken");
      const data = await getProfile(token!);
      setUser(data);
      setSelectedFile(null);
      setPreview(null);
      setMessage({text: "Фото успешно загружено!", type: 'success'});
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({text: "Не удалось загрузить фото", type: 'error'});
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Заполняем форму текущими данными
    setEditData({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Возвращаем исходные данные
    setEditData({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!user?.id) {
      setMessage({text: "Ошибка: ID пользователя не найден", type: 'error'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Валидация данных
    if (editData.name && editData.name.trim().length < 2) {
      setMessage({text: "Имя должно содержать минимум 2 символа", type: 'error'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (editData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(editData.phoneNumber)) {
      setMessage({text: "Введите корректный номер телефона", type: 'error'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setUpdating(true);
      
      // Фильтруем пустые значения
      const payload: UserPayload = {};
      if (editData.name && editData.name !== user.name) {
        payload.name = editData.name.trim();
      }
      if (editData.phoneNumber && editData.phoneNumber !== user.phoneNumber) {
        payload.phoneNumber = editData.phoneNumber.trim();
      }
      
      // Если нет изменений, выходим
      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        setMessage({text: "Нет изменений для сохранения", type: 'success'});
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      
      const updatedUser = await patchUser(user.id, payload);
      
      // Обновляем состояние пользователя
      setUser(updatedUser);
      setIsEditing(false);
      
      setMessage({text: "Данные успешно обновлены!", type: 'success'});
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при обновлении данных", err);
      setMessage({text: err.message || "Не удалось обновить данные", type: 'error'});
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (!user) return <p className="text-center text-gray-500 mt-10">Не авторизован</p>;

  const initials = user
    ? `${user.name?.[0] ?? ""}`.toUpperCase()
    : "";
  const createdAt = new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      {/* Сообщения */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Информация о профиле</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          {/* Фото */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-orange-500 relative flex items-center justify-center mb-4 text-white text-3xl font-bold overflow-hidden">
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-cover rounded-full" />
              ) : user.img ? (
                <Image src={user.img} alt={user.name} fill className="object-cover rounded-full" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Pen className="w-4 h-4" /> 
                {uploading ? "Загрузка..." : "Изменить фото"}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  disabled={uploading}
                />
              </label>
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Загрузка..." : "Сохранить"}
                </button>
              )}
            </div>
          </div>

          {/* Основная информация */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Имя</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Введите имя"
                    disabled={updating}
                  />
                ) : (
                  <span className="text-gray-900 font-medium">{user.name}</span>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm">Почта</p>
                <span className="text-gray-900 font-medium">{user.email}</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Телефон</p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    placeholder="+998901234567"
                    disabled={updating}
                  />
                ) : (
                  <span className="text-gray-900 font-medium">{user.phoneNumber}</span>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Дата регистрации</p>
                <span className="text-gray-900 font-medium">{createdAt}</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Роль</p>
                <span className="text-gray-900 font-medium">{user.role}</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Статус</p>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  user.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.status === 'ACTIVE' ? 'Активный' : 'Ожидание'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Редактирование */}
        <div className="mt-6 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveChanges}
                disabled={updating}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> 
                {updating ? "Сохранение..." : "Сохранить изменения"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={updating}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" /> Отмена
              </button>
            </>
          ) : (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm"
            >
              <Pen className="w-4 h-4" /> Редактировать данные
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
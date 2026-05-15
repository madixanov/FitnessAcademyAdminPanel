"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Skeleton from "./components/ocialsSkeleton";
import Cookies from "js-cookie";

import {
  getSocialNetworks,
  patchSocialNetwork,
  createSocialNetwork,
  deleteSocialNetwork,
  SocialNetwork,
  CreateSocialNetworkPayload,
  UpdateSocialNetworkPayload
} from "@/services/socials/socials.api";

const SOCIAL_ICONS: Record<string, string> = {
  telegram: "/tg.svg",
  consulting: "/tg.svg",
  instagram: "/ig.svg",
  facebook: "/fb.svg",
  whatsapp: "/wp.svg",
  number: "/phone.svg",
};

const SOCIAL_LABELS: Record<string, string> = {
  telegram: "Telegram группа",
  consulting: "Telegram ЛС",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  number: "Номер телефона",
};

export default function AdminSocials() {
  const [socials, setSocials] = useState<SocialNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] =
    useState<SocialNetwork | null>(null);

  const [formData, setFormData] =
    useState<CreateSocialNetworkPayload>({
      name: "",
      url: ""
    });

  const [role, setRole] = useState<string | null>(null);

  // ===== SEARCH & PAGINATION =====
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const r = Cookies.get("role") || null;
    setRole(r);
  }, []);

  // ===== FETCH SOCIALS =====
  const fetchSocials = async () => {
    setIsLoading(true);

    try {
      const data = await getSocialNetworks();
      setSocials(data);
    } catch (e) {
      console.error("Ошибка загрузки соцсетей", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  // ===== OPEN MODAL =====
  const openAddModal = () => {
    setEditingSocial(null);

    setFormData({
      name: "",
      url: ""
    });

    setIsModalOpen(true);
  };

  const openEditModal = (social: SocialNetwork) => {
    setEditingSocial(social);

    setFormData({
      name: social.name,
      url: social.url
    });

    setIsModalOpen(true);
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSocial) {
        const payload: UpdateSocialNetworkPayload = {
          name: formData.name,
          url: formData.url
        };

        await patchSocialNetwork(editingSocial.id, payload);
      } else {
        await createSocialNetwork(formData);
      }

      await fetchSocials();

      setIsModalOpen(false);
    } catch (e) {
      console.error("Ошибка сохранения соцсети", e);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить соцсеть?")) return;

    try {
      await deleteSocialNetwork(id);

      await fetchSocials();
    } catch (e) {
      console.error("Ошибка удаления соцсети", e);
    }
  };

  // ===== FILTERED + PAGINATED DATA =====
  const filteredSocials = socials.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredSocials.length / itemsPerPage
  );

  const paginatedSocials = filteredSocials.slice(
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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 flex-1">
          <StatCard
            title="Всего соцсетей"
            value={socials.length.toString()}
            icon="🌐"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Поиск по названию..."
            className="border p-2 rounded-md flex-1 min-w-[200px]"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {role === "ADMIN" && (
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm"
              onClick={openAddModal}
            >
              Добавить
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Название
              </th>

              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Ссылка
              </th>

              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Дата создания
              </th>

              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Действия
              </th>
            </tr>
          </thead>

          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {paginatedSocials.map((s) => (
                <tr
                  key={s.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {SOCIAL_ICONS[s.name] && (
                        <img
                          src={SOCIAL_ICONS[s.name]}
                          alt={s.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}

                      <span>{s.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 break-all">
                    <a
                      href={s.url}
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      {s.url}
                    </a>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(
                      s.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 flex gap-2">
                    {role === "ADMIN" ? (
                      <>
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm"
                          onClick={() =>
                            openEditModal(s)
                          }
                        >
                          Редактировать
                        </button>

                        <button
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() =>
                            handleDelete(s.id)
                          }
                        >
                          Удалить
                        </button>
                      </>
                    ) : (
                      <p>Недостаточно прав</p>
                    )}
                  </td>
                </tr>
              ))}

              {paginatedSocials.length === 0 &&
                !isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-4"
                    >
                      Соцсети не найдены
                    </td>
                  </tr>
                )}
            </tbody>
          )}
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() =>
                handlePageChange(currentPage - 1)
              }
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Назад
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() =>
                  handlePageChange(p)
                }
                className={`px-3 py-1 rounded-md ${
                  p === currentPage
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                handlePageChange(currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingSocial
                ? "Редактировать соцсеть"
                : "Добавить соцсеть"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* NAME INPUT */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Название"
                  className="w-full border p-2 rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                  required
                />

                {/* QUICK SELECT */}
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SOCIAL_ICONS).map(
                    (name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            name
                          }))
                        }
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition ${
                          formData.name === name
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-gray-100 hover:bg-orange-100"
                        }`}
                      >
                        <img
                          src={SOCIAL_ICONS[name]}
                          alt={name}
                          className="w-4 h-4"
                        />

                        <span>{name}</span>
                      </button>
                    )
                  )}
                </div>

                {/* HELPER */}
                <div className="bg-gray-50 border rounded-md p-3 text-sm">
                  <p className="font-medium mb-2">
                    Доступные названия:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                    {Object.entries(
                      SOCIAL_LABELS
                    ).map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2"
                      >
                        <img
                          src={SOCIAL_ICONS[key]}
                          alt={key}
                          className="w-4 h-4"
                        />

                        <span>
                          <b>{key}</b> — {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* URL INPUT */}
              <input
                type="url"
                placeholder="Ссылка"
                className="w-full border p-2 rounded-md"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    url: e.target.value
                  }))
                }
                required
              />

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md"
                >
                  {editingSocial
                    ? "Сохранить"
                    : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import Skeleton from "./components/BranchSkeleton";
import Cookies from "js-cookie";

import {
  getBranches,
  patchBranch,
  createBranch,
  deleteBranch,
  Branch,
  BranchPayload
} from "@/services/branches/branches.api";

const role = Cookies.get("role");

export default function AdminBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchPayload>({
    city: "",
    phone: "",
    email: "",
    address: "",
    mapLink: ""
  });

  // ===== SEARCH & PAGINATION =====
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== FETCH BRANCHES =====
  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (e) {
      console.error("Ошибка загрузки филиалов", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ===== OPEN MODAL =====
  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({ city: "", phone: "", email: "", address: "", mapLink: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      city: branch.city,
      phone: branch.phone,
      email: branch.email,
      address: branch.address,
      mapLink: branch.mapLink
    });
    setIsModalOpen(true);
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await patchBranch(editingBranch.id!, formData);
      } else {
        await createBranch(formData);
      }
      await fetchBranches();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Ошибка сохранения филиала", e);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить филиал?")) return;
    try {
      await deleteBranch(id);
      await fetchBranches();
    } catch (e) {
      console.error("Ошибка удаления филиала", e);
    }
  };

  // ===== FILTERED + PAGINATED DATA =====
  const filteredBranches = branches.filter(b =>
    b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Сброс страницы на 1 при изменении поиска
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">

      {/* Статистика и поиск */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 flex-1">
          <StatCard title="Всего филиалов" value={branches.length.toString()} icon="🏢" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Поиск по городу или адресу..."
            className="border p-2 rounded-md flex-1 min-w-[200px]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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

      {/* Таблица */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-sm font-medium text-gray-600">Город</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden sm:table-cell">Телефон</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden sm:table-cell">Email</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden md:table-cell">Адрес</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 hidden lg:table-cell">Карта</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">Действия</th>
            </tr>
          </thead>

          {isLoading ? <Skeleton /> : (
            <tbody>
              {paginatedBranches.map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{b.city}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{b.phone}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{b.email}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{b.address}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {b.mapLink ? (
                      <a href={b.mapLink} target="_blank" className="text-blue-500 underline">Карта</a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {role === "ADMIN" ? (
                      <>
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm"
                          onClick={() => openEditModal(b)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => handleDelete(b.id!)}
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
              {paginatedBranches.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-4">Филиалы не найдены</td>
                </tr>
              )}
            </tbody>
          )}
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

      {/* Модалка */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingBranch ? "Редактировать филиал" : "Добавить филиал"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Город"
                className="w-full border p-2 rounded-md"
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Телефон"
                className="w-full border p-2 rounded-md"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded-md"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Адрес"
                className="w-full border p-2 rounded-md"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Ссылка на карту"
                className="w-full border p-2 rounded-md"
                value={formData.mapLink}
                onChange={e => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded-md" onClick={() => setIsModalOpen(false)}>Отмена</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md">{editingBranch ? "Сохранить" : "Добавить"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

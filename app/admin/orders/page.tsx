"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import StatCard from "@/components/ui/StatCard";

import {
  patchOrder,
  getOrders,
  deleteOrder,
  Order,
} from "@/services/orders/orders.api";

import { getCourses, Course } from "@/services/courses/courses.api";
import { getUsers, User } from "@/services/user/user.api";

import Skeleton from "./components/OrderSkeleton";

const role = Cookies.get("role");

export interface OrderWithDetails extends Order {
  user?: User;
  course?: Course;
}

export default function AdminOrders() {
  // -------------------------
  // DATA
  // -------------------------
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // -------------------------
  // UI STATE
  // -------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithDetails | null>(null);
  const [formStatus, setFormStatus] = useState<Order["status"]>("PENDING");

  // -------------------------
  // PAGINATION
  // -------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // -------------------------
  // LOAD COURSES AND USERS
  // -------------------------
  useEffect(() => {
    const loadData = async () => {
      const [coursesData, usersData] = await Promise.all([getCourses(), getUsers()]);
      setCourses(coursesData);
      setUsers(usersData);
    };
    loadData();
  }, []);

  // -------------------------
  // LOAD ORDERS AND MERGE DETAILS
  // -------------------------
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const ordersData = await getOrders();

      const merged: OrderWithDetails[] = ordersData.map(o => ({
        ...o,
        user: users.find(u => u.id === o.userId),
        course: courses.find(c => c.id === o.courseId),
      }));

      setOrders(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (users.length && courses.length) {
      fetchOrders();
    }
  }, [users, courses]);

  // -------------------------
  // MODAL
  // -------------------------
  const openEditModal = (order: OrderWithDetails) => {
    setEditingOrder(order);
    setFormStatus(order.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await patchOrder(editingOrder.id, { status: formStatus });
      await fetchOrders();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------
  const deleteOrderFunc = async (id: string) => {
    const ok = await deleteOrder(id);
    if (!ok) return;
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // -------------------------
  // FILTERED ORDERS
  // -------------------------
  const filteredOrders = orders
    .filter(o => (!selectedCourse || o.courseId === selectedCourse))
    .filter(o => (!selectedStatus || o.status === selectedStatus))
    .filter(o => {
      const courseName = o.course?.name || "";
      const userName = o.user?.name || "";
      const userEmail = o.user?.email || "";
      return (
        courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Пагинация
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Сброс страницы при фильтре или поиске
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, selectedStatus, searchTerm]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 w-full">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Всего заказов" value={orders.length.toString()} icon="🛒" />
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex gap-4 flex-wrap mb-4">
        <select
          className="border p-2 rounded-md"
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
        >
          <option value="">Все курсы</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded-md"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="PENDING">PENDING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <input
          type="text"
          placeholder="Поиск по курсу или пользователю..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border p-2 rounded-md flex-1 min-w-[200px]"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Курс</th>
              <th className="px-4 py-2 text-left">Пользователь</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Дата</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>

          {isLoading ? <Skeleton /> : (
            <tbody>
              {paginatedOrders.map(o => (
                <tr key={o.id} className="border-b">
                  <td className="px-4 py-3">{o.course?.name || o.courseId}</td>
                  <td className="px-4 py-3">{o.user?.name || o.userId}</td>
                  <td className="px-4 py-3 text-center">{o.status}</td>
                  <td className="px-4 py-3 text-center">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-3 justify-center">
                    {role === "ADMIN" && (
                      <>
                        <button onClick={() => openEditModal(o)} className="text-blue-500">Редактировать</button>
                        <button onClick={() => deleteOrderFunc(o.id)} className="text-red-500">Удалить</button>
                      </>
                    )}
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

      {/* MODAL */}
      {isModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Редактировать заказ</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select className="w-full border p-2 rounded-md"
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as Order["status"])}
              >
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md">
                  Отмена
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
import { getMyCoursesByUser, patchMyCourseById } from "@/services/courses/myCourse.api";

import Skeleton from "./components/OrderSkeleton";

const role = Cookies.get("role");

export interface OrderWithDetails extends Order {
  user?: User;
  course?: Course;
}

export default function AdminOrders() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithDetails | null>(null);
  const [formStatus, setFormStatus] = useState<Order["status"]>("PENDING");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ------------------ Load courses & users ------------------
  useEffect(() => {
    const loadData = async () => {
      const [coursesData, usersData] = await Promise.all([getCourses(), getUsers()]);
      setCourses(coursesData);
      setUsers(usersData);
    };
    loadData();
  }, []);

  // ------------------ Fetch orders ------------------
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const ordersData = await getOrders();
      const merged = ordersData.map(o => ({
        ...o,
        user: users.find(u => u.id === o.userId),
        course: courses.find(c => c.id === o.courseId),
      }));
      setOrders(merged);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (users.length && courses.length) fetchOrders();
  }, [users, courses]);

  // ------------------ Modal ------------------
  const openEditModal = (order: OrderWithDetails) => {
    setEditingOrder(order);
    setFormStatus(order.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      // 1️⃣ Обновляем заказ
      await patchOrder(editingOrder.id, { status: formStatus });

      // 2️⃣ Получаем курсы пользователя
      const myCourses = await getMyCoursesByUser();

      // 3️⃣ Ищем нужный курс
      const target = myCourses.find(mc => mc.courseId === editingOrder.courseId);

      // 4️⃣ Маппинг статусов Order → MyCourse
      const mapStatus = (status: Order["status"]) => {
        if (status === "PENDING" || status === "INACTIVE") return "DROPPED";
        return status as "ACTIVE" | "COMPLETED";
      };

      if (target) {
        await patchMyCourseById(target.id, mapStatus(formStatus));
      }

      // 5️⃣ Обновляем таблицу
      await fetchOrders();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Ошибка при обновлении заказа:", err);
    }
  };

  // ------------------ Delete ------------------
  const deleteOrderFunc = async (id: string) => {
    const ok = await deleteOrder(id);
    if (!ok) return;
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // ------------------ Pagination ------------------
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ------------------ Status styles ------------------
  const statusStyles: Record<Order["status"], string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-200 text-gray-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  };

  // ------------------ Render ------------------
  return (
    <div className="space-y-6 p-6 bg-gray-50 w-full">
      <StatCard title="Всего заказов" value={orders.length.toString()} icon="🛒" />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Курс</th>
              <th className="px-4 py-3 text-left">Пользователь</th>
              <th className="px-4 py-3 text-center">Статус</th>
              <th className="px-4 py-3 text-center">Дата</th>
              <th className="px-4 py-3 text-center">Действия</th>
            </tr>
          </thead>

          {isLoading ? (
            <Skeleton />
          ) : (
            <tbody>
              {paginatedOrders.map(o => (
                <tr key={o.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{o.course?.name}</td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{o.user?.name}</span>
                      <span className="text-xs text-gray-400">{o.user?.email}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[o.status]}`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {role === "ADMIN" && (
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEditModal(o)} className="text-blue-600 hover:underline">Изменить</button>
                        <button onClick={() => deleteOrderFunc(o.id)} className="text-red-600 hover:underline">Удалить</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Изменить статус заказа</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as Order["status"])}
                className="w-full border p-2 rounded-md"
              >
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Отмена</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

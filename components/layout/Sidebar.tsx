"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const menu = [
  { name: "Панель управления", href: "/admin" },
  { name: "Пользователи", href: "/admin/users" },
  { name: "Запросы на курс", href: "/admin/orders" },
  { name: "Дипломы", href: "/admin/diploms" },
  { name: "Учителя", href: "/admin/coaches"},
  { name: "Курсы", href: "/admin/courses" },
  { name: "Уроки", href: "/admin/lessons" },
  { name: "Домашнии задании", href: "/admin/homeworks" },
  { name: "Выполненные дом. задания", href: "/admin/homework-submissions" },
  { name: "Тесты", href: "/admin/tests" },
  { name: "Филиалы", href: "/admin/branches"},
  { name: "Галлерея", href: "/admin/gallery"},
  { name: "Соц. сети", href: "/admin/socials"},
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Кнопка меню (только на мобильных) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md p-2 rounded-md border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Фон-затемнение при открытом меню */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Сайдбар */}
      <aside
        className={cn(
          // 🧱 Фиксированная позиция на всех экранах
          "fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-gray-200 p-4 flex flex-col transition-transform duration-300 overflow-y-auto",
          // ширина и адаптация
          "w-64 lg:w-60",
          // поведение при открытии на мобильных
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin" className="text-lg font-semibold text-gray-800 text-center w-full">
            <h2 className="text-lg font-semibold text-gray-800 text-center w-full">
              <span className="text-orange-500 text-center">Master Fitness</span><br />Admin Panel
            </h2>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md transition text-sm font-medium",
                pathname === item.href
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
          © 2025 Master Fitness Admin Panel
        </div>
      </aside>
    </>
  );
}

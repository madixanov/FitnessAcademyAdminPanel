"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/ui/StatCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getUsers, User } from "@/services/user/user.api";
import { getCourses, Course } from "@/services/courses/courses.api";
import { getTests, Test } from "@/services/tests/tests.api";
import { getTrainers, Trainer } from "@/services/coaches/coaches.api"; // Добавляем импорт тренеров

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    tests: 0,
    trainers: 0
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentTests, setRecentTests] = useState<Test[]>([]);
  const [recentTrainers, setRecentTrainers] = useState<Trainer[]>([]); // Добавляем состояние для тренеров

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Параллельные запросы данных (добавляем getTrainers)
        const [usersData, coursesData, testsData, trainersData] = await Promise.all([
          getUsers(),
          getCourses(),
          getTests(),
          getTrainers() // Добавляем запрос тренеров
        ]);

        // Обновляем статистику
        setStats({
          users: usersData.length,
          courses: coursesData.length,
          tests: testsData.length,
          trainers: trainersData.length // Теперь реальные данные
        });

        // Подготавливаем данные для графика (регистрации по дням)
        prepareWeeklyData(usersData);

        // Последние 4 пользователя
        const sortedUsers = [...usersData]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setRecentUsers(sortedUsers);

        // Последние 4 курса
        const sortedCourses = [...coursesData]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setRecentCourses(sortedCourses);

        // Последние 4 теста
        const sortedTests = [...testsData]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 4);
        setRecentTests(sortedTests);

        // Последние 4 тренера
        const sortedTrainers = [...trainersData]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setRecentTrainers(sortedTrainers);

      } catch (error) {
        console.error("Ошибка загрузки данных дашборда:", error);
        // В случае ошибки хотя бы покажем статистику по остальным данным
        try {
          const [usersData, coursesData, testsData] = await Promise.all([
            getUsers().catch(() => []),
            getCourses().catch(() => []),
            getTests().catch(() => []),
          ]);
          
          setStats({
            users: usersData.length,
            courses: coursesData.length,
            tests: testsData.length,
            trainers: 0
          });
        } catch (e) {
          console.error("Не удалось загрузить минимальные данные:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Подготовка данных для графика (регистрации пользователей по дням недели)
  const prepareWeeklyData = (users: User[]) => {
    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    const today = new Date();
    const weeklyStats = [];

    // Если нет пользователей, создаем пустые данные
    if (users.length === 0) {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        weeklyStats.push({
          day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
          users: 0,
          date: date.toLocaleDateString('ru-RU')
        });
      }
      setWeeklyData(weeklyStats);
      return;
    }

    // Создаем данные для последних 7 дней
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Подсчитываем пользователей, зарегистрированных в этот день
      const usersOnDay = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= dayStart && userDate <= dayEnd;
      }).length;

      weeklyStats.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        users: usersOnDay,
        date: date.toLocaleDateString('ru-RU')
      });
    }

    setWeeklyData(weeklyStats);
  };

  // Форматирование даты с проверкой на undefined
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Получение цвета для статуса
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'INACTIVE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Подсчет активных пользователей
  const activeUsersCount = recentUsers.filter(u => u.status === "ACTIVE").length;

  // Подсчет активных курсов
  const activeCoursesCount = recentCourses.filter(c => c.status === "ACTIVE").length;

  // Подсчет активных тестов
  const activeTestsCount = recentTests.filter(t => t.status === "ACTIVE").length;

  // Если данные загружаются, показываем скелетон
  if (loading) {
    return (
      <div className="space-y-8 p-0 sm:p-6 lg:p-8 bg-gray-50 w-full overflow-x-hidden">
        {/* Скелетоны для карточек */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        
        {/* Скелетон для графика */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-[300px] bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-0 sm:p-6 lg:p-8 bg-gray-50 w-full overflow-x-hidden">
      {/* Верхние карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Пользователи" 
          value={stats.users.toString()} 
          icon="👥" 
        />
        <StatCard 
          title="Курсы" 
          value={stats.courses.toString()} 
          icon="📚" 
        />
        <StatCard 
          title="Тесты" 
          value={stats.tests.toString()} 
          icon="🧪" 
        />
        <StatCard 
          title="Тренеры" 
          value={stats.trainers.toString()} 
          icon="👨‍🏫" 
        />
      </div>

      {/* График активности */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Регистрации пользователей за неделю
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Всего за неделю: {weeklyData.reduce((sum, day) => sum + day.users, 0)}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-500">Новые пользователи</span>
            </div>
          </div>
        </div>
        <div className="h-[220px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [`${value} пользователей`, 'Количество']}
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data ? `${label}, ${data.date}` : label;
                }}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke="#f97316"
                fill="url(#colorUsers)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Нижний ряд - таблицы */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Последние пользователи */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Последние пользователи
            </h3>
            <span className="text-sm text-gray-500">
              Всего: {stats.users}
            </span>
          </div>
          
          {recentUsers.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-[300px] overflow-auto">
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getStatusColor(user.status)} flex items-center justify-center font-medium`}>
                      {user.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных о пользователях
            </div>
          )}
        </div>

        {/* Последние курсы */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Последние курсы
            </h3>
            <span className="text-sm text-gray-500">
              Всего: {stats.courses}
            </span>
          </div>
          
          {recentCourses.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-[300px] overflow-auto">
              {recentCourses.map((course) => (
                <li
                  key={course.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{course.name}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-2">
                        <span>{course.price} UZS</span>
                        <span>•</span>
                        <span>{course.level} уровень</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDate(course.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных о курсах
            </div>
          )}
        </div>

        {/* Последние тренеры */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Последние тренеры
            </h3>
            <span className="text-sm text-gray-500">
              Всего: {stats.trainers}
            </span>
          </div>
          
          {recentTrainers.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-[300px] overflow-auto">
              {recentTrainers.map((trainer) => (
                <li
                  key={trainer.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      👨‍🏫
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{trainer.name}</p>
                      <p className="text-gray-500 text-xs truncate">
                        {trainer.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {trainer.experience} лет
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDate(trainer.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных о тренерах
            </div>
          )}
        </div>
      </div>

      {/* Таблица тестов */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Последние тесты
          </h3>
          <span className="text-sm text-gray-500">
            Всего: {stats.tests}
          </span>
        </div>
        
        {recentTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-gray-500 text-sm">Название</th>
                  <th className="text-left py-2 px-2 text-gray-500 text-sm">Длительность</th>
                  <th className="text-left py-2 px-2 text-gray-500 text-sm">Дата начала</th>
                  <th className="text-left py-2 px-2 text-gray-500 text-sm">Статус</th>
                  <th className="text-left py-2 px-2 text-gray-500 text-sm">Создан</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((test) => (
                  <tr key={test.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-800">{test.name}</td>
                    <td className="py-3 px-2 text-gray-600">{test.duration} мин</td>
                    <td className="py-3 px-2 text-gray-600">{formatDate(test.startDate)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-sm">
                      {test.createdAt ? formatDate(test.createdAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Нет данных о тестах
          </div>
        )}
      </div>
    </div>
  );
}
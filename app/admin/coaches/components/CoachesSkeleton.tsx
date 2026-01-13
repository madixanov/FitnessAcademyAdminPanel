"use client";

export default function TrainerTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b animate-pulse">
          {/* Фото */}
          <td className="px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
          </td>

          {/* Имя */}
          <td className="px-4 py-3">
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
          </td>

          {/* Email */}
          <td className="px-4 py-3">
            <div className="h-4 w-40 bg-gray-700 rounded"></div>
          </td>

          {/* Телефон */}
          <td className="px-4 py-3">
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
          </td>

          {/* Опыт */}
          <td className="px-4 py-3">
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
          </td>

          {/* Дата */}
          <td className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-700 rounded"></div>
          </td>

          {/* Действия */}
          <td className="px-4 py-3 flex gap-2">
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

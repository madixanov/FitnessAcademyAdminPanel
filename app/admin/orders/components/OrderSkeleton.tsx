export default function LessonsSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b animate-pulse">
          {/* Название */}
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-28" />
          </td>

          {/* Модуль */}
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 bg-gray-200 rounded w-32" />
          </td>

          {/* Курс */}
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 bg-gray-200 rounded w-32" />
          </td>

          {/* Длительность */}
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16" />
          </td>

          {/* Действия */}
          <td className="px-4 py-3">
            <div className="flex gap-3">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

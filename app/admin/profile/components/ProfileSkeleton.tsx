"use client";

export default function ProfileSkeleton() {
  return (
    <section className="animate-pulse p-6 bg-gray-50 flex justify-center">
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6 w-full max-w-3xl">
        {/* Заголовок */}
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Фото */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Основная информация */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
              <div className="h-4 w-36 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Кнопка редактирования */}
        <div className="mt-6 flex justify-end">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </section>
  );
}

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 lg:ml-60">
        <Header />
        {/* Отступ под фиксированный Header */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
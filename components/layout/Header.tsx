"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logout } from "@/services/login/login.api";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
     <header className="fixed top-0 left-0 right-0 lg:left-60 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">Панель управления</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleLogout}>
          Выйти 
        </Button>
        <Link href="/admin/profile">
          <Button className="bg-[#FF7A00]">
            Профиль  
          </Button> 
        </Link>
      </div>
    </header>
  );
}

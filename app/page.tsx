"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const rememberMe = Cookies.get("rememberMe") === "true";

    if (token && rememberMe) {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <p className="text-gray-500">Проверка авторизации...</p>
    </div>
  );
}

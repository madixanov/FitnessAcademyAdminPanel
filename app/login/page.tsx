"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { login } from "@/services/login/login.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const role = Cookies.get("role");

    if (token && (role === "ADMIN" || role === "TEACHER")) {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // делаем запрос на login с флагом rememberMe
      const data = await login(email, password, rememberMe);

      // редирект на админку
      window.location.href = "/admin";
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "NO_ACCESS":
            setError("У вас нет доступа к админке");
            break;
          case "USER_BLOCKED":
            setError("Аккаунт заблокирован");
            break;
          default:
            setError("Неверный email или пароль");
        }
      }
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-800">
            Вход в админку
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Запомнить меня
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 h-11 text-base">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

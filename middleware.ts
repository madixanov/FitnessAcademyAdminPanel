import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROLES = ["ADMIN", "TEACHER"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const role = req.cookies.get("role")?.value;

  // Защищаем все маршруты /admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Если токен отсутствует или роль не разрешена — редирект на /login
    if (!token || !ALLOWED_ROLES.includes(role || "")) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

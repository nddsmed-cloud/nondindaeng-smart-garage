// src/proxy.ts — Route Protection (Next.js 16+ Standard)
import { auth } from "./auth";
import { NextResponse } from "next/server";

// เปลี่ยนจาก export default auth เป็นการ export const proxy
export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const isPublicPath = pathname === "/login" || pathname.startsWith("/api/auth");

  // ไม่ login → redirect ไป /login
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Login แล้ว
  if (isLoggedIn) {
    const role = req.auth?.user?.role;

    // 1. เข้าหน้า login → redirect ไปตาม Role (DRIVER ไป /logs, นอกนั้นไป /dashboard)
    if (pathname === "/login") {
      if (role === "DRIVER") return NextResponse.redirect(new URL("/logs", req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. DRIVER restriction: ไม่ให้เข้า /dashboard หรือ /vehicles หรือ /admin หรือ /reports หรือ /requests
    if (role === "DRIVER") {
      const allowedDriverPaths = ["/logs", "/logs/energy", "/api/auth"];
      const isAllowed = allowedDriverPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/logs", req.url));
      }
    }

    // 3. ADMIN only routes
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 4. APPROVER (MANAGER) & ADMIN only routes
    if (pathname.startsWith("/dashboard/approvals")) {
      if (role !== "ADMIN" && role !== "MANAGER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 5. OFFICER & ADMIN only routes
    if (pathname.startsWith("/vehicles") || pathname.startsWith("/reports/oag")) {
      if (role !== "ADMIN" && role !== "OFFICER") {
        // MANAGER อาจจะดูข้อมูลได้ หรือไม่ได้? ตามระเบียบ: "OFFICER: เข้าถึงหน้า /vehicles"
        // ให้เฉพาะ ADMIN กับ OFFICER เข้าได้
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

// การตั้งค่า matcher สำหรับดักจับเส้นทางยังคงเหมือนเดิม
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
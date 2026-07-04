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

    // 1. เข้าหน้า login → redirect ไป /home
    if (pathname === "/login" || pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // 2. DRIVER restriction: จำกัดให้เข้าได้เฉพาะ /home, /logs, /gis
    if (role === "DRIVER") {
      const allowedDriverPaths = ["/home", "/logs", "/gis", "/api/auth"];
      const isAllowed = allowedDriverPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    }

    // 2.5 OFFICER_GIS restriction: จำกัดให้เข้าได้เฉพาะ /home, /gis
    if (role === "OFFICER_GIS") {
      const allowedGisPaths = ["/home", "/gis", "/api/auth"];
      const isAllowed = allowedGisPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    }

    // 3. ADMIN only routes
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") return NextResponse.redirect(new URL("/home", req.url));
    }

    // 4. APPROVER (MANAGER) & ADMIN only routes
    if (pathname.startsWith("/dashboard/approvals")) {
      if (role !== "ADMIN" && role !== "MANAGER") {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    }

    // 5. VEHICLE routes - ADMIN, OFFICER & MANAGER allowed
    if (pathname.startsWith("/vehicles")) {
      if (role !== "ADMIN" && role !== "OFFICER" && role !== "MANAGER") {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    }

    // 6. REPORTS/OAG routes - ADMIN & OFFICER only
    if (pathname.startsWith("/reports/oag")) {
      if (role !== "ADMIN" && role !== "OFFICER") {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    }
  }

  return NextResponse.next();
});

// การตั้งค่า matcher สำหรับดักจับเส้นทางยังคงเหมือนเดิม
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
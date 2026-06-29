// src/lib/auth-helpers.ts — Helper functions สำหรับตรวจสอบสิทธิ์

export type UserRole = "ADMIN" | "MANAGER" | "OFFICER" | "DRIVER";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  MANAGER: "ผู้บริหาร/อนุมัติ",
  OFFICER: "เจ้าหน้าที่",
  DRIVER: "พนักงานขับรถ",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "badge-red",
  MANAGER: "badge-purple",
  OFFICER: "badge-blue",
  DRIVER: "badge-green",
};

// ตรวจสอบว่า role มีสิทธิ์อย่างน้อยที่ระดับที่กำหนด
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  MANAGER: 3,
  OFFICER: 2,
  DRIVER: 1,
};

export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole as UserRole] ?? 0) >= ROLE_HIERARCHY[requiredRole];
}

// เช็คสิทธิ์เฉพาะ action
export const PERMISSIONS = {
  // ทะเบียนรถ
  canManageVehicles: (role: string) => hasRole(role, "MANAGER"),

  // คำขออนุมัติ
  canCreateRequest: (role: string) => hasRole(role, "OFFICER"),
  canApproveRequest: (role: string) => hasRole(role, "MANAGER"),
  canViewRequests: (role: string) => hasRole(role, "OFFICER"),

  // บันทึกการเดินทาง + น้ำมัน
  canManageLogs: (role: string) => hasRole(role, "DRIVER"),

  // จัดการ User
  canManageUsers: (role: string) => role === "ADMIN",
} as const;

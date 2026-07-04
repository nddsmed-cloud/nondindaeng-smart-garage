"use server";

import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";

// ตรวจสอบสิทธิ์ผู้ดูแลระบบ/ผู้อำนวยการ
async function checkAuth() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    throw new Error("Unauthorized: เฉพาะผู้ดูแลระบบและผู้อำนวยการเท่านั้นที่เข้าถึงได้");
  }
  return session;
}

// อัปเดตสถานะคำขอใช้รถ (รายบุคคล)
export async function updateVehicleRequestAction(
  id: string,
  data: {
    status: string;
    note?: string;
    vehicleId?: string;
    startMileage?: number;
  }
) {
  await checkAuth();

  try {
    const updateData: any = {
      status: data.status,
      note: data.note || "",
    };

    // หากอนุมัติ และเลือกจัดสรรรถยนต์
    if (data.status === "อนุมัติแล้ว") {
      if (data.vehicleId) updateData.vehicleId = data.vehicleId;
      if (typeof data.startMileage === "number") updateData.startMileage = data.startMileage;
    }

    const updated = await prisma.vehicleRequest.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/approvals");
    return { success: true, request: updated };
  } catch (error: any) {
    console.error("Error updating vehicle request:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ" };
  }
}

// อัปเดตสถานะการขอเติมน้ำมัน (รายบุคคล)
export async function updateFuelLogStatusAction(
  id: string,
  status: string,
  note?: string
) {
  await checkAuth();

  try {
    const updated = await prisma.fuelLog.update({
      where: { id },
      data: {
        status,
        note: note || "",
      },
    });

    revalidatePath("/dashboard/approvals");
    return { success: true, log: updated };
  } catch (error: any) {
    console.error("Error updating fuel log status:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะการเติมน้ำมัน" };
  }
}

// อนุมัติ/ปฏิเสธคำขอใช้รถยนต์แบบกลุ่ม (Bulk Update)
export async function bulkUpdateVehicleRequestsAction(
  ids: string[],
  status: string,
  note?: string
) {
  await checkAuth();

  try {
    await prisma.vehicleRequest.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        note: note || "",
      },
    });

    revalidatePath("/dashboard/approvals");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk updating vehicle requests:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการทำรายการแบบกลุ่ม" };
  }
}

// อนุมัติ/ปฏิเสธคำขอเติมน้ำมันแบบกลุ่ม (Bulk Update)
export async function bulkUpdateFuelLogsAction(
  ids: string[],
  status: string,
  note?: string
) {
  await checkAuth();

  try {
    await prisma.fuelLog.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        note: note || "",
      },
    });

    revalidatePath("/dashboard/approvals");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk updating fuel logs:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการทำรายการแบบกลุ่ม" };
  }
}

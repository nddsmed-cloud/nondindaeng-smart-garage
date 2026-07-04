"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { sendLineNotifyToDepartment } from "../../lib/line-notify";

export async function getLatestMileage(vehicleId: string): Promise<number> {
  const lastTrip = await prisma.tripLog.findFirst({
    where: { vehicleId },
    orderBy: { endMileage: "desc" },
  });
  const lastFuel = await prisma.fuelLog.findFirst({
    where: { vehicleId },
    orderBy: { endMileage: "desc" },
  });
  
  const tripMileage = lastTrip?.endMileage || 0;
  const fuelMileage = lastFuel?.endMileage || 0;
  
  return Math.max(tripMileage, fuelMileage);
}

// ====== Trip Logs ======
export async function createTripLog(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const requestId = formData.get("requestId") as string;

  if (requestId) {
    await prisma.vehicleRequest.update({
      where: { id: requestId },
      data: { status: "กำลังเดินทาง" },
    });
  }

  const vehicleId = formData.get("vehicleId") as string;
  const roadId = formData.get("roadId") as string;
  await prisma.tripLog.create({
    data: {
      vehicleId,
      driverName: formData.get("driverName") as string,
      department: formData.get("department") as string,
      destination: formData.get("destination") as string,
      purpose: formData.get("purpose") as string,
      travelDate: formData.get("travelDate") as string,
      startMileage: parseInt(formData.get("startMileage") as string) || 0,
      userId,
      roadId: roadId ? roadId : null,
    },
  });

  // อัปเดตสถานะรถยนต์เป็น อยู่ระหว่างเดินทาง
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: "อยู่ระหว่างเดินทาง" },
  });

  revalidatePath("/logs");
  revalidatePath("/dashboard");
  
  if (formData.get("isLiff") === "true") {
    return { success: true };
  }
  redirect("/logs");
}

export async function completeTripLog(id: string, endMileage: number) {
  const trip = await prisma.tripLog.findUnique({ where: { id } });
  if (!trip) return;
  await prisma.tripLog.update({
    where: { id },
    data: {
      endMileage,
      distance: endMileage - trip.startMileage,
      status: "เสร็จสิ้น",
    },
  });

  // อัปเดตสถานะรถยนต์กลับเป็น พร้อมใช้งาน
  await prisma.vehicle.update({
    where: { id: trip.vehicleId },
    data: { status: "พร้อมใช้งาน" },
  });

  // ค้นหาใบขอใช้รถที่กำลังเดินทางอยู่ของรถคันนี้ แล้วเปลี่ยนสถานะเป็น เสร็จสิ้น
  const activeReq = await prisma.vehicleRequest.findFirst({
    where: {
      vehicleId: trip.vehicleId,
      status: "กำลังเดินทาง",
    },
  });
  if (activeReq) {
    await prisma.vehicleRequest.update({
      where: { id: activeReq.id },
      data: { status: "เสร็จสิ้น" },
    });
  }

  revalidatePath("/logs");
}

export async function deleteTripLog(id: string) {
  const session = await auth();
  const role = session?.user?.role;
  const dept = session?.user?.department;
  if (!role || role === "DRIVER") throw new Error("Unauthorized");

  const log = await prisma.tripLog.findUnique({ where: { id } });
  if (!log) return;
  if (role !== "ADMIN" && log.department !== dept) throw new Error("Unauthorized");

  await prisma.tripLog.delete({ where: { id } });

  // คืนสถานะรถเป็น พร้อมใช้งาน หากทริปนี้ยังไม่เสร็จแล้วถูกลบ
  if (log.status === "กำลังเดินทาง") {
    await prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: "พร้อมใช้งาน" },
    });
  }

  revalidatePath("/logs");
  revalidatePath("/dashboard");
}

// ====== Fuel Logs ======
export async function createFuelLog(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role || "OFFICER";
  const userDept = session?.user?.department || "";
  const vehicleId = formData.get("vehicleId") as string;
  const endMileage = parseInt(formData.get("endMileage") as string) || 0;
  const liters = parseFloat(formData.get("liters") as string) || 0;
  const pricePerLiter = parseFloat(formData.get("pricePerLiter") as string) || 0;
  const redirectUri = formData.get("redirectUri") as string;

  // ดึงเกณฑ์ อปท. จากรถยนต์
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  const standardRate = vehicle?.standardConsumptionRate || 13.0;

  // ดึงไมล์สิ้นสุดครั้งก่อนหน้ามาเป็นไมล์เริ่มต้นครั้งนี้
  const latestMileage = await getLatestMileage(vehicleId);
  const startMileage = parseInt(formData.get("startMileage") as string) || latestMileage || endMileage;
  const distance = Math.max(0, endMileage - startMileage);
  const expectedFuel = standardRate > 0 ? distance / standardRate : 0;
  const fuelDifference = liters - expectedFuel;

  // สิทธิ์ในการอนุมัติเติมน้ำมัน: ADMIN และ MANAGER ได้รับการอนุมัติทันที
  const status = (userRole === "ADMIN" || userRole === "MANAGER") ? "อนุมัติแล้ว" : "รออนุมัติ";

  await prisma.fuelLog.create({
    data: {
      vehicleId,
      fuelDate: formData.get("fuelDate") as string,
      liters,
      pricePerLiter,
      totalCost: liters * pricePerLiter,
      startMileage,
      endMileage,
      distance,
      standardRate,
      expectedFuel,
      fuelDifference,
      explanation: formData.get("explanation") as string || "",
      fuelStation: formData.get("fuelStation") as string || "",
      note: formData.get("note") as string || "",
      userId,
      department: userDept,
      status,
    },
  });

  // ส่ง LINE Notify ไปยังกลุ่ม LINE ประจำแผนก หากเป็นกรณีรออนุมัติ
  if (status === "รออนุมัติ" && userDept && vehicle) {
    const totalCostFormatted = (liters * pricePerLiter).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const lineMessage = `📢 [คำขออนุมัติเติมน้ำมัน]\nกอง: ${userDept}\nผู้ขอ: ${session?.user?.name || "พนักงานขับรถ"}\nรถทะเบียน: ${vehicle.licensePlate}\nปริมาณ: ${liters} ลิตร\nยอดรวม: ${totalCostFormatted} บาท\nกรุณาเข้าสู่ระบบเพื่อตรวจสอบและอนุมัติ: https://6-ndd-smart-garage.vercel.app/dashboard/approvals`;
    await sendLineNotifyToDepartment(userDept, lineMessage);
  }

  revalidatePath("/logs/energy");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/approvals");
  
  if (formData.get("isLiff") === "true") {
    return { success: true };
  }

  if (redirectUri) {
    redirect(redirectUri);
  } else {
    redirect("/logs/energy");
  }
}

export async function updateFuelLogStatus(id: string, status: string) {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  if (role !== "ADMIN" && role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const fuelLog = await prisma.fuelLog.findUnique({
    where: { id },
  });

  if (!fuelLog) throw new Error("Fuel log not found");

  // ผอ.กอง (MANAGER) อนุมัติได้เฉพาะกองของตัวเอง
  if (role === "MANAGER" && fuelLog.department !== department) {
    throw new Error("Unauthorized to approve other department's fuel requests");
  }

  await prisma.fuelLog.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/logs/energy");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/approvals");
}

export async function deleteFuelLog(id: string) {
  const session = await auth();
  const role = session?.user?.role;
  const dept = session?.user?.department;
  if (!role || role === "DRIVER") throw new Error("Unauthorized");

  const log = await prisma.fuelLog.findUnique({ where: { id } });
  if (!log) return;
  if (role !== "ADMIN" && log.department !== dept) throw new Error("Unauthorized");

  await prisma.fuelLog.delete({ where: { id } });
  revalidatePath("/logs/energy");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/approvals");
}

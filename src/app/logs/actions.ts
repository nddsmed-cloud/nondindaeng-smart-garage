"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "../../auth";

// ====== Trip Logs ======
export async function createTripLog(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  await prisma.tripLog.create({
    data: {
      vehicleId: formData.get("vehicleId") as string,
      driverName: formData.get("driverName") as string,
      department: formData.get("department") as string,
      destination: formData.get("destination") as string,
      purpose: formData.get("purpose") as string,
      travelDate: formData.get("travelDate") as string,
      startMileage: parseInt(formData.get("startMileage") as string) || 0,
      userId,
    },
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
  revalidatePath("/logs");
  revalidatePath("/dashboard");
}

// ====== Fuel Logs ======
export async function createFuelLog(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const vehicleId = formData.get("vehicleId") as string;
  const endMileage = parseInt(formData.get("endMileage") as string) || 0;
  const liters = parseFloat(formData.get("liters") as string) || 0;
  const pricePerLiter = parseFloat(formData.get("pricePerLiter") as string) || 0;

  // ดึงเกณฑ์ อปท. จากรถยนต์
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  const standardRate = vehicle?.standardConsumptionRate || 13.0;

  // ดึงไมล์สิ้นสุดครั้งก่อนหน้ามาเป็นไมล์เริ่มต้นครั้งนี้
  const lastLog = await prisma.fuelLog.findFirst({
    where: { vehicleId },
    orderBy: { endMileage: "desc" },
  });

  const startMileage = lastLog?.endMileage || endMileage;
  const distance = Math.max(0, endMileage - startMileage);
  const expectedFuel = standardRate > 0 ? distance / standardRate : 0;
  const fuelDifference = liters - expectedFuel;

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
      department: session?.user?.department || "",
    },
  });
  revalidatePath("/logs/energy");
  revalidatePath("/dashboard");
  
  if (formData.get("isLiff") === "true") {
    return { success: true };
  }
  redirect("/logs/energy");
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
}

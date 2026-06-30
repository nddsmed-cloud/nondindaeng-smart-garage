"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../auth";

import { getLatestMileage } from "../logs/actions";

export async function getVehiclesByDepartment(department: string) {
  const vehicles = await prisma.vehicle.findMany({
    where: { department, status: "พร้อมใช้งาน" },
    orderBy: { licensePlate: "asc" },
  });

  const vehiclesWithMileage = await Promise.all(
    vehicles.map(async (v) => {
      const mileage = await getLatestMileage(v.id);
      return {
        id: v.id,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType,
        brand: v.brand,
        model: v.model,
        latestMileage: mileage,
      };
    })
  );

  return vehiclesWithMileage;
}

export async function createRequest(formData: FormData) {
  const vehicleId = formData.get("vehicleId") as string || null;
  const startMileageStr = formData.get("startMileage") as string;
  const startMileage = startMileageStr ? parseInt(startMileageStr) : null;
  
  let vehicleType = formData.get("vehicleType") as string || "";
  if (vehicleId) {
    const v = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (v) {
      vehicleType = `${v.vehicleType} (${v.licensePlate})`;
    }
  }

  await prisma.vehicleRequest.create({
    data: {
      requesterName: formData.get("requesterName") as string,
      department: formData.get("department") as string,
      purpose: formData.get("purpose") as string,
      vehicleType,
      vehicleId,
      startMileage,
      travelDate: formData.get("travelDate") as string,
      destination: formData.get("destination") as string || "",
    },
  });
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  redirect("/requests");
}

export async function approveRequest(id: string) {
  const session = await auth();
  const role = session?.user?.role;
  const dept = session?.user?.department;
  if (!role || role === "DRIVER" || role === "OFFICER") throw new Error("Unauthorized");

  const req = await prisma.vehicleRequest.findUnique({ where: { id } });
  if (!req) return;
  if (role !== "ADMIN" && req.department !== dept) throw new Error("Unauthorized");

  await prisma.vehicleRequest.update({
    where: { id },
    data: { status: "อนุมัติแล้ว" },
  });
  revalidatePath("/requests");
  revalidatePath("/dashboard");
}

export async function rejectRequest(id: string) {
  const session = await auth();
  const role = session?.user?.role;
  const dept = session?.user?.department;
  if (!role || role === "DRIVER" || role === "OFFICER") throw new Error("Unauthorized");

  const req = await prisma.vehicleRequest.findUnique({ where: { id } });
  if (!req) return;
  if (role !== "ADMIN" && req.department !== dept) throw new Error("Unauthorized");

  await prisma.vehicleRequest.update({
    where: { id },
    data: { status: "ไม่อนุมัติ" },
  });
  revalidatePath("/requests");
  revalidatePath("/dashboard");
}

export async function deleteRequest(id: string) {
  const session = await auth();
  const role = session?.user?.role;
  const dept = session?.user?.department;
  if (!role || role === "DRIVER") throw new Error("Unauthorized");

  const req = await prisma.vehicleRequest.findUnique({ where: { id } });
  if (!req) return;
  if (role !== "ADMIN" && req.department !== dept) throw new Error("Unauthorized");

  await prisma.vehicleRequest.delete({ where: { id } });
  revalidatePath("/requests");
  revalidatePath("/dashboard");
}

export async function getVehicleTypesByDepartment(department: string) {
  const vehicles = await prisma.vehicle.findMany({
    where: { department },
    select: { vehicleType: true },
    distinct: ["vehicleType"],
  });
  return vehicles.map(v => v.vehicleType);
}

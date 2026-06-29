"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export async function createRequest(formData: FormData) {
  await prisma.vehicleRequest.create({
    data: {
      requesterName: formData.get("requesterName") as string,
      department: formData.get("department") as string,
      purpose: formData.get("purpose") as string,
      vehicleType: formData.get("vehicleType") as string,
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
  if (!role || role === "DRIVER") throw new Error("Unauthorized");

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
  if (!role || role === "DRIVER") throw new Error("Unauthorized");

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

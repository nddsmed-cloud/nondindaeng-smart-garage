"use server";

import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";

export async function createMaintenanceLog(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || role === "DRIVER") throw new Error("Unauthorized: Drivers cannot create maintenance logs");

  const data = {
    vehicleId: formData.get("vehicleId") as string,
    maintenanceDate: formData.get("maintenanceDate") as string,
    mileage: parseInt(formData.get("mileage") as string) || 0,
    details: formData.get("details") as string,
    cost: parseFloat(formData.get("cost") as string) || 0,
    garageName: formData.get("garageName") as string,
    responsibleName: formData.get("responsibleName") as string || session?.user?.name || "",
    department: session?.user?.department || "",
    userId: session?.user?.id,
  };

  await prisma.maintenanceLog.create({ data });
  
  revalidatePath("/logs/maintenance");
  revalidatePath("/dashboard");
  redirect("/logs/maintenance");
}

export async function deleteMaintenanceLog(id: string) {
  const session = await auth();
  const role = session?.user?.role;
  const dept = session?.user?.department;
  if (!role || role === "DRIVER") throw new Error("Unauthorized");

  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) return;
  if (role !== "ADMIN" && log.department !== dept) throw new Error("Unauthorized: Cannot delete logs from other departments");

  await prisma.maintenanceLog.delete({ where: { id } });
  
  revalidatePath("/logs/maintenance");
  revalidatePath("/dashboard");
}

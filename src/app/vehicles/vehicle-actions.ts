"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export async function createVehicle(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized: Only ADMIN can manage vehicles");

  try {
    const data = {
      registeredDate: new Date(formData.get("registeredDate") as string),
      licensePlate: formData.get("licensePlate") as string,
      province: formData.get("province") as string,
      vehicleType: formData.get("vehicleType") as string,
      bodyType: formData.get("bodyType") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      color: formData.get("color") as string,
      chassisNumber: formData.get("chassisNumber") as string,
      engineNumber: formData.get("engineNumber") as string,
      fuelType: formData.get("fuelType") as string,
      engineCapacity: parseInt(formData.get("engineCapacity") as string) || 0,
      emptyWeight: parseInt(formData.get("emptyWeight") as string) || 0,
      payloadWeight: parseInt(formData.get("payloadWeight") as string) || 0,
      totalWeight: parseInt(formData.get("totalWeight") as string) || 0,
      status: formData.get("status") as string || "พร้อมใช้งาน",
      department: (formData.get("department") as string) || session?.user?.department || "",
      assetNumber: (formData.get("assetNumber") as string) || "",
      acquiredPrice: parseFloat(formData.get("acquiredPrice") as string) || 0,
    };

    await prisma.vehicle.create({ data });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลรถยนต์ได้" };
  }

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function updateVehicle(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized: Only ADMIN can manage vehicles");

  try {
    const data = {
      registeredDate: new Date(formData.get("registeredDate") as string),
      licensePlate: formData.get("licensePlate") as string,
      province: formData.get("province") as string,
      vehicleType: formData.get("vehicleType") as string,
      bodyType: formData.get("bodyType") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      color: formData.get("color") as string,
      chassisNumber: formData.get("chassisNumber") as string,
      engineNumber: formData.get("engineNumber") as string,
      fuelType: formData.get("fuelType") as string,
      engineCapacity: parseInt(formData.get("engineCapacity") as string) || 0,
      emptyWeight: parseInt(formData.get("emptyWeight") as string) || 0,
      payloadWeight: parseInt(formData.get("payloadWeight") as string) || 0,
      totalWeight: parseInt(formData.get("totalWeight") as string) || 0,
      status: formData.get("status") as string,
      department: formData.get("department") as string,
      assetNumber: (formData.get("assetNumber") as string) || "",
      acquiredPrice: parseFloat(formData.get("acquiredPrice") as string) || 0,
    };

    // Remove department if it's not provided (e.g., if the form doesn't have it)
    if (!data.department) delete (data as any).department;

    await prisma.vehicle.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return { success: false, error: "ไม่สามารถแก้ไขข้อมูลรถยนต์ได้" };
  }

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function deleteVehicle(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized: Only ADMIN can manage vehicles");

  try {
    await prisma.vehicle.delete({
      where: { id },
    });
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: "ไม่สามารถลบข้อมูลรถยนต์ได้" };
  }
}

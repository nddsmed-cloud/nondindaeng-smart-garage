"use server";

import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMaintenanceDocument(data: any) {
  try {
    const doc = await prisma.maintenanceDocument.create({
      data: {
        vehicleId: data.vehicleId,
        mileage: parseInt(data.mileage, 10) || 0,
        symptoms: data.symptoms,
        partsReplaced: data.partsReplaced,
        estimatedCost: parseFloat(data.estimatedCost) || 0,
        garageName: data.garageName,
        garageReason: data.garageReason,
        committee1: data.committee1,
        committee2: data.committee2,
        committee3: data.committee3,
        inspectorName: data.inspectorName,
        reporterName: data.reporterName,
      }
    });
    
    // Create an entry in MaintenanceLog as well to keep records synchronized
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        maintenanceDate: new Date().toISOString(),
        mileage: parseInt(data.mileage, 10) || 0,
        details: `ซ่อมแซม: ${data.symptoms} (เปลี่ยน: ${data.partsReplaced})`,
        cost: parseFloat(data.estimatedCost) || 0,
        garageName: data.garageName,
        responsibleName: data.reporterName,
      }
    });

    revalidatePath(`/vehicles/${data.vehicleId}`);
    return { success: true, documentId: doc.id };
  } catch (error: any) {
    console.error("Failed to create maintenance document:", error);
    return { success: false, error: error.message };
  }
}

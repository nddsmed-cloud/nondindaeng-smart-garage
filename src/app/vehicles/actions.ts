// src/app/vehicles/actions.ts
"use server";

import { prisma } from "../../lib/prisma";
import { sendLineNotify } from "../../lib/line-notify";
import { revalidatePath } from "next/cache";

export async function submitVehicleRequest(formData: FormData) {
  try {
    // 1. รับค่าที่ส่งมาจากฟอร์มหน้าเว็บ
    const data = {
      requesterName: formData.get("requesterName") as string,
      department: formData.get("department") as string,
      purpose: formData.get("purpose") as string,
      vehicleType: formData.get("vehicleType") as string,
      travelDate: formData.get("travelDate") as string,
    };

    // 2. บันทึกข้อมูลลงตาราง VehicleRequest ใน SQLite
    await prisma.vehicleRequest.create({ data });

    // 3. จัดรูปแบบข้อความแจ้งเตือนสำหรับผู้บริหาร
    const message = `
📢 มีคำขอใช้รถยนต์ส่วนกลางใหม่ (รออนุมัติ)
----------------------------------
👤 ผู้ขอ: ${data.requesterName} (${data.department})
🚗 ประเภทรถ: ${data.vehicleType}
📅 วันที่เดินทาง: ${data.travelDate}
📍 วัตถุประสงค์: ${data.purpose}
----------------------------------
🔗 ตรวจสอบและอนุมัติได้ที่:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/approvals
`;

    // 4. สั่งยิง LINE Notify
    await sendLineNotify(message);

    // 5. สั่งให้ระบบล้างแคช เพื่อให้หน้าแดชบอร์ดอัปเดตข้อมูลใหม่ทันที
    revalidatePath("/dashboard/approvals");

    return { success: true };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกคำขอ:", error);
    return { success: false, error: "ไม่สามารถส่งคำขอได้ในขณะนี้" };
  }
}
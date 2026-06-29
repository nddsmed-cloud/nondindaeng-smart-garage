// src/lib/line-notify.ts
import { prisma } from "./prisma";

export async function sendLineNotify(message: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_NOTIFY_TOKEN;
  
  if (!token) {
    console.error("❌ ไม่พบ LINE_CHANNEL_ACCESS_TOKEN ในระบบ");
    return { success: false, error: "Missing Token" };
  }

  try {
    // 1. ดึง LINE Group ID ทั้งหมดที่ลงทะเบียนไว้ในระบบ
    const groups = await prisma.groupAccess.findMany({
      select: { lineGroupId: true }
    });

    const targetIds = groups.map(g => g.lineGroupId).filter(Boolean);

    if (targetIds.length === 0) {
      console.log("⚠️ ไม่มีกลุ่ม LINE ที่ลงทะเบียนไว้ในระบบ ข้ามการส่งข้อความ");
      return { success: true };
    }

    // 2. ส่งข้อความแบบ Multicast (ส่งทีเดียวได้สูงสุด 500 กลุ่ม/คน)
    const response = await fetch("https://api.line.me/v2/bot/message/multicast", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: targetIds,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ LINE Messaging API Error:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการส่ง LINE Message:", error);
    return { success: false, error };
  }
}
import { NextResponse } from "next/server";
import crypto from "crypto";

// ฟังก์ชันสำหรับส่งข้อความตอบกลับ (Reply) กลับไปยัง LINE
async function replyMessage(replyToken: string, text: string) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [
        {
          type: "text",
          text: text,
        },
      ],
    }),
  });
}

// ตรวจสอบความถูกต้องของ Signature ว่ามาจาก LINE จริงๆ
function verifySignature(body: string, signature: string) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const textBody = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    // ข้ามการตรวจสอบ Signature ถ้าใช้ ngrok สำหรับทดสอบชั่วคราว (แต่แนะนำให้เปิดไว้เมื่อขึ้น Production)
    if (process.env.NODE_ENV === "production" && !verifySignature(textBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(textBody);
    
    // วนลูปประมวลผลทุกเหตุการณ์ (Events) ที่ LINE ส่งมา
    for (const event of data.events) {
      const isJoinEvent = event.type === "join";
      const isMessageEvent = event.type === "message" && event.message?.type === "text";
      const messageText = isMessageEvent ? event.message.text.trim() : "";

      // เช็คว่าเป็นข้อความที่พิมพ์คำว่า "@checkid" หรือ บอทเพิ่งถูกเชิญเข้ากลุ่ม (join)
      if (isJoinEvent || (isMessageEvent && messageText === "@checkid")) {
        
        // ตรวจสอบว่า Event นี้เกิดขึ้นใน "กลุ่ม (group)" เท่านั้น
        if (event.source.type === "group") {
          const groupId = event.source.groupId;
          
          await replyMessage(
            event.replyToken,
            `Group ID ของกลุ่มนี้คือ:\n\n${groupId}\n\n(คุณสามารถนำรหัสนี้ไปลงทะเบียนในระบบ Smart Garage ได้เลยครับ)`
          );
        } else {
          // กรณีที่มีคนทักแชทส่วนตัว หรืออยู่ในห้องแชทแบบห้อง (room)
          await replyMessage(
            event.replyToken,
            "คำสั่งนี้ใช้ได้เฉพาะใน LINE 'กลุ่ม' เท่านั้นครับ"
          );
        }
      }
    }

    // ต้องตอบกลับ 200 OK เสมอ เพื่อบอก LINE ว่าเรารับข้อมูลสำเร็จแล้ว
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("LINE Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

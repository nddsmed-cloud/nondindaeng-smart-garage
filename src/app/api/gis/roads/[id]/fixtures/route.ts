// src/app/api/gis/roads/[id]/fixtures/route.ts
// GET  — รายการ fixture ของถนนสายนี้
// POST — เพิ่ม fixture ใหม่

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendLineNotifyToDepartment } from "@/lib/line-notify";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const fixtures = await prisma.roadFixture.findMany({
    where: { assetId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(fixtures);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { type, detail, lat, lng, status, note } = await req.json();

  if (!type || lat === undefined || lng === undefined) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน (type, lat, lng)" }, { status: 400 });
  }

  const fixture = await prisma.roadFixture.create({
    data: {
      assetId: id,
      type,
      detail: detail || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      status: status || "NORMAL",
      note: note || null,
    },
  });

  if (fixture.status === "DAMAGED") {
    const road = await prisma.infraAsset.findUnique({ where: { id } });
    const fixtureTypes: Record<string, string> = {
      STREETLIGHT: "เสาไฟฟ้าแสงสว่าง",
      TRAFFIC_SIGN: "ป้ายจราจร",
      CCTV: "กล้องวงจรปิด",
      OTHER: "อื่นๆ",
    };
    const typeLabel = fixtureTypes[fixture.type] || fixture.type;
    const msg = `🚨 [แจ้งเหตุสิ่งติดตั้งชำรุด]\nประเภท: ${typeLabel}\nรายละเอียด: ${fixture.detail || "-"}\nสถานที่: ถนน ${road?.name || "-"}\nพิกัด: https://www.google.com/maps?q=${fixture.lat},${fixture.lng}`;
    await sendLineNotifyToDepartment("กองช่าง", msg);
  }

  return NextResponse.json(fixture, { status: 201 });
}

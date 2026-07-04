// src/app/api/gis/roads/[id]/fixtures/[fid]/route.ts
// PUT    — แก้ไข fixture
// DELETE — ลบ fixture

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendLineNotifyToDepartment } from "@/lib/line-notify";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, fid } = await params;
  const { type, detail, lat, lng, status, note } = await req.json();

  const oldFixture = await prisma.roadFixture.findUnique({ where: { id: fid } });

  const fixture = await prisma.roadFixture.update({
    where: { id: fid },
    data: {
      type,
      detail: detail || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      status: status || "NORMAL",
      note: note || null,
    },
  });

  if (fixture.status === "DAMAGED" && oldFixture?.status !== "DAMAGED") {
    const road = await prisma.infraAsset.findUnique({ where: { id } });
    const fixtureTypes: Record<string, string> = {
      STREETLIGHT: "เสาไฟฟ้าแสงสว่าง",
      TRAFFIC_SIGN: "ป้ายจราจร",
      CCTV: "กล้องวงจรปิด",
      OTHER: "อื่นๆ",
    };
    const typeLabel = fixtureTypes[fixture.type] || fixture.type;
    const msg = `🚨 [อัปเดตสิ่งติดตั้งชำรุด]\nประเภท: ${typeLabel}\nรายละเอียด: ${fixture.detail || "-"}\nสถานที่: ถนน ${road?.name || "-"}\nพิกัด: https://www.google.com/maps?q=${fixture.lat},${fixture.lng}`;
    await sendLineNotifyToDepartment("กองช่าง", msg);
  }

  return NextResponse.json(fixture);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fid } = await params;
  await prisma.roadFixture.delete({ where: { id: fid } });
  return NextResponse.json({ success: true });
}

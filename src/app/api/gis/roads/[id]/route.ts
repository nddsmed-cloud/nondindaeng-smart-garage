// src/app/api/gis/roads/[id]/route.ts
// GET  — ดึงข้อมูลถนน + registration + fixtures
// PUT  — อัปเดตข้อมูล ทถ.3

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const asset = await prisma.infraAsset.findUnique({
    where: { id },
    include: {
      registration: true,
      fixtures: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!asset) return NextResponse.json({ error: "ไม่พบถนนนี้" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const {
    routeCode,
    lengthKm,
    surfaceType,
    pavementWidth,
    rightOfWayWidth,
    shoulderWidth,
    sidewalkWidth,
    drainageDetail,
    landDocumentType,
    path,
  } = body;

  // อัปเดต path ถ้ามีส่ง
  if (path !== undefined) {
    await prisma.infraAsset.update({ where: { id }, data: { path } });
  }

  // Upsert registration (ทถ.3)
  const regData = {
    routeCode: routeCode || null,
    lengthKm: lengthKm ? parseFloat(lengthKm) : null,
    surfaceType: surfaceType || null,
    pavementWidth: pavementWidth ? parseFloat(pavementWidth) : null,
    rightOfWayWidth: rightOfWayWidth ? parseFloat(rightOfWayWidth) : null,
    shoulderWidth: shoulderWidth ? parseFloat(shoulderWidth) : null,
    sidewalkWidth: sidewalkWidth ? parseFloat(sidewalkWidth) : null,
    drainageDetail: drainageDetail || null,
    landDocumentType: landDocumentType || null,
  };

  const registration = await prisma.roadRegistration.upsert({
    where: { assetId: id },
    update: regData,
    create: { assetId: id, status: "APPROVED", ...regData },
  });

  return NextResponse.json(registration);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.infraAsset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

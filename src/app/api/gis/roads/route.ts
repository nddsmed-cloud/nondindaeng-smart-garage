// src/app/api/gis/roads/route.ts
// GET  — รายการถนนทั้งหมด
// POST — สร้างถนนสายใหม่

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roads = await prisma.infraAsset.findMany({
    include: { registration: true, _count: { select: { fixtures: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(roads);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, routeCode } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "กรุณาระบุชื่อถนน" }, { status: 400 });

  const asset = await prisma.infraAsset.create({
    data: {
      name: name.trim(),
      path: [],
      registration: routeCode
        ? { create: { routeCode, status: "APPROVED" } }
        : undefined,
    },
    include: { registration: true },
  });

  return NextResponse.json(asset, { status: 201 });
}

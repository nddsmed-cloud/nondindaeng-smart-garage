import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      reporterName, 
      reporterPhone, 
      reporterLineId, 
      category, 
      description, 
      location,
      lat, 
      lng, 
      imageBeforeUrl 
    } = body;

    // สร้างรหัสแจ้งซ่อม (ตัวอย่าง: RP2568-0001)
    const count = await prisma.repairRequest.count();
    const year = new Date().getFullYear() + 543;
    const requestCode = `RP${year}-${String(count + 1).padStart(4, '0')}`;

    const repair = await prisma.repairRequest.create({
      data: {
        requestCode,
        reporterName,
        reporterPhone,
        reporterLineId,
        category,
        description,
        location: location || '',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        imageBeforeUrl,
      },
    });

    return NextResponse.json({ success: true, data: repair }, { status: 201 });
  } catch (error) {
    console.error('Error creating repair request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit repair request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const requests = await prisma.repairRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        workOrder: true
      }
    });
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch repair requests' },
      { status: 500 }
    );
  }
}

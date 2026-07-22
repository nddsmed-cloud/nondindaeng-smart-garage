import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      applicantName, 
      applicantPhone, 
      applicantLineId, 
      buildingType, 
      address, 
      lat, 
      lng, 
      documentUrl 
    } = body;

    // สร้างเลขที่รับเรื่อง (ตัวอย่าง: กช.001/2568)
    const count = await prisma.buildingPermit.count();
    const year = new Date().getFullYear() + 543;
    const permitNumber = `กช.${String(count + 1).padStart(3, '0')}/${year}`;

    const permit = await prisma.buildingPermit.create({
      data: {
        permitNumber,
        applicantName,
        applicantPhone,
        applicantLineId,
        buildingType,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        documentUrl,
      },
    });

    return NextResponse.json({ success: true, data: permit }, { status: 201 });
  } catch (error) {
    console.error('Error creating building permit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit permit request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const permits = await prisma.buildingPermit.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: permits });
  } catch (error) {
    console.error('Error fetching permits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permits' },
      { status: 500 }
    );
  }
}

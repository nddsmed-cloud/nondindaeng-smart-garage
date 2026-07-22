import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase Client for Storage
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // 1. ตรวจสอบสิทธิ์ (Bearer Token) เบื้องต้น
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    // สามารถเพิ่ม Logic การ Validate JWT ได้ที่นี่

    // 2. รับข้อมูลแบบ Multipart/form-data
    const formData = await req.formData();
    
    const ticket_id = formData.get('ticket_id') as string;
    const surveyor_id = formData.get('surveyor_id') as string;
    const status = formData.get('status') as string || 'COMPLETED';
    const latitudeStr = formData.get('latitude') as string;
    const longitudeStr = formData.get('longitude') as string;
    const after_image = formData.get('after_image') as File | null;

    if (!ticket_id || !latitudeStr || !longitudeStr) {
      return NextResponse.json({ error: 'Missing required fields (ticket_id, latitude, longitude)' }, { status: 400 });
    }

    const lat = parseFloat(latitudeStr);
    const lng = parseFloat(longitudeStr);

    let imageUrl = null;

    // 3. จัดการอัปโหลดไฟล์ไปที่ Supabase Storage
    if (after_image) {
      const fileExt = after_image.name.split('.').pop();
      const fileName = `survey-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const buffer = Buffer.from(await after_image.arrayBuffer());

      const { error } = await supabase
        .storage
        .from('surveys')
        .upload(fileName, buffer, {
          contentType: after_image.type,
          upsert: false
        });

      if (error) {
        console.error('Supabase Storage Error:', error);
        return NextResponse.json({ error: 'Failed to upload image to Supabase' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from('surveys').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    // 4. บันทึกข้อมูลลงฐานข้อมูล พร้อมคำสั่ง PostGIS (ST_MakePoint)
    // เนื่องจาก Prisma ไม่รองรับฟังก์ชัน PostGIS ในฟิลด์ปกติ เราจึงต้องใช้ $executeRaw
    await prisma.$transaction(async (tx) => {
      // 4.1 อัปเดตตาราง WorkOrder (ใช้ตารางจริงคือ work_orders)
      await tx.$executeRaw`
        UPDATE work_orders 
        SET 
          technician_name = ${surveyor_id},
          image_after_url = ${imageUrl},
          completed_at = NOW(),
          geom = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        WHERE repair_request_id = (SELECT id FROM repair_requests WHERE request_code = ${ticket_id})
      `;

      // 4.2 อัปเดตสถานะของใบแจ้งซ่อมหลัก
      await tx.$executeRaw`
        UPDATE repair_requests
        SET status = 'COMPLETED'
        WHERE request_code = ${ticket_id}
      `;
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Survey data updated successfully via PostGIS',
      data: {
        ticket_id,
        imageUrl,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Survey Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// src/app/dashboard/approvals/page.tsx
import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";

export default async function ApprovalsPage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  // คัดกรองคำขอตามหน่วยงาน (ยกเว้น ADMIN ที่เห็นทั้งหมด)
  const whereClause = role === "ADMIN" ? {} : { department };

  // ดึงข้อมูลคำขอทั้งหมดจากฐานข้อมูล เรียงจากใหม่ไปเก่า
  const requests = await prisma.vehicleRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  // ฟังก์ชัน Server Action สำหรับอัปเดตสถานะ (ทำงานฝั่งเซิร์ฟเวอร์ทันที)
  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    
    await prisma.vehicleRequest.update({
      where: { id },
      data: { status },
    });
    
    // สั่งรีเฟรชหน้าเว็บเพื่อแสดงสถานะใหม่
    revalidatePath("/dashboard/approvals");
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">กระดานพิจารณาอนุมัติ</h1>
          <p className="text-slate-500 mt-1">ระบบตรวจสอบคำขอใช้รถยนต์ส่วนกลาง</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
          สถานะ: ผู้บริหาร
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-slate-200">
          <p className="text-slate-500 text-lg">🎉 ยังไม่มีคำขอใช้รถที่รอการอนุมัติในขณะนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4 transition-all hover:shadow-md">
              
              {/* ข้อมูลคำขอ */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800">{req.requesterName}</h3>
                  <span className="text-sm bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {req.department}
                  </span>
                  {/* ป้ายกำกับสถานะ */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    req.status === "รออนุมัติ" ? "bg-amber-100 text-amber-700" :
                    req.status === "อนุมัติแล้ว" ? "bg-emerald-100 text-emerald-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {req.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-700">รถที่ขอ:</strong> {req.vehicleType} | 
                  <strong className="text-slate-700 ml-2">วันที่ไป:</strong> {req.travelDate}
                </p>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-700">วัตถุประสงค์:</strong> {req.purpose}
                </p>
              </div>

              {/* ปุ่มดำเนินการ (แสดงเฉพาะสถานะ 'รออนุมัติ') */}
              {req.status === "รออนุมัติ" && (
                <div className="flex items-center gap-2 md:border-l md:pl-4">
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="status" value="อนุมัติแล้ว" />
                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-full md:w-auto">
                      ✅ อนุมัติ
                    </button>
                  </form>
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="status" value="ไม่อนุมัติ" />
                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-full md:w-auto">
                      ❌ ไม่อนุมัติ
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
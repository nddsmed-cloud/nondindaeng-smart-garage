import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";
import GroupTable from "./GroupTable";

export default async function AdminGroupsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const groups = await prisma.groupAccess.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">จัดการสิทธิ์ LINE กลุ่ม (LIFF)</h1>
          <p className="page-subtitle">ลงทะเบียน Group ID เพื่อผูกกับกอง/หน่วยงาน สำหรับ Auto Login</p>
        </div>
      </div>

      <GroupTable groups={groups} />
    </>
  );
}

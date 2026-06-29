import { prisma } from "../../lib/prisma";
import Link from "next/link";
import RequestsTable from "./RequestsTable";
import { auth } from "../../auth";

export default async function RequestsPage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  // กรองข้อมูลตามแผนกยกเว้น ADMIN
  const whereClause = role === "ADMIN" ? {} : { department };

  const requests = await prisma.vehicleRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "รออนุมัติ").length;
  const approved = requests.filter((r) => r.status === "อนุมัติแล้ว").length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">คำขออนุญาตใช้รถ {role !== "ADMIN" && department ? `- ${department}` : ""}</h1>
          <p className="page-subtitle">
            รออนุมัติ <strong style={{ color: "var(--yellow)" }}>{pending}</strong> รายการ &nbsp;·&nbsp;
            อนุมัติแล้ว <strong style={{ color: "var(--green)" }}>{approved}</strong> รายการ
          </p>
        </div>
        <Link href="/requests/new" className="btn btn-primary">
          + สร้างคำขอใหม่
        </Link>
      </div>

      <RequestsTable requests={requests} />
    </>
  );
}

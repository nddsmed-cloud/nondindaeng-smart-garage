import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import TripLogsTable from "./TripLogsTable";

export default async function LogsPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const whereClause = role === "DRIVER" 
    ? {
        OR: [
          { userId },
          { driverName: session?.user?.name || "" }
        ]
      }
    : {};

  const trips = await prisma.tripLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { vehicle: true },
  });

  const ongoing = trips.filter((t) => t.status === "กำลังเดินทาง").length;
  const totalDistance = trips.reduce((sum, t) => sum + t.distance, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">บันทึกการเดินทาง</h1>
          {role !== "DRIVER" && (
            <p className="page-subtitle">
              กำลังเดินทาง <strong style={{ color: "var(--blue)" }}>{ongoing}</strong> รายการ &nbsp;·&nbsp;
              รวมระยะทาง <strong style={{ color: "var(--green)" }}>{totalDistance.toLocaleString()}</strong> กม.
            </p>
          )}
        </div>
        <Link href="/logs/new" className="btn btn-primary">
          + บันทึกการเดินทาง
        </Link>
      </div>

      <TripLogsTable trips={trips} role={role || "DRIVER"} />
    </>
  );
}

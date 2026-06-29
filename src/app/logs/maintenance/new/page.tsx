import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import NewMaintenanceForm from "./NewMaintenanceForm";
import { redirect } from "next/navigation";

export default async function NewMaintenancePage() {
  const session = await auth();
  const role = session?.user?.role;
  
  if (role === "DRIVER") {
    redirect("/logs/maintenance"); // ไม่อนุญาตให้ DRIVER เข้าหน้านี้
  }

  const department = session?.user?.department;
  const whereClause = role === "ADMIN" ? {} : { department };

  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    orderBy: { licensePlate: "asc" },
  });

  return <NewMaintenanceForm vehicles={vehicles} />;
}

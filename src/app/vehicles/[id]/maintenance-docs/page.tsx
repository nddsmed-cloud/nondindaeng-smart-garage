import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "../../../../auth";
import MaintenanceDocClient from "./MaintenanceDocClient";

export default async function MaintenanceDocsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const role = session?.user?.role || "DRIVER";

  if (role !== "ADMIN" && role !== "MANAGER" && role !== "OFFICER") {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </div>
    );
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
  });

  if (!vehicle) {
    notFound();
  }

  return <MaintenanceDocClient vehicle={vehicle} />;
}

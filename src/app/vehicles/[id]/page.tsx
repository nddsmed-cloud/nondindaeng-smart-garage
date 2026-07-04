import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import VehicleDetailClient from "./VehicleDetailClient";
import { auth } from "../../../auth";

export default async function VehiclePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const role = session?.user?.role || "DRIVER";

  // 1. Fetch vehicle data from database
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: {
      tripLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      fuelLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!vehicle) {
    notFound();
  }

  // 2. Pass data to client component
  return (
    <VehicleDetailClient
      vehicle={vehicle}
      tripLogs={vehicle.tripLogs}
      fuelLogs={vehicle.fuelLogs}
      role={role}
    />
  );
}
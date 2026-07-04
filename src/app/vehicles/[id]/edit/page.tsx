import { prisma } from "../../../../lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../auth";
import EditVehicleForm from "./EditVehicleForm";

export default async function EditVehiclePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/vehicles");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <EditVehicleForm vehicle={vehicle} />
  );
}

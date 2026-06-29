import { prisma } from "../../../../lib/prisma";
import NewFuelForm from "./NewFuelForm";

export default async function NewFuelPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { licensePlate: "asc" },
  });

  return <NewFuelForm vehicles={vehicles} />;
}

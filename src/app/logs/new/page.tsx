import { prisma } from "../../../lib/prisma";
import NewTripForm from "./NewTripForm";

export default async function NewTripPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { licensePlate: "asc" },
  });

  return <NewTripForm vehicles={vehicles} />;
}

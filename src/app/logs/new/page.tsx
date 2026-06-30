import { prisma } from "../../../lib/prisma";
import NewTripForm from "./NewTripForm";

export default async function NewTripPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const params = await searchParams;
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { licensePlate: "asc" },
  });

  return <NewTripForm vehicles={vehicles} searchParams={params} />;
}

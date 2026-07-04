import { prisma } from "../../../lib/prisma";
import NewTripForm from "./NewTripForm";

export default async function NewTripPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const params = await searchParams;
  const [vehicles, roads] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { licensePlate: "asc" } }),
    prisma.infraAsset.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);

  return <NewTripForm vehicles={vehicles} roads={roads} searchParams={params} />;
}

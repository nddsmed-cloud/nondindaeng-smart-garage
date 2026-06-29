"use server";

import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";

export async function createGroupAccess(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const lineGroupId = formData.get("lineGroupId") as string;
  const departmentName = formData.get("departmentName") as string;
  const defaultRole = formData.get("defaultRole") as string;

  await prisma.groupAccess.create({
    data: {
      lineGroupId,
      departmentName,
      defaultRole,
    },
  });

  revalidatePath("/admin/groups");
}

export async function deleteGroupAccess(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.groupAccess.delete({ where: { id } });
  revalidatePath("/admin/groups");
}

"use server";
// src/app/admin/users/actions.ts
import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "../../../auth";

export async function createUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const password = formData.get("password") as string;
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      password: hashedPassword,
      role: formData.get("role") as string,
      department: formData.get("department") as string || "",
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function updateUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const department = formData.get("department") as string;
  const password = formData.get("password") as string;

  const data: any = { name, role, department };

  if (password && password.length >= 6) {
    const bcrypt = await import("bcryptjs");
    data.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function resetPassword(id: string, newPassword: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
  revalidatePath("/admin/users");
}

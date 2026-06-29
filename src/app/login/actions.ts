"use server";
// src/app/login/actions.ts
import { signIn } from "../../auth";
import { AuthError } from "next-auth";

export async function loginAction(prevState: { error: string } | null, formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    throw error; // re-throw redirect
  }
  return null;
}

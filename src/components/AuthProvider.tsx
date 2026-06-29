"use client";
// src/components/AuthProvider.tsx — SessionProvider wrapper สำหรับ Client Components
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

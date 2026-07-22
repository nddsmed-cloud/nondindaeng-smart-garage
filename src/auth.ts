// src/auth.ts — NextAuth v5 Configuration
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import "next-auth/jwt";

// ====== Type Extensions ======
declare module "next-auth" {
  interface User {
    role: string;
    department: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: string;
      department: string;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    department: string;
    username: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user || !user.isActive || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.username, // NextAuth requires email field, repurpose it
          role: user.role,
          department: user.department,
        };
      },
    }),
    Credentials({
      id: "liff",
      name: "LINE LIFF",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        groupId: { label: "Group ID", type: "text" },
      },
      authorize: async (credentials) => {
        const accessToken = credentials?.accessToken as string;
        const groupId = credentials?.groupId as string;

        if (!accessToken || !groupId) return null;

        // Verify token with LINE API
        const verifyRes = await fetch(`https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`);
        if (!verifyRes.ok) return null;

        // Get user profile
        const profileRes = await fetch("https://api.line.me/v2/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!profileRes.ok) return null;
        
        const lineProfile = await profileRes.json();
        const lineUserId = lineProfile.userId;

        // Verify Group ID
        const groupAccess = await prisma.groupAccess.findUnique({
          where: { lineGroupId: groupId }
        });

        if (!groupAccess) return null; // Group not registered

        // Upsert User
        let user = await prisma.user.findUnique({
          where: { lineUserId },
        });

        if (user) {
          user = await prisma.user.update({
            where: { lineUserId },
            data: {
              name: lineProfile.displayName,
              department: groupAccess.departmentName,
            }
          });
        } else {
          user = await prisma.user.create({
            data: {
              name: lineProfile.displayName,
              username: `line_${lineUserId}`,
              lineUserId: lineUserId,
              department: groupAccess.departmentName,
              role: groupAccess.defaultRole,
            }
          });
        }

        if (!user.isActive) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          role: user.role,
          department: user.department,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role as string | undefined;

      // Public pages
      if (pathname === '/e-permit' || pathname === '/e-service') return true;

      // Dashboard RBAC
      if (pathname.startsWith('/e-permit/dashboard') || pathname.startsWith('/e-service/dashboard')) {
        return !!role && ['ADMIN_OFFICER', 'INSPECTOR_ENGINEER', 'DIRECTOR', 'EXECUTIVE', 'ADMIN'].includes(role);
      }
      // Technician RBAC
      if (pathname.startsWith('/e-service/technician')) {
        return !!role && ['INSPECTOR_ENGINEER', 'DIRECTOR', 'ADMIN'].includes(role);
      }

      return !!auth;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.username = user.email as string; // stored username in email field
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub as string,
        name: token.name as string,
        username: token.username as string,
        role: token.role as string,
        department: token.department as string,
      } as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

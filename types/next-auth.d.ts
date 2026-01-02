import NextAuth from "next-auth";
import { UserRole } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      approved: boolean;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    approved: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    approved: boolean;
  }
}

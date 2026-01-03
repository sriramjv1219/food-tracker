import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createOrUpdateUser, findUserById } from "./user-operations";
import { UserRole } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      try {
        // Create or update user in database
        const dbUser = await createOrUpdateUser({
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
          provider: account?.provider || "google",
        });

        // Store the MongoDB _id and user details for use in session
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.approved = dbUser.approved;

        return true;
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || UserRole.MEMBER;
        session.user.approved = (token.approved as boolean) || false;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in - set user data
        token.id = user.id;
        token.role = user.role || UserRole.MEMBER;
        token.approved = user.approved || false;
      } else if (token?.id) {
        // Refresh user data from database on subsequent requests
        try {
          const dbUser = await findUserById(token.id as string);
          if (dbUser) {
            token.role = dbUser.role;
            token.approved = dbUser.approved;
          }
        } catch (error) {
          console.error("Error refreshing user data in JWT:", error);
        }
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createUser, fetchUser } from "./data-service";
import { randomUUID } from "crypto";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user }) {
      console.log("SignIn callback received:", user);

      try {
        const existingUser = await fetchUser(user.email);

        if (!existingUser) {
          const newUser = await createUser({
            id: randomUUID(),
            email: user.email,
            name: user.name,
            role: "User",
          });
          console.log("Created new user in public.users:", newUser);
        }

        return true;
      } catch (err) {
        console.error("SignIn error:", err);
        return false;
      }
    },
    async session({ session }) {
      const user = await fetchUser(session.user.email);
      session.user.userId = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

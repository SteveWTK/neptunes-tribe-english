import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createUser, fetchUser } from "./data-service";
import supabaseAdmin from "./supabase-admin";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          console.error("Credentials login error:", error);
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
        };
      },
    }),
  ],

  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },

    async signIn({ user, account }) {
      console.log("SignIn callback received:", user, "Account:", account);

      try {
        const existingUser = await fetchUser(user.email);

        if (!existingUser) {
          // For Google OAuth, use the user.id from the provider
          // For credentials, the user.id is already the Supabase auth ID
          const newUser = await createUser({
            id: user.id, // Use the actual user ID, not randomUUID()
            email: user.email,
            name: user.name || null,
            image: user.image || null,
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
      if (user) {
        session.user.userId = user.id;
        session.user.is_premium = user.is_premium;
        session.user.role = user.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

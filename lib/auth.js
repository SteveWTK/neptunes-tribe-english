// lib\auth.js
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createUser, fetchUser, updateUser } from "./data-service";
import getSupabaseAdmin from "./supabase-admin-lazy";

// Smart URL detection
function getBaseUrl() {
  // In development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Always use your custom domain in production
  return "https://neptunes-tribe.com";
}

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // FIXED: Essential configuration to prevent invalid_grant errors
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent", // Forces fresh consent - prevents invalid_grant
          response_type: "code", // Explicit response type
        },
      },
      // Ensure proper profile handling
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      // Additional options to prevent issues
      checks: ["pkce", "state"], // Enable PKCE and state checks
    }),
  ],

  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },

    async signIn({ user, account, profile }) {
      console.log(
        "SignIn callback - User:",
        user,
        "Account:",
        account?.provider,
        "Environment:",
        process.env.NODE_ENV
      );

      try {
        // Handle Google OAuth users
        if (account?.provider === "google") {
          console.log("Processing Google OAuth user...");

          // Check if user exists in public.users table
          const existingPublicUser = await fetchUser(user.email);

          if (!existingPublicUser) {
            // Create new user in public.users table only
            const newUser = await createUser({
              id: user.id,
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              role: "User",
            });
            console.log(
              "Created new Google OAuth user in public.users:",
              newUser
            );
          } else {
            console.log(
              "Google OAuth user already exists in public.users:",
              existingPublicUser.email
            );

            // Update the existing user's Google info if needed
            if (!existingPublicUser.image && user.image) {
              try {
                await updateUser(existingPublicUser.id, { image: user.image });
                console.log("Updated user image from Google OAuth");
              } catch (error) {
                console.error("Failed to update user image:", error);
              }
            }
          }

          return true;
        }

        // Handle credentials (email/password) users
        if (account?.provider === "credentials") {
          console.log("Processing credentials user...");

          const existingPublicUser = await fetchUser(user.email);

          if (!existingPublicUser) {
            const newUser = await createUser({
              id: user.id,
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              role: "User",
            });
            console.log(
              "Created new credentials user in public.users:",
              newUser
            );
          } else {
            console.log(
              "Credentials user already exists in public.users:",
              existingPublicUser.email
            );
          }

          return true;
        }

        return true;
      } catch (err) {
        console.error("SignIn error:", err);
        return false;
      }
    },

    async session({ session, token }) {
      // Fetch user data from public.users table
      const user = await fetchUser(session.user.email);
      if (user) {
        session.user.userId = user.id;
        session.user.is_premium = user.is_premium;
        session.user.role = user.role;
        session.user.is_supporter = user.is_supporter;
        session.user.stripe_customer_id = user.stripe_customer_id;
        session.user.stripe_subscription_status =
          user.stripe_subscription_status;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // Use our smart base URL detection
      const detectedBaseUrl = getBaseUrl();

      console.log(
        "Redirect - URL:",
        url,
        "Base:",
        baseUrl,
        "Detected:",
        detectedBaseUrl
      );

      // If url is relative, use detected base URL
      if (url.startsWith("/")) {
        return `${detectedBaseUrl}${url}`;
      }

      // If url starts with detected base URL, return as-is
      if (url.startsWith(detectedBaseUrl)) {
        return url;
      }

      // Default to detected base URL
      return detectedBaseUrl;
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

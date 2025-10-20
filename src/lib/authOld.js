// lib/auth.js - 12.06

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createUser, fetchUser, updateUser } from "./data-service";
import getSupabaseAdmin from "./supabase-admin-lazy";

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

        const supabaseAdmin = getSupabaseAdmin();
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
          name: data.user.user_metadata?.name || null,
          image: data.user.user_metadata?.avatar_url || null,
        };
      },
    }),
  ],

  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },

    async signIn({ user, account, profile }) {
      console.log("=== SIGNIN CALLBACK START ===");
      console.log("Environment:", process.env.NODE_ENV);
      console.log("User:", { id: user.id, email: user.email, name: user.name });
      console.log("Account provider:", account?.provider);
      console.log("=== SIGNIN CALLBACK START ===");

      try {
        // Handle Google OAuth users
        if (account?.provider === "google") {
          console.log("Processing Google OAuth user...");

          // Check if user exists in public.users table
          const existingPublicUser = await fetchUser(user.email);
          console.log(
            "Existing public user:",
            existingPublicUser ? "Found" : "Not found"
          );

          if (!existingPublicUser) {
            // Create new user in public.users table only
            console.log("Creating new Google OAuth user...");
            const newUser = await createUser({
              id: user.id,
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              role: "User",
            });
            console.log("Created new Google OAuth user:", newUser?.id);
          } else {
            console.log(
              "Google OAuth user already exists:",
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

          console.log("=== GOOGLE OAUTH SIGNIN SUCCESS ===");
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
            console.log("Created new credentials user:", newUser?.id);
          } else {
            console.log(
              "Credentials user already exists:",
              existingPublicUser.email
            );
          }

          return true;
        }

        return true;
      } catch (err) {
        console.error("=== SIGNIN ERROR ===");
        console.error("Error details:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("=== SIGNIN ERROR END ===");
        return false;
      }
    },

    async session({ session, token }) {
      try {
        console.log("=== SESSION CALLBACK ===");
        console.log("Session user email:", session.user?.email);

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
          console.log("Session enhanced with user data");
        } else {
          console.log("No user found in public.users table");
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },

    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      console.log("=== REDIRECT CALLBACK ===");
      console.log("URL:", url);
      console.log("Base URL:", baseUrl);

      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log("Redirecting to:", redirectUrl);
        return redirectUrl;
      }

      if (url.startsWith(baseUrl)) {
        console.log("Redirecting to:", url);
        return url;
      }

      console.log("Redirecting to base URL:", baseUrl);
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Add debug mode for production troubleshooting
  debug: process.env.NODE_ENV === "development",
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

// // lib/auth.js
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";
// import { createUser, fetchUser, updateUser } from "./data-service";
// import getSupabaseAdmin from "./supabase-admin-lazy"; // Changed this line

// const authConfig = {
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       // Remove the hardcoded redirect URI - let NextAuth handle it automatically
//     }),
//     Credentials({
//       name: "Email and Password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const { email, password } = credentials;

//         const supabaseAdmin = getSupabaseAdmin(); // Use the lazy-loaded function
//         const { data, error } = await supabaseAdmin.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (error || !data.user) {
//           console.error("Credentials login error:", error);
//           return null;
//         }

//         return {
//           id: data.user.id,
//           email: data.user.email,
//           name: data.user.user_metadata?.name || null,
//           image: data.user.user_metadata?.avatar_url || null,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     authorized({ auth, request }) {
//       return !!auth?.user;
//     },

//     async signIn({ user, account, profile }) {
//       console.log(
//         "SignIn callback - User:",
//         user,
//         "Account:",
//         account?.provider
//       );

//       try {
//         // Handle Google OAuth users
//         if (account?.provider === "google") {
//           console.log("Processing Google OAuth user...");

//           // Check if user exists in public.users table
//           const existingPublicUser = await fetchUser(user.email);

//           if (!existingPublicUser) {
//             // Create new user in public.users table only
//             const newUser = await createUser({
//               id: user.id, // Use Google OAuth user ID
//               email: user.email,
//               name: user.name || null,
//               image: user.image || null,
//               role: "User",
//             });
//             console.log(
//               "Created new Google OAuth user in public.users:",
//               newUser
//             );
//           } else {
//             console.log(
//               "Google OAuth user already exists in public.users:",
//               existingPublicUser.email
//             );

//             // Update the existing user's Google info if needed
//             if (!existingPublicUser.image && user.image) {
//               try {
//                 await updateUser(existingPublicUser.id, { image: user.image });
//                 console.log("Updated user image from Google OAuth");
//               } catch (error) {
//                 console.error("Failed to update user image:", error);
//               }
//             }
//           }

//           return true;
//         }

//         // Handle credentials (email/password) users
//         if (account?.provider === "credentials") {
//           console.log("Processing credentials user...");

//           // For credentials users, the user is already authenticated via Supabase Auth
//           // Now ensure they exist in public.users table
//           const existingPublicUser = await fetchUser(user.email);

//           if (!existingPublicUser) {
//             const newUser = await createUser({
//               id: user.id, // Use Supabase auth user ID
//               email: user.email,
//               name: user.name || null,
//               image: user.image || null,
//               role: "User",
//             });
//             console.log(
//               "Created new credentials user in public.users:",
//               newUser
//             );
//           } else {
//             console.log(
//               "Credentials user already exists in public.users:",
//               existingPublicUser.email
//             );
//             // This is fine - user exists from Google OAuth, now they're signing in with credentials
//           }

//           return true;
//         }

//         return true;
//       } catch (err) {
//         console.error("SignIn error:", err);
//         return false;
//       }
//     },

//     async session({ session, token }) {
//       // Fetch user data from public.users table
//       const user = await fetchUser(session.user.email);
//       if (user) {
//         session.user.userId = user.id;
//         session.user.is_premium = user.is_premium;
//         session.user.role = user.role;
//         session.user.is_supporter = user.is_supporter;
//         session.user.stripe_customer_id = user.stripe_customer_id;
//         session.user.stripe_subscription_status =
//           user.stripe_subscription_status;
//       }
//       return session;
//     },

//     async jwt({ token, user, account }) {
//       // Store the provider type in the token
//       if (account) {
//         token.provider = account.provider;
//       }
//       return token;
//     },

//     // Simplified redirect callback
//     async redirect({ url, baseUrl }) {
//       // If url is relative, prepend the base URL
//       if (url.startsWith("/")) {
//         return `${baseUrl}${url}`;
//       }

//       // If url starts with baseUrl, return as-is
//       if (url.startsWith(baseUrl)) {
//         return url;
//       }

//       // Default to base URL
//       return baseUrl;
//     },
//   },

//   pages: {
//     signIn: "/login",
//   },

//   session: {
//     strategy: "jwt",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// export const {
//   auth,
//   signIn,
//   signOut,
//   handlers: { GET, POST },
// } = NextAuth(authConfig);

// lib/auth.js
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createUser, fetchUser, updateUser } from "./data-service";
import getSupabaseAdmin from "./supabase-admin-lazy"; // Changed this line

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Remove the hardcoded redirect URI - let NextAuth handle it automatically
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const supabaseAdmin = getSupabaseAdmin(); // Use the lazy-loaded function
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
      console.log(
        "SignIn callback - User:",
        user,
        "Account:",
        account?.provider
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
              id: user.id, // Use Google OAuth user ID
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

          // For credentials users, the user is already authenticated via Supabase Auth
          // Now ensure they exist in public.users table
          const existingPublicUser = await fetchUser(user.email);

          if (!existingPublicUser) {
            const newUser = await createUser({
              id: user.id, // Use Supabase auth user ID
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
            // This is fine - user exists from Google OAuth, now they're signing in with credentials
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
      // Store the provider type in the token
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    // Simplified redirect callback
    async redirect({ url, baseUrl }) {
      // If url is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // If url starts with baseUrl, return as-is
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default to base URL
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
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";
// import { createUser, fetchUser } from "./data-service";
// import supabaseAdmin from "./supabase-admin";

// const authConfig = {
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       // Force the correct redirect URI
//       authorization: {
//         params: {
//           redirect_uri: "https://neptunes-tribe.com/api/auth/callback/google",
//         },
//       },
//     }),
//     Credentials({
//       name: "Email and Password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const { email, password } = credentials;

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

//     // Add redirect callback to ensure proper domain handling
//     async redirect({ url, baseUrl }) {
//       // Ensure we always redirect to the correct domain
//       const correctBaseUrl = process.env.NEXTAUTH_URL || baseUrl;

//       // If url is relative, prepend the correct base URL
//       if (url.startsWith("/")) {
//         return `${correctBaseUrl}${url}`;
//       }

//       // If url contains the correct domain, return as-is
//       if (url.startsWith(correctBaseUrl)) {
//         return url;
//       }

//       // If url contains vercel domain, replace with correct domain
//       if (url.includes("vercel.app")) {
//         return url.replace(/https:\/\/[^.]+\.vercel\.app/, correctBaseUrl);
//       }

//       // Default fallback
//       return correctBaseUrl;
//     },
//   },

//   pages: {
//     signIn: "/login",
//   },

//   session: {
//     strategy: "jwt",
//   },

//   secret: process.env.NEXTAUTH_SECRET,

//   // Add explicit URL configuration
//   ...(process.env.NEXTAUTH_URL && {
//     url: process.env.NEXTAUTH_URL,
//   }),
// };

// export const {
//   auth,
//   signIn,
//   signOut,
//   handlers: { GET, POST },
// } = NextAuth(authConfig);

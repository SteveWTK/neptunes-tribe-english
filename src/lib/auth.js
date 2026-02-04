// lib\auth.js
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
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      checks: ["pkce", "state"],
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log(
            "🔐 Credentials authorize called for:",
            credentials?.email
          );

          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing email or password");
            return null;
          }

          // Authenticate with Supabase Auth
          const supabase = await getSupabaseAdmin();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("❌ Supabase auth error:", error.message);
            return null;
          }

          if (!data.user) {
            console.log("❌ No user returned from Supabase");
            return null;
          }

          console.log("✅ User authenticated successfully:", data.user.email);

          // Return user object that NextAuth expects
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
            image: data.user.user_metadata?.avatar_url || null,
          };
        } catch (error) {
          console.error("❌ Error in authorize:", error);
          return null;
        }
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

        // Guest user: add guest-specific session fields
        if (user.role === "guest") {
          session.user.is_guest = true;
          session.user.guest_expires_at =
            token.guest_premium_until || user.premium_until || null;

          // Check if guest premium has expired
          if (
            user.premium_until &&
            new Date(user.premium_until) < new Date()
          ) {
            session.user.is_premium = false;
          }
        }
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
      }

      // On initial sign-in, check if this is a guest user
      if (account?.provider === "credentials" && user) {
        try {
          const guestUser = await fetchUser(user.email);
          if (guestUser?.role === "guest") {
            token.is_guest = true;
            token.guest_premium_until = guestUser.premium_until || null;
          }
        } catch (err) {
          console.error("Error checking guest status in jwt callback:", err);
        }
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - URL:", url, "BaseURL:", baseUrl);

      // Ensure we're using the correct base URL
      const correctBaseUrl = process.env.NEXTAUTH_URL || baseUrl;

      // If it's a relative URL, make it absolute with correct base
      if (url.startsWith("/")) {
        const redirectUrl = `${correctBaseUrl}${url}`;
        console.log("Redirecting to:", redirectUrl);
        return redirectUrl;
      }

      // If URL already starts with our domain, use it
      if (url.startsWith(correctBaseUrl)) {
        console.log("URL already absolute, using:", url);
        return url;
      }

      // For any other case, redirect to post-login check (avatar selection)
      const defaultUrl = `${correctBaseUrl}/auth/post-login`;
      console.log("Default redirect to:", defaultUrl);
      return defaultUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page instead of default error page
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Add debug logging in development
  debug: process.env.NODE_ENV === "development",
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

// lib\auth.js
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";
// import { createUser, fetchUser, updateUser } from "./data-service";
// import getSupabaseAdmin from "./supabase-admin-lazy";

// // Smart URL detection
// function getBaseUrl() {
//   // In development
//   if (process.env.NODE_ENV === "development") {
//     return "http://localhost:3000";
//   }

//   // Always use your custom domain in production
//   return "https://neptunes-tribe.com";
// }

// const authConfig = {
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       // FIXED: Essential configuration to prevent invalid_grant errors
//       authorization: {
//         params: {
//           scope: "openid email profile",
//           access_type: "offline",
//           prompt: "consent", // Forces fresh consent - prevents invalid_grant
//           response_type: "code", // Explicit response type
//         },
//       },
//       // Ensure proper profile handling
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture,
//         };
//       },
//       // Additional options to prevent issues
//       checks: ["pkce", "state"], // Enable PKCE and state checks
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
//         account?.provider,
//         "Environment:",
//         process.env.NODE_ENV
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
//               id: user.id,
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

//           const existingPublicUser = await fetchUser(user.email);

//           if (!existingPublicUser) {
//             const newUser = await createUser({
//               id: user.id,
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
//       if (account) {
//         token.provider = account.provider;
//       }
//       return token;
//     },

//     async redirect({ url, baseUrl }) {
//       // Use our smart base URL detection
//       const detectedBaseUrl = getBaseUrl();

//       console.log(
//         "Redirect - URL:",
//         url,
//         "Base:",
//         baseUrl,
//         "Detected:",
//         detectedBaseUrl
//       );

//       // If url is relative, use detected base URL
//       if (url.startsWith("/")) {
//         return `${detectedBaseUrl}${url}`;
//       }

//       // If url starts with detected base URL, return as-is
//       if (url.startsWith(detectedBaseUrl)) {
//         return url;
//       }

//       // Default to detected base URL
//       return detectedBaseUrl;
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

// lib/account-linking.js
import { fetchUser } from "./data-service";
import getSupabaseAdmin from "./supabase-admin-lazy";

export async function handleAccountLinking(
  email,
  newProvider,
  newUserId,
  userInfo
) {
  try {
    console.log(`Checking for existing account with email: ${email}`);

    // Check if user exists in public.users
    const existingUser = await fetchUser(email);

    if (existingUser) {
      console.log(`Found existing user in public.users: ${existingUser.email}`);

      // If it's a Google OAuth sign-in and user exists (likely from email/password signup)
      if (newProvider === "google") {
        console.log("Google OAuth sign-in for existing email/password user");

        // Update the existing user record with Google info if beneficial
        // You could update their profile image, for example
        if (!existingUser.image && userInfo.image) {
          // Here you'd update the user record - implement based on your data-service
          console.log("Could update user image from Google OAuth");
        }

        return {
          success: true,
          userId: existingUser.id,
          message: "Linked Google account to existing user",
        };
      }

      // If it's an email/password sign-in and user exists (likely from Google OAuth)
      if (newProvider === "credentials") {
        console.log("Email/password sign-in for existing Google OAuth user");

        // Check if this user exists in Supabase Auth
        const { data: authUser } =
          await getSupabaseAdmin.auth.admin.getUserByEmail(email);

        if (!authUser?.user) {
          // Need to create Supabase Auth user for this existing public.users record
          const { data: newAuthUser, error } =
            await getSupabaseAdmin.auth.admin.createUser({
              email: email,
              password: userInfo.password, // This would need to be hashed
              email_confirm: true,
              user_metadata: {
                name: existingUser.name,
                avatar_url: existingUser.image,
              },
            });

          if (error) {
            console.error(
              "Failed to create Supabase auth user for existing Google user:",
              error
            );
            return {
              success: false,
              error: "Could not link accounts",
            };
          }

          console.log(
            "Created Supabase auth user for existing Google OAuth user"
          );
        }

        return {
          success: true,
          userId: existingUser.id,
          message: "Linked email/password to existing Google account",
        };
      }
    }

    return {
      success: true,
      userId: null,
      message: "No existing account found",
    };
  } catch (error) {
    console.error("Account linking error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

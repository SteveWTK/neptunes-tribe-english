"use server";

import { signIn, signOut } from "./auth";
import getSupabaseAdmin from "./supabase-admin-lazy";

export async function signInAction() {
  await signIn("google", { redirectTo: "/units" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// Add this to your lib/actions.js file

export async function registerUser({ email, password }) {
  try {
    console.log("=== SERVER-SIDE REGISTRATION STARTED ===");
    console.log("Email:", email);

    // Create user in Supabase Auth with email confirmation required
    const { data, error } = await getSupabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // This will require email confirmation
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    console.log(
      "User created with email_confirmed_at:",
      data.user.email_confirmed_at
    );
    console.log("User email:", data.user.email);
    console.log(
      "Redirect URL:",
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
    );

    if (error) {
      console.error("Registration error:", error);
      throw new Error(error.message);
    }

    console.log("Registration successful:", data.user.id);

    // The confirmation email should be sent automatically by Supabase
    // But let's also trigger it manually to be sure
    const { data: linkData, error: linkError } =
      await getSupabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

    if (linkError) {
      console.error("Failed to generate confirmation link:", linkError);
    } else {
      console.log("Confirmation link generated successfully");
    }

    return {
      success: true,
      message:
        "Registration successful! Please check your email to confirm your account.",
      userId: data.user.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.message || "Registration failed",
    };
  }
}

export async function resetPassword({ email }) {
  try {
    const { error } = await getSupabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });

    if (error) throw error;

    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to send reset email",
    };
  }
}

// lib\actions.js (Environment-aware actions)

"use server";

import { signIn, signOut } from "./auth";
import getSupabaseAdmin from "./supabase-admin-lazy";

// Smart base URL detection
function getBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Use environment variable in production (set in Vercel)
  return process.env.NEXT_PUBLIC_BASE_URL || "https://habitatenglish.com";
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/worlds" });
}

export async function registerUser({ email, password }) {
  try {
    console.log("=== SERVER-SIDE REGISTRATION STARTED ===");
    console.log("Email:", email);
    console.log("Environment:", process.env.NODE_ENV);

    const baseUrl = getBaseUrl();
    const redirectUrl = `${baseUrl}/auth/callback`;

    console.log("Using redirect URL:", redirectUrl);

    // Create user in Supabase Auth with email confirmation required
    const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    console.log(
      "User created with email_confirmed_at:",
      data.user.email_confirmed_at
    );
    console.log("User email:", data.user.email);
    console.log("Redirect URL:", redirectUrl);

    if (error) {
      console.error("Registration error:", error);
      throw new Error(error.message);
    }

    console.log("Registration successful:", data.user.id);

    // Generate confirmation link
    const { data: linkData, error: linkError } =
      await getSupabaseAdmin().auth.admin.generateLink({
        type: "signup",
        email: email,
        options: {
          redirectTo: redirectUrl,
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
    const baseUrl = getBaseUrl();
    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${baseUrl}/reset-password`,
      }
    );

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

// "use server";

// import { signIn, signOut } from "./auth";
// import getSupabaseAdmin from "./supabase-admin-lazy";

// export async function signInAction() {
//   await signIn("google", { redirectTo: "/units" });
// }

// export async function signOutAction() {
//   await signOut({ redirectTo: "/" });
// }

// export async function registerUser({ email, password }) {
//   try {
//     console.log("=== SERVER-SIDE REGISTRATION STARTED ===");
//     console.log("Email:", email);

//     // Create user in Supabase Auth with email confirmation required
//     const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
//       // ✅ Fixed: Added parentheses
//       email: email,
//       password: password,
//       email_confirm: false, // This will require email confirmation
//       options: {
//         emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
//       },
//     });

//     console.log(
//       "User created with email_confirmed_at:",
//       data.user.email_confirmed_at
//     );
//     console.log("User email:", data.user.email);
//     console.log(
//       "Redirect URL:",
//       `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
//     );

//     if (error) {
//       console.error("Registration error:", error);
//       throw new Error(error.message);
//     }

//     console.log("Registration successful:", data.user.id);

//     // The confirmation email should be sent automatically by Supabase
//     // But let's also trigger it manually to be sure
//     const { data: linkData, error: linkError } =
//       await getSupabaseAdmin().auth.admin.generateLink({
//         // ✅ Fixed: Added parentheses
//         type: "signup",
//         email: email,
//         options: {
//           redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
//         },
//       });

//     if (linkError) {
//       console.error("Failed to generate confirmation link:", linkError);
//     } else {
//       console.log("Confirmation link generated successfully");
//     }

//     return {
//       success: true,
//       message:
//         "Registration successful! Please check your email to confirm your account.",
//       userId: data.user.id,
//     };
//   } catch (error) {
//     console.error("Registration error:", error);
//     return {
//       success: false,
//       error: error.message || "Registration failed",
//     };
//   }
// }

// export async function resetPassword({ email }) {
//   try {
//     const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(
//       email,
//       {
//         // ✅ Fixed: Added parentheses
//         redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
//       }
//     );

//     if (error) throw error;

//     return {
//       success: true,
//       message: "Password reset email sent! Check your inbox.",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message || "Failed to send reset email",
//     };
//   }
// }

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const email = requestUrl.searchParams.get("email");
  const next = requestUrl.searchParams.get("next") ?? "/login";

  console.log("=== AUTH CALLBACK DEBUG ===");
  console.log("Full URL:", requestUrl.href);
  console.log("Code present:", !!code);
  console.log("Email param:", email);

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=confirmation_failed`
        );
      }

      console.log("Session exchange successful:", !!data.session);
      console.log(
        "User data:",
        data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              email_confirmed_at: data.user.email_confirmed_at,
            }
          : "No user"
      );

      if (data.user) {
        console.log("Email confirmed for user:", data.user.email);
        // Use email from URL params or fallback to user email
        const userEmail = email || data.user.email;
        // Redirect to login with email pre-filled and success message
        return NextResponse.redirect(
          `${requestUrl.origin}/login?email=${encodeURIComponent(
            userEmail
          )}&confirmed=true`
        );
      }
    } catch (error) {
      console.error("Callback error:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=confirmation_failed`
      );
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   const requestUrl = new URL(request.url);
//   const code = requestUrl.searchParams.get("code");
//   const next = requestUrl.searchParams.get("next") ?? "/login";

//   console.log("=== AUTH CALLBACK DEBUG ===");
//   console.log("Full URL:", requestUrl.href);
//   console.log("Code present:", !!code);
//   console.log("Code value:", code);

//   if (code) {
//     const cookieStore = cookies();

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//       {
//         cookies: {
//           getAll() {
//             return cookieStore.getAll();
//           },
//           setAll(cookiesToSet) {
//             try {
//               cookiesToSet.forEach(({ name, value, options }) =>
//                 cookieStore.set(name, value, options)
//               );
//             } catch {
//               // The `setAll` method was called from a Server Component.
//               // This can be ignored if you have middleware refreshing
//               // user sessions.
//             }
//           },
//         },
//       }
//     );

//     try {
//       // Exchange the code for a session
//       const { data, error } = await supabase.auth.exchangeCodeForSession(code);

//       if (error) {
//         console.error("Error exchanging code for session:", error);
//         return NextResponse.redirect(
//           `${requestUrl.origin}/login?error=confirmation_failed`
//         );
//       }

//       console.log("Session exchange successful:", !!data.session);
//       console.log(
//         "User data:",
//         data.user
//           ? {
//               id: data.user.id,
//               email: data.user.email,
//               email_confirmed_at: data.user.email_confirmed_at,
//             }
//           : "No user"
//       );

//       if (data.user) {
//         console.log("Email confirmed for user:", data.user.email);
//         // Redirect to login with email pre-filled and a success message
//         return NextResponse.redirect(
//           `${requestUrl.origin}/login?email=${encodeURIComponent(
//             data.user.email
//           )}&confirmed=true`
//         );
//       }
//     } catch (error) {
//       console.error("Callback error:", error);
//       return NextResponse.redirect(
//         `${requestUrl.origin}/login?error=confirmation_failed`
//       );
//     }
//   }

//   // If no code, redirect to login
//   return NextResponse.redirect(`${requestUrl.origin}/login`);
// }

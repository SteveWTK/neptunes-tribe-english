import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        },
        remove(name) {
          response.cookies.set(name, "", { maxAge: -1 });
        },
      },
    }
  );

  await supabase.auth.getUser(); // ensures session refresh

  return response;
}

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse } from "next/server";

// export async function updateSession(request) {
//   let response = NextResponse.next();

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             response.cookies.set(name, value, options);
//           });
//         },
//       },
//     }
//   );

//   await supabase.auth.getUser().then(({ data, error }) => {
//     console.log("Middleware user:", data?.user || null);
//   }); // This refreshes the auth session cookie

//   return response;
// }

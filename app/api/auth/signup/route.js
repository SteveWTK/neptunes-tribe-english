import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      // Show custom UI message
      return { status: "error", message: "This email is already in use." };
    } else {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  return NextResponse.json({
    message: "User created. Please check your email to confirm.",
  });
}

// import { NextResponse } from "next/server";
// import { randomUUID } from "crypto";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function POST(req) {
//   const { email, password } = await req.json();

//   const { data, error } = await supabase.auth.signUp({ email, password });

//   if (error) {
//     if (error.message.includes("already registered")) {
//       // Show custom UI message
//       return { status: "error", message: "This email is already in use." };
//     } else {
//       return { status: "error", message: error.message };
//     }
//     // return NextResponse.json({ error: error.message }, { status: 400 });
//   }

//   // Also insert into public.users immediately
//   const newUser = {
//     id: randomUUID(), // optional: you could also use data.user?.id here
//     email,
//     name: null,
//     image: null,
//     role: "User",
//   };

//   const { error: insertError } = await supabase.from("users").insert(newUser);

//   if (insertError) {
//     console.error("Failed to insert into public.users:", insertError);
//   }

//   return NextResponse.json({
//     message: "User created. Please check your email to confirm.",
//   });
// }

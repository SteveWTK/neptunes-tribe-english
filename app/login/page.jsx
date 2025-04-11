"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback", // Must match Google config
      },
    });
    if (error) console.error("Login error:", error);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-4xl mb-4">Login to Neptune's Tribe</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}

// import { supabase } from "@/utils/supabase/client";

// export default function LoginPage() {
//   const handleLogin = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${window.location.origin}/dashboard`,
//       },
//     });
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-green-950 text-white">
//       <h1 className="text-4xl mb-4">Login to Neptune's Tribe</h1>
//       <button
//         onClick={handleLogin}
//         className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 transition"
//       >
//         Sign in with Google
//       </button>
//     </div>
//   );
// }

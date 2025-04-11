import { createClient } from "@/utils/supabase/server";

export default async function DebugPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("DEBUG PAGE user:", user);
  console.log("DEBUG PAGE error:", error);

  return (
    <div className="p-4 text-rose-900">
      <h1 className="text-xl font-bold">Debug Page</h1>
      <p>User: {user ? JSON.stringify(user, null, 2) : "No user found"}</p>
    </div>
  );
}

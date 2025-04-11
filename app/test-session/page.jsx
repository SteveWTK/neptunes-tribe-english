import { createClient } from "@/utils/supabase/server";

export default async function TestSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl">Session Test</h1>
      {user ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>No session found. Error: {error?.message}</p>
      )}
    </div>
  );
}

// lib/supabase/client.js
// Browser-safe Supabase client for use in client components
// This uses the anon key and respects Row Level Security (RLS)

import { createBrowserClient } from "@supabase/ssr";

let client = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}

// Default export for convenience
export default createClient();
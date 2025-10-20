// app/api/admin-actions.js

import { supabase } from "@/lib/data-service";

export async function approveDonation(donationId) {
  // Confirm the donation
  const { error: confirmError } = await supabase
    .from("manual_donations")
    .update({ confirmed: true })
    .eq("id", donationId);

  if (confirmError) return { success: false, error: confirmError };

  // Increment supporter count
  const { error: incrementError } = await supabase.rpc(
    "increment_supporters_count"
  );

  if (incrementError) return { success: false, error: incrementError };

  // TODO: Trigger email confirmation (we’ll add this later)
  return { success: true };
}

import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*"], // You can add more paths like "/profile/:path*", etc.
};

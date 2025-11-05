// middleware.js (create this in your root directory)
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define protected routes
  const protectedRoutes = [
    "/units",
    "/profile",
    "/dashboard",
    "/payment",
    "/lesson",
    "/admin",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Define auth routes (login, register, etc.)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/worlds", nextUrl));
  }

  // Redirect logged-in users from homepage to worlds page
  if (isLoggedIn && nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/worlds", nextUrl));
  }

  // Redirect non-logged-in users to login for protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

/*import { NextResponse } from "next/server";

export function middleware(request) {
  return NextResponse.redirect(new URL("/about", request.url));
}*/

// import { auth } from "@/lib/auth";

// export const middleware = auth;

// export const config = {
//   matcher: ["/dashboard"],
// };

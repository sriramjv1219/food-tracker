import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/constants";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Allow access to pending page for authenticated users
    if (pathname === "/access-pending") {
      return NextResponse.next();
    }

    // Check if user is approved
    if (token && !token.approved) {
      return NextResponse.redirect(new URL("/access-pending", req.url));
    }

    // Check SUPER_ADMIN access for approval page
    if (pathname.startsWith("/approval")) {
      if (token?.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/meals", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/signin (sign-in page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth/signin).*)",
  ],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { REDIRECT_BY_PATH } from "@/lib/sanity/queries";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Query for redirect matching the current pathname
  const redirect = await client.fetch(REDIRECT_BY_PATH, { pathname });

  if (redirect) {
    const url =
      redirect.type === "internal"
        ? new URL(redirect.to, request.url)
        : redirect.to;

    // Use appropriate status code based on permanent flag
    const status = redirect.permanent ? 308 : 307;

    return NextResponse.redirect(url, status);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

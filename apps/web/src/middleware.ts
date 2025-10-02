import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Query for redirect matching the current pathname
  const redirectQuery = `*[_type == "redirect" && from == $pathname][0]{
    from,
    to,
    type
  }`;

  const redirect = await client.fetch(redirectQuery, { pathname });

  if (redirect) {
    const url =
      redirect.type === "internal"
        ? new URL(redirect.to, request.url)
        : redirect.to;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

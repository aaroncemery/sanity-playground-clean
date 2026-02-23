import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

const REDIRECT_BY_PATH = `*[_type == "redirect" && from == $pathname][0]{ _id, from, to, type, permanent }`;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(REDIRECT_BY_PATH)}&$pathname=${encodeURIComponent(JSON.stringify(pathname))}`;

  const response = await fetch(url);
  const { result: redirect } = await response.json();

  if (redirect) {
    const destination =
      redirect.type === "internal"
        ? new URL(redirect.to, request.url)
        : redirect.to;

    const status = redirect.permanent ? 308 : 307;

    return NextResponse.redirect(destination, status);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

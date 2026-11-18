import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/reset-password",
  "/admin/accept-invite",
  "/admin/auth",
  "/admin/swjs",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");

    const isPublicAdminRoute = PUBLIC_ADMIN_PATHS.some((p) =>
      request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`)
    );

    if (!isPublicAdminRoute) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      const sb = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (list) => {
              list.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response = NextResponse.next({ request });
                response.cookies.set(name, value, options);
              });
            },
          },
        },
      );
      const { data } = await sb.auth.getUser();
      if (!data?.user) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

// ============================================================
// Auth Middleware — protects /chat, /history; redirects /login if authed
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If logged in and on /login, redirect to /chat
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If not logged in and on protected pages, redirect to /login
  if (!user && (pathname === "/chat" || pathname === "/history")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If not logged in and at root, redirect to /login
  if (!user && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and at root, redirect to /chat
  if (user && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/", "/login", "/chat", "/history"],
};

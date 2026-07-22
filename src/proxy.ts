import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
  return to;
}

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isApiAccount = path.startsWith("/api/account");
  const isApiChat =
    path.startsWith("/api/conversations") ||
    path.startsWith("/api/chat") ||
    path.startsWith("/api/messages") ||
    (path.startsWith("/api/users/") && path.endsWith("/block"));
  const isProtected =
    path.startsWith("/account") ||
    path === "/post-ad" ||
    path === "/messages" ||
    path === "/update-password";

  if (!user && (isApiAccount || isApiChat)) {
    return copyCookies(
      response,
      NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }),
    );
  }

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = path === "/update-password" ? "/forgot-password" : "/login";
    if (path === "/update-password") {
      loginUrl.searchParams.set("error", "session-missing");
    } else {
      loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);
    }
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  if (user && (path === "/login" || path === "/signup" || path === "/forgot-password")) {
    return copyCookies(response, NextResponse.redirect(new URL("/account", request.url)));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

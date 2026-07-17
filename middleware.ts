import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UNAUTHORIZED = () =>
  new NextResponse("الرجاء إدخال كلمة المرور لدخول الموقع", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });

export function middleware(req: NextRequest) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return UNAUTHORIZED();

  const basicAuth = req.headers.get("authorization");
  if (!basicAuth) return UNAUTHORIZED();

  const authValue = basicAuth.split(" ")[1];
  try {
    const [, pwd] = atob(authValue).split(":");
    if (pwd === ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  } catch {
    // Malformed/garbage Authorization header (e.g. a bot probing) — fall through to the 401 challenge below.
  }

  return UNAUTHORIZED();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default function proxy(req: any) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo\\.png|logos|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};

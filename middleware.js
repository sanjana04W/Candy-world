import { NextResponse } from "next/server";

export function middleware(request) {
  const isAdminDeployment = process.env.APP_MODE === "admin";
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");

  // Admin deployment: block everything except /admin/*
  if (isAdminDeployment && !isAdminPath) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Website deployment: block /admin/*
  if (!isAdminDeployment && isAdminPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
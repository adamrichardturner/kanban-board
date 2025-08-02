import { NextRequest, NextResponse } from 'next/server';
import { getPostLoginRoute } from './utils/routing';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication token
  const authCookie = request.cookies.get('token');
  const isAuthenticated = !!authCookie?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated users away from public routes
  if (isAuthenticated && isPublicRoute) {
    const postLoginRoute = await getPostLoginRoute();
    return NextResponse.redirect(new URL(postLoginRoute, request.url));
  }

  // Redirect authenticated users from root to their dashboard
  if (isAuthenticated && pathname === '/') {
    const postLoginRoute = await getPostLoginRoute();
    return NextResponse.redirect(new URL(postLoginRoute, request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)',
  ],
};

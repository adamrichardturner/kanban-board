import { NextRequest, NextResponse } from 'next/server';

// Simple function to validate auth token by calling /api/auth/me
async function validateAuthToken(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return false;

    // Call the auth API to validate the token
    const response = await fetch(new URL('/api/auth/me', request.url), {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

// Simple fallback route determination
function getDefaultPostLoginRoute(): string {
  return '/boards';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication token
  const authCookie = request.cookies.get('token');
  const hasToken = !!authCookie?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If there's a token, validate it
  let isAuthenticated = false;
  if (hasToken) {
    isAuthenticated = await validateAuthToken(request);

    // If token exists but is invalid, clear it and redirect to home
    if (!isAuthenticated) {
      console.log('Invalid token detected, clearing and redirecting to /');
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated users away from public routes to their dashboard
  if (isAuthenticated && isPublicRoute) {
    const postLoginRoute = getDefaultPostLoginRoute();
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

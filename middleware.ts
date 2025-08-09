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

async function getFirstBoardRoute(request: NextRequest): Promise<string> {
  try {
    const response = await fetch(new URL('/api/boards', request.url), {
      headers: {
        Cookie: request.headers.get('cookie') ?? '',
      },
    });
    if (!response.ok) {
      return getDefaultPostLoginRoute();
    }
    const payload = (await response.json()) as {
      data?: Array<{ id: string; position: number }>;
    };
    const boards = payload.data ?? [];
    if (boards.length === 0) {
      return getDefaultPostLoginRoute();
    }
    const sorted = [...boards].sort((a, b) => a.position - b.position);
    return `/boards/${sorted[0].id}`;
  } catch {
    return getDefaultPostLoginRoute();
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication token
  const authCookie = request.cookies.get('token');
  const hasToken = !!authCookie?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If there's a token, validate it (skip external validation in development to cut noise)
  let isAuthenticated = false;
  if (hasToken) {
    if (process.env.NODE_ENV === 'development') {
      isAuthenticated = true;
    } else {
      isAuthenticated = await validateAuthToken(request);
    }

    // If token exists but is invalid, clear it and redirect to home
    if (!isAuthenticated) {
      const response = isPublicRoute
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated users away from public routes to their first/default board
  if (isAuthenticated && isPublicRoute) {
    const postLoginRoute = await getFirstBoardRoute(request);
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

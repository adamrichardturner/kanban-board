// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isPublicPath = pathname === '/' || pathname.startsWith('/api/auth');

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/boards', req.url));
  }

  return NextResponse.next();
}

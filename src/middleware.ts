import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdzamy zarówno cookie jak i localStorage
  const session = request.cookies.get('firebase:authUser');
  
  console.log('Middleware executing:', {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    sessionData: session?.value,
    allCookies: request.cookies.getAll(),
  });

  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (session && (request.nextUrl.pathname === '/' || isPublicPath)) {
    return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
  }

  if (!session && !isPublicPath && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};
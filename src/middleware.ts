import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdzamy zarówno cookie jak i localStorage
  const session = request.cookies.get('firebase:authUser:AIzaSyDOBATcPbsGFsI_s80S8Gw6-p-Qi9_Y-D0:web');
  
  // Dodajemy debug logi
  console.log('Middleware checking auth:', {
    path: request.nextUrl.pathname,
    hasSession: !!session,
  });

  // Lista ścieżek publicznych
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Przekierowania
  if (!session && !isPublicPath) {
    console.log('Redirecting to login - no session');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isPublicPath) {
    console.log('Redirecting to dashboard - user has session');
    return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
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
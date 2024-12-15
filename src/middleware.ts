import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdzamy zarówno cookie jak i localStorage
  const session = request.cookies.get('firebase:authUser');
  
  console.log('Middleware checking auth:', {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    cookies: request.cookies.getAll(),
  });

  // Lista ścieżek publicznych
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony głównej
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
  }

  // Przekierowania tylko dla ścieżek chronionych
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
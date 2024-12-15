// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Dodajmy log aby zobaczyć jakie ścieżki są przetwarzane
  console.log('Middleware processing path:', request.nextUrl.pathname);
  
  const session = request.cookies.get('firebase:authUser');
  
  // Lista ścieżek publicznych
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session && !isPublicPath) {
    console.log('Redirecting to login - no session');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania
  if (session && isPublicPath && request.nextUrl.pathname !== '/') {
    console.log('Redirecting to dashboard - user already logged in');
    const dashboardUrl = new URL('/dashboard/waiter', request.url);
    return NextResponse.redirect(dashboardUrl);
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
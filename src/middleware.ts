// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('firebase:authUser');
  
  // Lista ścieżek publicznych
  const publicPaths = ['/login', '/register'];  // Usuwamy '/' z publicznych ścieżek
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do strony głównej lub chronionej
  if (!session && request.nextUrl.pathname !== '/login') {
    console.log('Redirecting to login - no session');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania
  if (session && isPublicPath) {
    console.log('Redirecting to dashboard - user already logged in');
    const dashboardUrl = new URL('/dashboard/waiter', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',  // Dodajemy główną ścieżkę do matchera
    '/login',
    '/register',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdź wszystkie możliwe nazwy cookie sesji Firebase
  const allCookies = request.cookies.getAll();
  const firebaseCookie = allCookies.find(cookie => 
    cookie.name.startsWith('firebase:authUser:')
  );
  
  console.log('Middleware executing:', {
    path: request.nextUrl.pathname,
    hasSession: !!firebaseCookie,
    cookieName: firebaseCookie?.name,
    allCookies: allCookies.map(c => c.name)
  });

  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Jeśli jest sesja i jesteśmy na stronie publicznej
  if (firebaseCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
  }

  // Jeśli nie ma sesji i próbujemy dostać się do chronionych ścieżek
  if (!firebaseCookie && !isPublicPath && request.nextUrl.pathname !== '/') {
    console.log('Redirecting to login due to no session');
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
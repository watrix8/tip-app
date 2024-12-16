import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdź ciasteczko sesji Firebase
  const allCookies = request.cookies.getAll();
  const firebaseCookie = allCookies.find(cookie => 
    cookie.name.startsWith('firebase:authUser:')
  );
  
  const path = request.nextUrl.pathname;
  console.log('Middleware check:', {
    path,
    hasSession: !!firebaseCookie,
    cookieName: firebaseCookie?.name
  });

  // Definiujemy ścieżki publiczne i chronione
  const publicPaths = ['/login', '/register', '/'];
  const protectedPaths = ['/dashboard', '/settings'];
  
  const isPublicPath = publicPaths.includes(path);
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do ścieżki publicznej
  if (firebaseCookie && isPublicPath) {
    console.log('Logged in user accessing public path - redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej ścieżki
  if (!firebaseCookie && isProtectedPath) {
    console.log('Unauthenticated user accessing protected path - redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('Request proceeding normally');
  return NextResponse.next();
}

// Konfiguracja matchera
export const config = {
  matcher: [
    /*
     * Match wszystkich ścieżek z wyjątkiem:
     * - api (API routes)
     * - _next/static (pliki statyczne)
     * - _next/image (pliki optymalizacji obrazów)
     * - favicon.ico (favicon)
     * - plików w katalogu public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
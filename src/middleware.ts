import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdź ciasteczko sesji Firebase
  const allCookies = request.cookies.getAll();
  const firebaseCookie = allCookies.find(cookie => 
    cookie.name.startsWith('firebase:authUser:')
  );
  
  const path = request.nextUrl.pathname;
  console.log('Middleware path check:', {
    path,
    hasSession: !!firebaseCookie,
    cookieName: firebaseCookie?.name
  });

  // Definiujemy ścieżki publiczne i chronione
  const publicPaths = ['/', '/login', '/register'];
  const protectedPaths = ['/dashboard', '/settings'];
  
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p));
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do publicznej ścieżki logowania/rejestracji
  if (firebaseCookie && (path === '/login' || path === '/register')) {
    console.log('Logged in user trying to access auth path - redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej ścieżki
  if (!firebaseCookie && isProtectedPath) {
    console.log('Unauthenticated user trying to access protected path - redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('Allowing request to proceed');
  return NextResponse.next();
}

// Zaktualizuj konfigurację matchera
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
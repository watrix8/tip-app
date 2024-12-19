import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies);
  
  const firebaseCookie = allCookies.find(cookie => 
    cookie.name.startsWith('firebase:authUser:')
  );

    // Sprawdzamy czy cookie jest ważne
    if (firebaseCookie) {
      try {
        const cookieData = JSON.parse(firebaseCookie.value);
        // Sprawdzamy czy token nie wygasł
        if (cookieData.stsTokenManager?.expirationTime < Date.now()) {
          // Token wygasł - usuwamy cookie
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } catch (error) {
        console.error('Cookie parsing error:', error);
        // Błąd parsowania - przekierowujemy do logowania
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  
  const path = request.nextUrl.pathname;
  console.log('Middleware detailed check:', {
    path,
    hasSession: !!firebaseCookie,
    cookieName: firebaseCookie?.name,
    cookieValue: firebaseCookie?.value ? 'exists' : 'missing',
    allCookieNames: allCookies.map(c => c.name)
  });

  const publicPaths = ['/login', '/register'];
  const protectedPaths = ['/dashboard', '/settings'];
  
  const isPublicPath = publicPaths.includes(path);
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  if (firebaseCookie) {
    // Jeśli użytkownik jest zalogowany
    if (isPublicPath) {
      console.log('Logged in user accessing public path - redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
    }
  } else {
    // Jeśli użytkownik nie jest zalogowany
    if (isProtectedPath) {
      console.log('Unauthenticated user accessing protected path - redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
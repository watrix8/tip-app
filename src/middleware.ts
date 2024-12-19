import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const firebaseCookie = allCookies.find(cookie => 
    cookie.name.startsWith('firebase:authUser:')
  );

  const path = request.nextUrl.pathname;
  
  const authPaths = ['/login', '/register'];
  const protectedPaths = ['/dashboard', '/settings'];
  
  const isAuthPath = authPaths.includes(path);
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));
  
  // Dodajemy tylko ten fragment do sprawdzania ścieżek onboardingu
  if (path.startsWith('/dashboard/onboarding/')) {
    return NextResponse.next();
  }

  let isValidSession = false;
  if (firebaseCookie) {
    try {
      const cookieData = JSON.parse(firebaseCookie.value);
      const expirationTime = cookieData.stsTokenManager?.expirationTime;
      
      const bufferTime = 5 * 60 * 1000;
      isValidSession = expirationTime && (expirationTime - bufferTime) > Date.now();
      
      if (!isValidSession) {
        console.log('Session expired or expiring soon');
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete(firebaseCookie.name);
        return response;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      isValidSession = false;
    }
  }

  if (isValidSession) {
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/dashboard/waiter', request.url));
    }
  } else {
    if (isProtectedPath) {
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
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Sprawdź czy użytkownik jest zalogowany (np. przez sprawdzenie cookie sesji)
  const session = request.cookies.get('firebase:authUser');
  
  // Lista ścieżek publicznych
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania
  if (session && isPublicPath && request.nextUrl.pathname !== '/') {
    const homeUrl = new URL('/waiter-panel', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/settings/:path*',
    '/waiter-panel/:path*',
    '/login',
    '/register',
  ],
}
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Skip auth for static files, Next.js internals, login page and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname === '/login' ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Vérifier le cookie d'authentification
  const authToken = request.cookies.get('auth-token');
  
  if (!authToken) {
    // Pas de cookie, rediriger vers login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Vérifier la validité du token
  try {
    const credentials = authToken.value;
    const [user, pwd] = Buffer.from(credentials, 'base64').toString().split(':');

    const validUser = process.env.ADMIN_USER || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'Globe-Admin-2024!';

    if (user !== validUser || pwd !== validPassword) {
      // Credentials invalides, rediriger vers login
      const response = NextResponse.redirect(new URL('/login?error=invalid-credentials', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  } catch (error) {
    // Erreur de décodage, rediriger vers login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
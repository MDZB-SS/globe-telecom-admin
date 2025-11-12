import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Skip auth for static files, Next.js internals, login page and API routes
  // Exclure tous les fichiers statiques Next.js et les assets
  if (
    pathname.startsWith('/_next/') ||           // Tous les fichiers Next.js internes
    pathname.startsWith('/api/') ||             // Routes API
    pathname.startsWith('/favicon.ico') ||      // Favicon
    pathname.startsWith('/public/') ||          // Fichiers publics
    pathname === '/login' ||                    // Page de login
    pathname.includes('.') ||                    // Fichiers avec extension (images, etc.)
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/i) // Assets statiques
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (all Next.js internal files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - files with extensions (images, fonts, etc.)
     */
    '/((?!api|_next|favicon.ico|public|.*\\..*).*)',
  ],
};
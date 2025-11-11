import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Vérifier les credentials
    const validUser = process.env.ADMIN_USER || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'Globe-Admin-2024!';
    
    if (username === validUser && password === validPassword) {
      // Créer les credentials encodés
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      
      // Créer une réponse avec un cookie sécurisé
      const response = NextResponse.json({
        success: true,
        user: { username },
        credentials
      });
      
      // Définir un cookie httpOnly pour la session
      response.cookies.set('auth-token', credentials, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion' },
      { status: 500 }
    );
  }
}


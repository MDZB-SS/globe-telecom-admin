'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus } from '@/hooks/useAuth';

interface ClientAuthGuardProps {
  readonly children: React.ReactNode;
}

export default function ClientAuthGuard({ children }: ClientAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = checkAuthStatus();
      setIsAuthenticated(authStatus);
      
      if (!authStatus) {
        // Rediriger vers login seulement si on n'est pas déjà sur la page de login
        if (globalThis.location.pathname !== '/login') {
          globalThis.location.href = '/login';
        }
      }
    };

    checkAuth();
  }, []);

  // Afficher un loader pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  // Si authentifié, afficher le contenu
  return <>{children}</>;
}

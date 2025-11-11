'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    // Nettoyer complètement la session
    sessionStorage.clear();
    localStorage.clear();
    
    // Supprimer le cookie d'authentification
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'same-origin', // Inclure les cookies dans la requête
    })
      .finally(() => {
        // Rediriger vers la page de connexion
        globalThis.location.href = '/login';
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-globe-navy">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-globe-red border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-lg">Déconnexion en cours...</p>
      </div>
    </div>
  );
}


'use client';

import { LogOut } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // Clear any stored credentials
      sessionStorage.removeItem('auth');
      sessionStorage.removeItem('user');
      
      // Supprimer le cookie d'authentification
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'same-origin', // Inclure les cookies dans la requête
      });
      
      // Redirect to login page with smooth transition
      globalThis.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la redirection même en cas d'erreur
      globalThis.location.href = '/login';
    }
  };

  return (
    <AnimatedButton
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-gray-600 hover:text-red-700 hover:border-red-300 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline">Déconnexion</span>
    </AnimatedButton>
  );
}

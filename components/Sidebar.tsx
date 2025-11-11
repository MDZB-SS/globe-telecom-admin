'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { 
  BarChart3, MessageSquare, Settings, Menu, X, 
  FileText, LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import GlobeLogo from './GlobeLogo';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Statistiques et analyses'
  },
  {
    name: 'Messages',
    href: '/',
    icon: MessageSquare,
    description: 'Gestion des messages'
  },
  {
    name: 'Rapports',
    href: '/reports',
    icon: FileText,
    description: 'Exports et rapports'
  },
  {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings,
    description: 'Configuration'
  }
];

interface SidebarProps {
  readonly children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Nettoyer le sessionStorage
      sessionStorage.clear();
      
      // Supprimer le cookie d'authentification côté serveur
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'same-origin', // Inclure les cookies dans la requête
      });
      
      // Rediriger vers la page de connexion
      globalThis.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la redirection même en cas d'erreur
      globalThis.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen bg-globe-light">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button 
          type="button"
          className="fixed inset-0 z-40 lg:hidden bg-globe-dark/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <span className="sr-only">Fermer le menu</span>
        </button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-globe-navy to-[#0d2540] shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* En-tête avec VRAI LOGO */}
        <div className="flex items-center justify-between h-20 px-6 bg-globe-dark/30 border-b border-white/10">
          <div className="flex items-center gap-3">
            <GlobeLogo size="md" variant="icon" />
            <div>
              <h1 className="text-xl font-bold text-white">Globe Telecom</h1>
              <p className="text-xs text-white/60">Administration</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/10 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-globe-red to-[#a02f2f] text-white shadow-lg shadow-globe-red/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-white/80" : "text-white/50"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-globe-dark/30">
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-globe-red text-white border-0 transition-all rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-white/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Système opérationnel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm rounded-b-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-globe-navy rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <GlobeLogo size="sm" variant="icon" />
            <span className="font-semibold text-globe-navy">Globe Telecom</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-globe-red hover:bg-globe-red/10 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenu des pages */}
        <main className="flex-1 overflow-auto bg-globe-light">
          {children}
        </main>
      </div>
    </div>
  );
}

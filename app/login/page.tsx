'use client';

import { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import GlobeLogo from '@/components/GlobeLogo';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Vérifier si déjà connecté
    const isAuthenticated = sessionStorage.getItem('auth');
    if (isAuthenticated) {
      globalThis.location.href = '/';
      return;
    }
    
    setUsername('admin');
    setPassword('Globe-Admin-2024!');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Éviter les doubles soumissions
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('auth', data.credentials);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirection immédiate
        globalThis.location.href = '/';
      } else {
        setError(data.error || 'Identifiants incorrects');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-globe-navy">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-globe-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-globe-navy via-[#0d2540] to-globe-navy relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-globe-red opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-globe-red opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Carte de connexion */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête avec VRAI LOGO */}
          <div className="bg-gradient-to-r from-globe-red to-[#a02f2f] p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <GlobeLogo size="lg" variant="full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Globe Telecom</h1>
            <p className="text-white/80 text-sm">Interface d&apos;Administration</p>
          </div>

          {/* Formulaire */}
          <div className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champ Nom d'utilisateur */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-globe-navy mb-2">
                  Nom d&apos;utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-globe-navy/50 group-focus-within:text-globe-red transition-colors" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-globe-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-globe-red focus:border-globe-red transition-all shadow-md hover:border-globe-red/50"
                    placeholder="admin"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-globe-navy mb-2">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-globe-navy/50 group-focus-within:text-globe-red transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-globe-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-globe-red focus:border-globe-red transition-all shadow-md hover:border-globe-red/50"
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-globe-navy/50 hover:text-globe-red transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-globe-red rounded-xl animate-shake">
                  <p className="text-sm text-globe-red font-medium text-center flex items-center justify-center gap-2">
                    <span className="text-lg">⚠️</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full py-4 px-4 bg-gradient-to-r from-globe-red to-[#a02f2f] hover:from-[#c73f3f] hover:to-[#b93737] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Se connecter</span>
                    <span className="text-xl">→</span>
                  </span>
                )}
              </button>
            </form>

            {/* Note de sécurité */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
                <span className="text-green-500">🔒</span>
                <span className="font-medium">Connexion sécurisée - Vos données sont protégées</span>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            © 2025 Globe Telecom. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

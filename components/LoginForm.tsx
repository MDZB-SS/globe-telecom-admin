'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';

function LoginFormContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // Charger les identifiants depuis les variables d'environnement ou localStorage
    const savedUsername = globalThis.localStorage?.getItem('remembered_username') || '';
    const savedPassword = globalThis.localStorage?.getItem('remembered_password') || '';
    
    if (savedUsername) setUsername(savedUsername);
    if (savedPassword) setPassword(savedPassword);
    
    const urlError = searchParams.get('error');
    if (urlError === 'invalid-credentials') {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Utiliser la nouvelle route API d'authentification
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker les credentials pour les requêtes suivantes
        sessionStorage.setItem('auth', data.credentials);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Gérer l'option "Se souvenir de moi"
        if (rememberMe) {
          globalThis.localStorage?.setItem('remembered_username', username);
          globalThis.localStorage?.setItem('remembered_password', password);
        } else {
          globalThis.localStorage?.removeItem('remembered_username');
          globalThis.localStorage?.removeItem('remembered_password');
        }
        
        // Rediriger vers la page principale
        globalThis.location.href = '/';
      } else {
        setError(data.error || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Erreur de réseau. Vérifiez votre connexion internet.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pt-4 pb-2 text-sm pl-10"
            placeholder="Nom d'utilisateur"
            disabled
          />
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="password"
            className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pt-4 pb-2 text-sm pl-10 pr-12"
            placeholder="Mot de passe"
            disabled
          />
        </div>
        <button
          type="submit"
          className="w-full h-12 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50"
          disabled
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <FloatingLabelInput
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="pl-10"
          label="Nom d'utilisateur"
          required
        />
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
        <FloatingLabelInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10 pr-12"
          label="Mot de passe"
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-gray-100 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
          />
          <span className="text-sm text-gray-600">Se souvenir de moi</span>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <AnimatedButton
        type="submit"
        disabled={!username || !password}
        loading={isLoading}
        variant="gradient"
        className="w-full h-12 font-medium"
      >
        Se connecter
      </AnimatedButton>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pt-4 pb-2 text-sm pl-10"
            placeholder="Nom d'utilisateur"
            disabled
          />
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="password"
            className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pt-4 pb-2 text-sm pl-10 pr-12"
            placeholder="Mot de passe"
            disabled
          />
        </div>
        <button
          type="submit"
          className="w-full h-12 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50"
          disabled
        >
          Se connecter
        </button>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
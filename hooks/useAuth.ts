'use client';

import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { username: string } | null;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const credentials = sessionStorage.getItem('auth');
        
        if (!credentials) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
          return;
        }

        // Vérifier si les credentials sont encore valides
        const response = await fetch('/', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
          },
        });

        if (response.ok) {
          const userData = sessionStorage.getItem('user');
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: userData ? JSON.parse(userData) : null,
          });
        } else {
          // Credentials invalides, nettoyer le storage
          sessionStorage.removeItem('auth');
          sessionStorage.removeItem('user');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } catch (error) {
        console.error('Erreur de vérification auth:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
}

// Hook pour faire des requêtes authentifiées
export function useAuthenticatedFetch() {
  const makeRequest = async (url: string, options: RequestInit = {}) => {
    const credentials = sessionStorage.getItem('auth');
    
    if (!credentials) {
      // Rediriger vers login si pas de credentials
      globalThis.location.href = '/login';
      throw new Error('Non authentifié');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Session expirée, nettoyer et rediriger
      sessionStorage.removeItem('auth');
      sessionStorage.removeItem('user');
      globalThis.location.href = '/login';
      throw new Error('Session expirée');
    }

    return response;
  };

  return { makeRequest };
}

// Fonction utilitaire pour vérifier l'authentification côté client
export function checkAuthStatus(): boolean {
  if (globalThis.window === undefined) return false;
  
  const credentials = sessionStorage.getItem('auth');
  return !!credentials;
}

// Fonction pour nettoyer l'authentification
export function clearAuth() {
  if (globalThis.window === undefined) return;
  
  sessionStorage.removeItem('auth');
  sessionStorage.removeItem('user');
  globalThis.location.href = '/login';
}

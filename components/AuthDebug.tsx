'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthDebug() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const checkSession = () => {
      const auth = sessionStorage.getItem('auth');
      const userData = sessionStorage.getItem('user');
      
      setDebugInfo(`
        Auth State: ${JSON.stringify({ isAuthenticated, isLoading, user }, null, 2)}
        Session Storage Auth: ${auth ? 'Present' : 'Missing'}
        Session Storage User: ${userData || 'Missing'}
        Current URL: ${globalThis.location.href}
      `);
    };

    checkSession();
    const interval = setInterval(checkSession, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, user]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🐛 Debug Auth</h3>
      <pre className="whitespace-pre-wrap">{debugInfo}</pre>
    </div>
  );
}


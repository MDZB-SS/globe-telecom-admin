'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface AutoRefreshIndicatorProps {
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  interval: number; // en secondes
}

export default function AutoRefreshIndicator({ 
  isRefreshing, 
  autoRefreshEnabled, 
  interval 
}: AutoRefreshIndicatorProps) {
  const [countdown, setCountdown] = useState(interval);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      setCountdown(interval);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return interval; // Reset
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, interval]);

  useEffect(() => {
    if (isRefreshing) {
      setCountdown(interval);
    }
  }, [isRefreshing, interval]);

  if (!autoRefreshEnabled) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <RefreshCw className="h-3 w-3" />
        <span>Auto-refresh désactivé</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
      <span>
        {isRefreshing ? (
          <span className="text-blue-500 font-medium">Actualisation...</span>
        ) : (
          <span>Prochaine mise à jour dans {countdown}s</span>
        )}
      </span>
    </div>
  );
}

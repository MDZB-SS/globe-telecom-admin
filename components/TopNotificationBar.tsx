'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Badge } from './ui/badge';

export default function TopNotificationBar() {
  const { unreadCount } = useNotifications();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Éviter les problèmes d'hydratation
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer group">
        <Bell className={`h-6 w-6 transition-colors duration-200 ${
          unreadCount > 0 
            ? 'text-red-600 animate-pulse' 
            : 'text-gray-600 group-hover:text-red-500'
        }`} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white border-2 border-white animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

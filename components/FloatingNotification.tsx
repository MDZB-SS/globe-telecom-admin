'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  Loader2,
  X,
  CheckCheck,
  Trash2
} from 'lucide-react';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'loading':
      return <Loader2 className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const formatTime = (date: Date) => {
  // Éviter l'hydratation différentielle en utilisant une approche plus stable
  if (typeof window === 'undefined') {
    return 'À l\'instant';
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}m`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  
  // Formatage stable pour éviter les problèmes d'hydratation
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export default function FloatingNotification() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications, 
    removeNotification 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Effet pour monter le composant côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effet pour détecter les nouvelles notifications
  useEffect(() => {
    if (isMounted && unreadCount > 0) {
      setHasNewNotifications(true);
      // Animation temporaire pour attirer l'attention
      const timer = setTimeout(() => {
        setHasNewNotifications(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, isMounted]);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  // Ne pas rendre le composant tant qu'il n'est pas monté côté client
  if (!isMounted) {
    return null;
  }

    return (
      <div className="fixed top-20 right-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={`relative shadow-lg transition-all duration-300 rounded-full h-12 w-12 p-0 ${
              unreadCount > 0 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 notification-pulse' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } ${hasNewNotifications ? 'notification-shake' : ''}`}
          >
            <Bell className={`h-6 w-6 text-white transition-transform duration-200 ${
              unreadCount > 0 ? 'notification-wiggle' : ''
            }`} />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-yellow-400 text-gray-900 border-2 border-white shadow-md animate-pulse"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-80 max-h-96 p-0 shadow-xl border-0 bg-white/95 backdrop-blur-md"
          sideOffset={8}
        >
          {/* En-tête avec gradient */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-white hover:bg-white/20 p-1 h-auto"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tout lire
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="text-xs text-white hover:bg-white/20 p-1 h-auto"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Vider
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-white/80 mt-1">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Liste des notifications */}
          <ScrollArea className="max-h-64">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Aucune notification</p>
                <p className="text-xs text-gray-400 mt-1">
                  Vous êtes à jour ! 🎉
                </p>
              </div>
            ) : (
              <div className="p-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg m-1 cursor-pointer transition-all duration-200 ${
                      notification.read 
                        ? 'bg-gray-50 hover:bg-gray-100' 
                        : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500 shadow-sm'
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.description && (
                              <p className={`text-xs mt-1 ${
                                notification.read ? 'text-gray-500' : 'text-gray-600'
                              }`}>
                                {notification.description}
                              </p>
                            )}
                            {notification.action && (
                              <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-100 px-2 py-1 rounded-full inline-block">
                                {notification.action}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 hover:bg-red-100 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

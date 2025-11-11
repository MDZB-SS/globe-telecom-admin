'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

// Fonction pour générer un ID stable côté client
let idCounter = 0;
const generateStableId = () => {
  if (globalThis.window === undefined) {
    return `temp-id-${idCounter++}`;
  }
  return `notification-${Date.now()}-${idCounter++}`;
};

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  timestamp: Date;
  read: boolean;
  action?: string; // Action qui a déclenché la notification
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Fonction helper pour vérifier si une notification est un doublon
const isDuplicateNotification = (
  notifications: Notification[], 
  title: string, 
  description: string | undefined, 
  type: string
): boolean => {
  return notifications.some(existing => 
    existing.title === title && 
    existing.description === description &&
    existing.type === type &&
    Date.now() - new Date(existing.timestamp).getTime() < 5000
  );
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Écouter les événements de notification
  useEffect(() => {
    const handleAddNotification = (event: CustomEvent) => {
      const { title, description, type, action } = event.detail;
      const notification: Notification = {
        title,
        description,
        type,
        action,
        id: generateStableId(),
        timestamp: new Date(),
        read: false,
      };
      
      setNotifications(prev => {
        if (isDuplicateNotification(prev, title, description, type)) {
          return prev;
        }
        return [notification, ...prev];
      });
    };

    globalThis.addEventListener('addNotification', handleAddNotification as EventListener);
    
    return () => {
      globalThis.removeEventListener('addNotification', handleAddNotification as EventListener);
    };
  }, []);

  const addNotification = (newNotification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...newNotification,
      id: generateStableId(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      if (isDuplicateNotification(prev, newNotification.title, newNotification.description, newNotification.type)) {
        return prev;
      }
      return [notification, ...prev];
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      removeNotification,
    }),
    [notifications, unreadCount]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

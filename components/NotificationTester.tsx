'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toastSuccess, toastError, toastInfo, toastWarning, toastLoading } from '../lib/toast';
import { Bell, TestTube } from 'lucide-react';

export default function NotificationTester() {
  const testNotifications = () => {
    // Test 1: Succès simple
    toastSuccess({
      title: 'Export terminé !',
      description: '250 messages exportés avec succès',
      action: 'Export CSV'
    });

    // Test 2: Erreur avec action
    setTimeout(() => {
      toastError({
        title: 'Connexion échouée',
        description: 'Impossible de se connecter à la base de données',
        action: 'Connexion DB'
      });
    }, 1000);

    // Test 3: Information
    setTimeout(() => {
      toastInfo({
        title: 'Nouvelle fonctionnalité',
        description: 'Le système de notifications est maintenant actif !',
        action: 'Mise à jour système'
      });
    }, 2000);

    // Test 4: Avertissement
    setTimeout(() => {
      toastWarning({
        title: 'Attention requise',
        description: 'Le disque de stockage est presque plein (85%)',
        action: 'Surveillance système'
      });
    }, 3000);

    // Test 5: Chargement puis succès
    setTimeout(() => {
      const loadingId = toastLoading({
        title: 'Sauvegarde en cours...',
        description: 'Veuillez patienter pendant la sauvegarde',
        id: 'save-operation',
        action: 'Sauvegarde'
      });

      // Remplacer par un succès après 2 secondes
      setTimeout(() => {
        toastSuccess({
          title: 'Sauvegarde terminée !',
          description: 'Tous les paramètres ont été sauvegardés',
          id: 'save-operation',
          action: 'Sauvegarde'
        });
      }, 2000);
    }, 4000);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <TestTube className="h-5 w-5 text-purple-600" />
          Test Notifications
        </CardTitle>
        <CardDescription>
          Testez le système complet de notifications avec historique
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={testNotifications}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Bell className="h-4 w-4 mr-2" />
          Lancer une série de tests
        </Button>
        
        <p className="text-xs text-gray-500 mt-3">
          Cliquez sur l&apos;icône 🔔 en haut pour voir l&apos;historique
        </p>
      </CardContent>
    </Card>
  );
}

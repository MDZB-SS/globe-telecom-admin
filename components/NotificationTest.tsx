'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toastSuccess, toastError, toastInfo, toastWarning, toastLoading } from '../lib/toast';
import { Bell } from 'lucide-react';

export default function NotificationTest() {
  const testSuccess = () => {
    toastSuccess({
      title: 'Opération réussie !',
      description: 'Les données ont été sauvegardées avec succès.',
    });
  };

  const testError = () => {
    toastError({
      title: 'Erreur détectée',
      description: 'Impossible de traiter la demande. Veuillez réessayer.',
    });
  };

  const testInfo = () => {
    toastInfo({
      title: 'Information importante',
      description: 'Nouvelle fonctionnalité disponible dans les paramètres.',
    });
  };

  const testWarning = () => {
    toastWarning({
      title: 'Attention requise',
      description: 'Vérifiez vos paramètres avant de continuer.',
    });
  };

  const testLoading = () => {
    const id = toastLoading({
      title: 'Traitement en cours...',
      description: 'Veuillez patienter pendant le traitement.',
      id: 'test-loading'
    });

    // Simulation: remplacer par succès après 3 secondes
    setTimeout(() => {
      toastSuccess({
        title: 'Traitement terminé !',
        description: 'L\'opération a été complétée avec succès.',
        id: 'test-loading'
      });
    }, 3000);
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test des notifications
        </CardTitle>
        <CardDescription>
          Testez les différents types de notifications avec icônes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={testSuccess} className="w-full bg-green-600 hover:bg-green-700">
          ✅ Test Succès
        </Button>
        
        <Button onClick={testError} className="w-full bg-red-600 hover:bg-red-700">
          ❌ Test Erreur
        </Button>
        
        <Button onClick={testInfo} className="w-full bg-blue-600 hover:bg-blue-700">
          ℹ️ Test Information
        </Button>
        
        <Button onClick={testWarning} className="w-full bg-orange-600 hover:bg-orange-700">
          ⚠️ Test Avertissement
        </Button>
        
        <Button onClick={testLoading} className="w-full bg-purple-600 hover:bg-purple-700">
          🔄 Test Chargement
        </Button>
      </CardContent>
    </Card>
  );
}

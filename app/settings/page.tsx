'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  Settings, Shield, Database, Bell, Mail, 
  Eye, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { toastSuccess, toastError, toastInfo, toastLoading } from '../../lib/toast';
import NotificationTest from '../../components/NotificationTest';
import NotificationTester from '../../components/NotificationTester';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Sécurité
    autoLogout: 30,
    maxLoginAttempts: 5,
    requireStrongPassword: true,
    
    // Notifications
    emailNotifications: true,
    newMessageAlert: true,
    dailyReport: false,
    weeklyReport: true,
    
    // Base de données
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 365,
    
    // Interface
    theme: 'light',
    itemsPerPage: 10,
    dateFormat: 'dd/MM/yyyy',
    timezone: 'Europe/Paris',
    
    // Exports
    defaultExportFormat: 'csv',
    includeIpAddresses: true,
    anonymizeData: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.globetelecom.com',
    smtpPort: 587,
    username: 'admin@globetelecom.com',
    password: '',
    fromEmail: 'noreply@globetelecom.com',
    fromName: 'GlobeTelecom Admin',
  });

  const handleSave = async (section: string) => {
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toastSuccess({
        title: 'Paramètres sauvegardés',
        description: `Section "${section}" mise à jour avec succès`,
      });
    } catch (error) {
      console.error('Settings save error:', error);
      toastError({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les paramètres',
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      toastLoading({
        title: 'Test de connexion...',
        description: 'Vérification de la base de données',
        id: 'db-test'
      });
      
      const response = await fetch('/api/stats');
      if (response.ok) {
        toastSuccess({
          title: 'Connexion réussie',
          description: 'La base de données PostgreSQL répond correctement',
          id: 'db-test'
        });
      } else {
        throw new Error('Erreur de connexion');
      }
    } catch (error) {
      console.error('Database connection error:', error);
      toastError({
        title: 'Connexion échouée',
        description: 'Impossible de se connecter à la base de données',
        id: 'db-test'
      });
    }
  };

  const sendTestEmail = async () => {
    toastInfo({
      title: 'Test email',
      description: 'Fonctionnalité disponible prochainement',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Paramètres
            </h1>
            <p className="text-gray-600 mt-1">
              Configuration et administration de l&apos;application GlobeTelecom Admin.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sécurité */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Sécurité & Authentification
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et de connexion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Déconnexion automatique (minutes)</Label>
                <Input
                  type="number"
                  value={settings.autoLogout}
                  onChange={(e) => setSettings({...settings, autoLogout: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tentatives de connexion max</Label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mot de passe fort requis</Label>
                <p className="text-sm text-gray-500">
                  Exiger au moins 8 caractères avec majuscules, chiffres et symboles
                </p>
              </div>
              <Switch
                checked={settings.requireStrongPassword}
                onCheckedChange={(checked) => setSettings({...settings, requireStrongPassword: checked})}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave('Sécurité')}>
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configuration des alertes et notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications email</Label>
                  <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alerte nouveau message</Label>
                  <p className="text-sm text-gray-500">Notification immédiate à chaque nouveau message</p>
                </div>
                <Switch
                  checked={settings.newMessageAlert}
                  onCheckedChange={(checked) => setSettings({...settings, newMessageAlert: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport quotidien</Label>
                  <p className="text-sm text-gray-500">Synthèse quotidienne de l&apos;activité</p>
                </div>
                <Switch
                  checked={settings.dailyReport}
                  onCheckedChange={(checked) => setSettings({...settings, dailyReport: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport hebdomadaire</Label>
                  <p className="text-sm text-gray-500">Résumé hebdomadaire avec statistiques</p>
                </div>
                <Switch
                  checked={settings.weeklyReport}
                  onCheckedChange={(checked) => setSettings({...settings, weeklyReport: checked})}
                />
              </div>
            </div>

            <Separator />

            {/* Configuration email */}
            <div className="space-y-4">
              <h4 className="font-medium">Configuration Email (SMTP)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serveur SMTP</Label>
                  <Input
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)})}
                  />
                </div>
                
              <div className="space-y-2">
                <Label>Nom d&apos;utilisateur</Label>
                <Input
                  value={emailSettings.username}
                  onChange={(e) => setEmailSettings({...emailSettings, username: e.target.value})}
                />
                </div>
                
                <div className="space-y-2">
                  <Label>Email expéditeur</Label>
                  <Input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={sendTestEmail} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Tester l&apos;email
                </Button>
                <Button onClick={() => handleSave('Notifications')}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Base de données */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Base de données
            </CardTitle>
            <CardDescription>
              Configuration et maintenance de PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Connexion active</div>
                  <div className="text-sm text-green-700">PostgreSQL - globe_telecom</div>
                </div>
              </div>
              <Button onClick={testDatabaseConnection} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tester
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-500">Sauvegarde régulière des données</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label>Fréquence de sauvegarde</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({...settings, backupFrequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rétention des données (jours)</Label>
              <Input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => setSettings({...settings, retentionDays: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500">
                Les messages plus anciens que cette durée pourront être archivés
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave('Base de données')}>
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interface utilisateur */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Interface utilisateur
            </CardTitle>
            <CardDescription>
              Personnalisation de l&apos;affichage et de l&apos;expérience utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Éléments par page</Label>
                <Select value={settings.itemsPerPage.toString()} onValueChange={(value) => setSettings({...settings, itemsPerPage: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format de date</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave('Interface utilisateur')}>
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test des notifications */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Test des notifications
            </CardTitle>
            <CardDescription>
              Testez le système de notifications avec icônes et historique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Test complet avec historique</h4>
              <NotificationTester />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Tests individuels</h4>
              <NotificationTest />
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
            <CardDescription>
              Détails sur l&apos;application et l&apos;environnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version application</span>
                  <Badge variant="secondary">v1.0.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next.js</span>
                  <Badge variant="secondary">15.1.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base de données</span>
                  <Badge variant="secondary">PostgreSQL 15</Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Messages totaux</span>
                  <Badge variant="outline">15</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dernière sauvegarde</span>
                  <Badge variant="outline">Auto</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Statut système</span>
                  <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  TrendingUp, Users, MessageSquare, CheckCircle, 
  Mail, Clock, Activity, BarChart3 
} from 'lucide-react';
import { ClientOnly } from './ui/client-only';
import { formatDateTime } from '@/lib/date-utils';

interface DashboardStats {
  metrics: {
    total: number;
    today: number;
    week: number;
    acceptanceRate: number;
    offersRate: number;
    avgPerDay: string;
    todayTrend: number;
  };
  charts: {
    daily: Array<{date: string; messages: number; dateFormatted: string}>;
    services: Array<{name: string; value: number; color: string}>;
    hourly: Array<{hour: string; messages: number}>;
    domains: Array<{domain: string; count: number}>;
  };
  recentActivity: Array<{
    id: number;
    name: string;
    email: string;
    date: string;
    services: string[];
  }>;
}

const COLORS = ['#b93737', '#0b1f3a', '#6b7280', '#9ca3af'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
        // Ajouter les détails supplémentaires à l'erreur
        (error as any).hint = errorData.hint;
        (error as any).details = errorData.details;
        throw error;
      }
      
      const data = await response.json();
      
      // Debug: afficher les données reçues
      console.log('📊 Données reçues du dashboard:', data);
      console.log('📈 Charts daily:', data.charts?.daily);
      console.log('📈 Charts daily premier élément:', data.charts?.daily?.[0]);
      console.log('📊 Charts services:', data.charts?.services);
      console.log('📊 Charts services premier élément:', data.charts?.services?.[0]);
      
      // Vérifier si la réponse contient une erreur
      if (data.error) {
        setError(data.message || data.error || 'Erreur lors du chargement des statistiques');
        setStats(null);
      } else {
        // S'assurer que les données sont complètes
        if (!data.metrics || !data.charts || !data.recentActivity) {
          console.warn('⚠️ Données incomplètes:', data);
          setError('Données incomplètes reçues du serveur');
          setStats(null);
        } else {
          // S'assurer que les tableaux existent
          if (!Array.isArray(data.charts.daily)) {
            console.warn('⚠️ charts.daily n\'est pas un tableau:', data.charts.daily);
            data.charts.daily = [];
          }
          if (!Array.isArray(data.charts.services)) {
            console.warn('⚠️ charts.services n\'est pas un tableau:', data.charts.services);
            data.charts.services = [];
          }
          setStats(data);
          setError(null);
        }
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      let errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques';
      const errorWithDetails = error as any;
      if (errorWithDetails.hint) {
        errorMessage += `\n\n💡 ${errorWithDetails.hint}`;
      }
      if (errorWithDetails.details && process.env.NODE_ENV === 'development') {
        errorMessage += `\n\n🔍 Détails: ${errorWithDetails.details}`;
      }
      setError(errorMessage);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-globe-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-globe-navy font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-globe-light flex items-center justify-center p-6">
        <Card className="border-globe-red/20 shadow-xl max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-globe-red flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-globe-navy">
              {error || 'Erreur lors du chargement des statistiques'}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-2">💡 Solutions possibles :</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Vérifiez que PostgreSQL est accessible</li>
                <li>Vérifiez votre connexion réseau</li>
                <li>Actualisez la page</li>
              </ul>
            </div>
            <button
              onClick={fetchStats}
              className="w-full bg-globe-red hover:bg-globe-red/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metrics, charts, recentActivity } = stats;

  // Vérifier que les données sont valides
  if (!metrics || !charts || !recentActivity) {
    return (
      <div className="min-h-screen bg-globe-light flex items-center justify-center p-6">
        <Card className="border-globe-red/20 shadow-xl max-w-2xl w-full">
          <CardContent className="p-6 text-center">
            <p className="text-globe-dark">Données incomplètes. Veuillez réessayer.</p>
            <button
              onClick={fetchStats}
              className="mt-4 bg-globe-red hover:bg-globe-red/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-globe-light">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-globe-navy to-[#0d2540] px-6 py-8 mb-6 shadow-lg rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-globe-red rounded-2xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Analytics</h1>
              <p className="text-white/70 mt-1">Vue d&apos;ensemble de l&apos;activité en temps réel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Actualisé automatiquement</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-globe-red to-[#a02f2f] border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{(metrics.total || 0).toLocaleString()}</div>
              <p className="text-xs text-white/70 mt-1">
                Moyenne: {metrics.avgPerDay || 0}/jour
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-globe-navy to-[#0d2540] border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Aujourd&apos;hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.today || 0}</div>
              <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                {metrics.todayTrend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3 rotate-180" />
                )}
                {metrics.todayTrend >= 0 ? '+' : ''}{metrics.todayTrend || 0} vs hier
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-globe-navy/10 shadow-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-globe-navy flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-globe-red" />
                Taux d&apos;acceptation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-globe-navy">{metrics.acceptanceRate || 0}%</div>
              <p className="text-xs text-gray-600 mt-1">
                Conditions acceptées
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-globe-navy/10 shadow-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-globe-navy flex items-center gap-2">
                <Mail className="h-4 w-4 text-globe-red" />
                Intérêt Offres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-globe-navy">{metrics.offersRate || 0}%</div>
              <p className="text-xs text-gray-600 mt-1">
                Veulent recevoir les offres
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages par jour */}
          <Card className="border-globe-navy/10 shadow-lg bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-globe-navy">
                <TrendingUp className="h-5 w-5 text-globe-red" />
                Messages par jour (30 derniers jours)
              </CardTitle>
              <CardDescription className="text-gray-600">
                Évolution du nombre de messages reçus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {charts?.daily && Array.isArray(charts.daily) && charts.daily.length > 0 ? (
                <div className="space-y-4">
                  {charts.daily.slice(-7).map((day, index) => {
                    const maxMessages = Math.max(...charts.daily.map(d => d.messages || 0), 1);
                    const percentage = maxMessages > 0 ? (day.messages / maxMessages) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-globe-navy">{day.dateFormatted || day.date}</span>
                          <span className="text-globe-red font-bold">{day.messages || 0} message{day.messages > 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-globe-red to-[#a02f2f] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Pas de données</p>
                    <p className="text-sm">Les données apparaîtront dès réception de messages</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services demandés */}
          <Card className="border-globe-navy/10 shadow-lg bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-globe-navy">
                <BarChart3 className="h-5 w-5 text-globe-red" />
                Répartition des services
              </CardTitle>
              <CardDescription className="text-gray-600">
                Services les plus demandés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {charts?.services && Array.isArray(charts.services) && charts.services.length > 0 ? (
                <div className="space-y-4">
                  {charts.services
                    .sort((a, b) => (b.value || 0) - (a.value || 0))
                    .map((service, index) => {
                      const total = charts.services.reduce((sum, s) => sum + (s.value || 0), 0);
                      const percentage = total > 0 ? ((service.value || 0) / total) * 100 : 0;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: service.color || '#b93737' }}
                              />
                              <span className="font-medium text-globe-navy">{service.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                              <span className="text-globe-red font-bold">{service.value || 0} demande{(service.value || 0) > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: service.color || '#b93737'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Aucun service demandé</p>
                    <p className="text-sm">Les données s&apos;afficheront quand des services seront cochés</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <Card className="border-globe-navy/10 shadow-lg bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-globe-navy">
              <Users className="h-5 w-5 text-globe-red" />
              Activité récente
            </CardTitle>
            <CardDescription className="text-gray-600">
              5 derniers messages reçus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-4 bg-globe-light rounded-lg hover:shadow-md transition-all border border-globe-navy/5"
                >
                  <div className="flex-1">
                    <div className="font-medium text-globe-navy">
                      {activity.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.email}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {activity.services.map((service) => (
                        <span 
                          key={service} 
                          className="px-2 py-1 bg-globe-red/10 text-globe-red text-xs rounded-full font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ClientOnly fallback={<div className="text-xs text-gray-500">--</div>}>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(activity.date)}
                    </div>
                  </ClientOnly>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

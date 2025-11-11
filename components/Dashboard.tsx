'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, MessageSquare, CheckCircle, 
  Mail, Clock, Activity, BarChart3 
} from 'lucide-react';

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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
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

  if (!stats) {
    return (
      <div className="p-6">
        <Card className="border-globe-red/20">
          <CardContent className="p-6 text-center">
            <p className="text-globe-dark">Erreur lors du chargement des statistiques</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metrics, charts, recentActivity } = stats;

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
              <div className="text-3xl font-bold text-white">{metrics.total.toLocaleString()}</div>
              <p className="text-xs text-white/70 mt-1">
                Moyenne: {metrics.avgPerDay}/jour
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
              <div className="text-3xl font-bold text-white">{metrics.today}</div>
              <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                {metrics.todayTrend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3 rotate-180" />
                )}
                {metrics.todayTrend >= 0 ? '+' : ''}{metrics.todayTrend} vs hier
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
              <div className="text-3xl font-bold text-globe-navy">{metrics.acceptanceRate}%</div>
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
              <div className="text-3xl font-bold text-globe-navy">{metrics.offersRate}%</div>
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
              {charts.daily && charts.daily.length > 0 && charts.daily.some(d => d.messages > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={charts.daily}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b93737" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#b93737" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dateFormatted" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [`${value} message${value > 1 ? 's' : ''}`, 'Messages']}
                    />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stroke="#b93737"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMessages)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Pas de données</p>
                    <p className="text-sm">Le graphique apparaîtra dès réception de messages</p>
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
              {charts.services && charts.services.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={charts.services}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.services.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [`${value} demande${value > 1 ? 's' : ''}`, 'Demandes']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: '#0a0a0a', fontWeight: 500 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Aucun service demandé</p>
                    <p className="text-sm">Le graphique s&apos;affichera quand des services seront cochés</p>
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
              {recentActivity.map((activity) => (
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
                  <div className="text-xs text-gray-500">
                    {new Intl.DateTimeFormat('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit'
                    }).format(new Date(activity.date))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

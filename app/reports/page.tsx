'use client';

import { useState, useEffect } from 'react';
import { format as formatDate } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Badge } from '../../components/ui/badge';
import { 
  FileText, Download, Calendar as CalendarIcon, Filter, 
  BarChart3, PieChart, TrendingUp, Clock, Users, Mail, RefreshCw
} from 'lucide-react';
import { toastSuccess, toastError, toastInfo } from '../../lib/toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [reportType, setReportType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Services disponibles
  const availableServices = [
    { value: 'cameras_residentiel', label: 'Caméras Résidentiel' },
    { value: 'alarme_residentiel', label: 'Alarme Résidentiel' },
    { value: 'domotique', label: 'Domotique' },
    { value: 'interphone', label: 'Interphone' },
    { value: 'wifi_residentiel', label: 'WiFi Résidentiel' },
    { value: 'portails_motorises', label: 'Portails Motorisés' },
    { value: 'securite_commerciale', label: 'Sécurité Commerciale' },
    { value: 'controle_acces', label: 'Contrôle d\'Accès' },
    { value: 'gestion_reseau', label: 'Gestion Réseau' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const reportTypes = [
    { value: 'all', label: 'Rapport complet', icon: FileText },
    { value: 'services', label: 'Analyse des services', icon: PieChart },
    { value: 'trends', label: 'Tendances temporelles', icon: TrendingUp },
    { value: 'performance', label: 'Performance mensuelle', icon: BarChart3 },
  ];

  const quickRanges = [
    { label: "Aujourd'hui", days: 0 },
    { label: "7 derniers jours", days: 7 },
    { label: "30 derniers jours", days: 30 },
    { label: "Ce mois", days: "month" },
  ];

  // Charger les statistiques
  useEffect(() => {
    fetchStats();
  }, []);

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

  const handleQuickRange = (days: number | string) => {
    const today = new Date();
    setDateTo(today);

    if (days === 'month') {
      setDateFrom(new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (typeof days === 'number') {
      const from = new Date(today);
      from.setDate(today.getDate() - days);
      setDateFrom(from);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const generateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsGenerating(true);
    
    try {
      const params = new URLSearchParams({
        export: 'csv',
        ...(dateFrom && { dateFrom: formatDate(dateFrom, 'yyyy-MM-dd') }),
        ...(dateTo && { dateTo: formatDate(dateTo, 'yyyy-MM-dd') }),
        ...(selectedServices.length > 0 && { services: selectedServices.join(',') }),
      });

      if (format === 'csv') {
        const response = await fetch(`/api/messages?${params.toString()}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const dateStr = formatDate(new Date(), 'yyyy-MM-dd');
          a.download = `rapport-globetelecom-${dateStr}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toastSuccess({
            title: 'Rapport généré !',
            description: `Rapport CSV téléchargé avec succès`,
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erreur lors de la génération');
        }
      } else if (format === 'pdf') {
        const response = await fetch(`/api/reports/pdf?${params.toString()}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const dateStr = formatDate(new Date(), 'yyyy-MM-dd');
          a.download = `rapport-globetelecom-${dateStr}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toastSuccess({
            title: 'Rapport PDF généré !',
            description: `Rapport PDF téléchargé avec succès`,
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erreur lors de la génération du PDF');
        }
      } else {
        toastInfo({
          title: 'Fonctionnalité à venir',
          description: `Export ${format.toUpperCase()} sera disponible prochainement`,
        });
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toastError({
        title: 'Erreur de génération',
        description: error instanceof Error ? error.message : 'Impossible de générer le rapport',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-globe-light">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-globe-navy to-[#0d2540] px-6 py-8 mb-6 shadow-lg rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-globe-red rounded-2xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Rapports & Exports</h1>
              <p className="text-white/70 mt-1">Générez des rapports détaillés sur l&apos;activité des messages</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration du rapport */}
        <div className="lg:col-span-1">
          <Card className="border-globe-navy/10 shadow-lg bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-globe-navy">
                <Filter className="h-5 w-5 text-globe-red" />
                Configuration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Personnalisez votre rapport
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type de rapport */}
              <div className="space-y-2">
                <Label>Type de rapport</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Plages rapides */}
              <div className="space-y-2">
                <Label>Plages rapides</Label>
                <div className="grid grid-cols-2 gap-2">
                  {quickRanges.map((range) => (
                    <Button
                      key={range.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickRange(range.days)}
                      className="text-xs"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dates personnalisées */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: fr }) : 'Choisir'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: fr }) : 'Choisir'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filtres par services */}
              <div className="space-y-2 pt-2">
                <Label>Filtrer par services (optionnel)</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-lg bg-gray-50">
                  {availableServices.map((service) => (
                    <label
                      key={service.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.value)}
                        onChange={() => toggleService(service.value)}
                        className="w-4 h-4 text-globe-red border-gray-300 rounded focus:ring-globe-red"
                      />
                      <span className="text-sm text-globe-navy">{service.label}</span>
                    </label>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedServices([])}
                    className="w-full text-xs"
                  >
                    Effacer les filtres ({selectedServices.length})
                  </Button>
                )}
              </div>

              {/* Boutons de génération */}
              <div className="space-y-2 pt-4 border-t">
                <Label>Format d&apos;export</Label>
                <div className="space-y-2">
                  <Button 
                    onClick={() => generateReport('csv')}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-globe-red to-[#a02f2f] hover:from-[#a02f2f] hover:to-globe-red text-white shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Export CSV'}
                  </Button>
                  
                  <Button 
                    onClick={() => generateReport('excel')}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full border-globe-navy/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel (Bientôt)
                  </Button>
                  
                  <Button 
                    onClick={() => generateReport('pdf')}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-globe-navy to-[#0d2540] hover:from-[#0d2540] hover:to-globe-navy text-white shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Export PDF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aperçu et statistiques */}
        <div className="lg:col-span-2 space-y-6">
          {/* Métriques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-globe-red to-[#a02f2f] border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Messages analysés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {loading ? '...' : (stats?.metrics?.total || 0).toLocaleString()}
                </div>
                <p className="text-xs text-white/70 mt-1">
                  Base de données complète
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-globe-navy to-[#0d2540] border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Aujourd&apos;hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {loading ? '...' : (stats?.metrics?.today || 0)}
                </div>
                <p className="text-xs text-white/70 mt-1">
                  Messages reçus aujourd&apos;hui
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-globe-navy/10 shadow-lg rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-globe-navy flex items-center gap-2">
                  <Clock className="h-4 w-4 text-globe-red" />
                  Cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-globe-navy">
                  {loading ? '...' : (stats?.metrics?.week || 0)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Messages sur 7 jours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Aperçu du rapport */}
          <Card className="border-globe-navy/10 shadow-lg bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-globe-navy">Aperçu du rapport</CardTitle>
              <CardDescription className="text-gray-600">
                {reportTypes.find(t => t.value === reportType)?.label} 
                {dateFrom && dateTo && (
                  <span className="ml-2">
                    • Du {format(dateFrom, 'dd/MM/yyyy', { locale: fr })} 
                    au {format(dateTo, 'dd/MM/yyyy', { locale: fr })}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-globe-red/10 text-globe-red border-globe-red/20">
                    Services: {stats?.charts?.services?.length || 0}
                  </Badge>
                  <Badge className="bg-globe-navy/10 text-globe-navy border-globe-navy/20">
                    Total: {stats?.metrics?.total || 0} messages
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Données temps réel
                  </Badge>
                  {selectedServices.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Filtres: {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <div className="border border-globe-navy/10 rounded-lg p-4 bg-globe-light">
                  <h4 className="font-semibold text-globe-navy mb-3">Contenu du rapport CSV :</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-globe-red mt-0.5">•</span>
                      <span>Informations de contact (nom, prénom, email, téléphone)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-globe-red mt-0.5">•</span>
                      <span>Type de client (résidentiel/entreprise)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-globe-red mt-0.5">•</span>
                      <span>Services demandés (tous les services cochés)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-globe-red mt-0.5">•</span>
                      <span>Message et préférences (newsletter, consentement)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-globe-red mt-0.5">•</span>
                      <span>Date de création et métadonnées</span>
                    </li>
                  </ul>
                </div>

                {/* Statistiques des services */}
                {stats?.charts?.services && stats.charts.services.length > 0 && (
                  <div className="border border-globe-navy/10 rounded-lg p-4 bg-globe-light">
                    <h4 className="font-semibold text-globe-navy mb-3">Services les plus demandés :</h4>
                    <div className="space-y-2">
                      {stats.charts.services
                        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
                        .slice(0, 5)
                        .map((service: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: service.color || '#b93737' }}
                              />
                              <span className="text-globe-navy">{service.name}</span>
                            </div>
                            <span className="font-semibold text-globe-red">{service.value} demande{service.value > 1 ? 's' : ''}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <strong className="text-blue-800">💡 Astuce :</strong> Les rapports sont générés en temps réel à partir de votre base de données PostgreSQL. 
                  Utilisez les filtres de date et de services pour analyser des périodes et catégories spécifiques.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

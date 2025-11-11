'use client';

import { useState } from 'react';
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
  BarChart3, PieChart, TrendingUp, Clock, Users, Mail 
} from 'lucide-react';
import { toastSuccess, toastError, toastInfo } from '../../lib/toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [reportType, setReportType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsGenerating(true);
    
    try {
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const params = new URLSearchParams({
        type: reportType,
        format,
        ...(dateFrom && { dateFrom: formatDate(dateFrom, 'yyyy-MM-dd') }),
        ...(dateTo && { dateTo: formatDate(dateTo, 'yyyy-MM-dd') }),
      });

      // Pour l'instant, on génère un CSV simple
      if (format === 'csv') {
        const response = await fetch(`/api/messages?export=csv&${params.toString()}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rapport-globetelecom-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toastSuccess({
            title: 'Rapport généré !',
            description: `Rapport ${reportTypes.find(t => t.value === reportType)?.label.toLowerCase()} téléchargé`,
          });
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
        description: 'Impossible de générer le rapport',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rapports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Générez des rapports détaillés sur l&apos;activité des messages de contact.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration du rapport */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-500" />
                Configuration
              </CardTitle>
              <CardDescription>
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

              {/* Boutons de génération */}
              <div className="space-y-2 pt-4">
                <Label>Format d&apos;export</Label>
                <div className="space-y-2">
                  <Button 
                    onClick={() => generateReport('csv')}
                    disabled={isGenerating}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Export CSV'}
                  </Button>
                  
                  <Button 
                    onClick={() => generateReport('excel')}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel (Bientôt)
                  </Button>
                  
                  <Button 
                    onClick={() => generateReport('pdf')}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF (Bientôt)
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
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Messages analysés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs opacity-80 mt-1">
                  Base de données complète
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contacts uniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs opacity-80 mt-1">
                  Déduplication automatique
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Période active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">30j</div>
                <p className="text-xs opacity-80 mt-1">
                  Données disponibles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Aperçu du rapport */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Aperçu du rapport</CardTitle>
              <CardDescription>
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
                  <Badge variant="secondary">Services analysés: 4</Badge>
                  <Badge variant="secondary">Domaines: 4 types</Badge>
                  <Badge variant="secondary">Données temps réel</Badge>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Contenu du rapport :</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Synthèse des messages reçus</li>
                    <li>• Répartition par service demandé</li>
                    <li>• Analyse temporelle des contacts</li>
                    <li>• Top des domaines email</li>
                    <li>• Taux d&apos;acceptation des conditions</li>
                    <li>• Données de géolocalisation (IP)</li>
                  </ul>
                </div>

                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <strong>💡 Astuce :</strong> Les rapports sont générés en temps réel à partir de votre base de données PostgreSQL. 
                  Utilisez les filtres de date pour analyser des périodes spécifiques.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContactMessage, MessagesResponse } from '../types/message';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Trash2, Eye, Search, Download, ChevronLeft, ChevronRight, RefreshCw,
  Filter, X, Clock, MessageSquare
} from 'lucide-react';
import MessageDetailModal from './MessageDetailModal';
import { ClientOnly } from './ui/client-only';
import { formatDateShort, formatTime } from '@/lib/date-utils';
import { removeDashlaneAttributes } from '@/lib/remove-dashlane-attributes';

export default function MessageTable() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(false); // Désactivé par défaut
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const serviceOptions = [
    // Services résidentiels
    { value: 'cameras_residentiel', label: 'Caméras Résidentiel' },
    { value: 'alarme_residentiel', label: 'Alarme Résidentiel' },
    { value: 'domotique', label: 'Domotique' },
    { value: 'interphone', label: 'Interphone' },
    { value: 'wifi_residentiel', label: 'WiFi Résidentiel' },
    // Services entreprise
    { value: 'portails_motorises', label: 'Portails Motorisés' },
    { value: 'securite_commerciale', label: 'Sécurité Commerciale' },
    { value: 'controle_acces', label: 'Contrôle d\'Accès' },
    { value: 'gestion_reseau', label: 'Gestion Réseau' },
    // Services généraux
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'date_envoi',
        sortOrder: 'desc',
      });

      if (search) params.append('search', search);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedServices.length > 0) params.append('services', selectedServices.join(','));

      const response = await fetch(`/api/messages?${params}`);
      const data: MessagesResponse & { error?: string; details?: string } = await response.json();
      
      // Vérifier s'il y a une erreur dans la réponse
      if (data.error) {
        setError(data.error);
        setMessages([]);
        setTotal(0);
        setTotalPages(0);
      } else {
        setError(null);
        setMessages(data.messages || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setError('Erreur lors du chargement des messages. Vérifiez votre connexion.');
      setMessages([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, dateFrom, dateTo, selectedServices]);

  // Charger les messages au montage et quand les filtres changent
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, dateFrom, dateTo, selectedServices]);

  // Nettoyer les attributs Dashlane après chaque mise à jour des messages (une seule fois après le rendu)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0 && !loading) {
      // Petit délai pour laisser Dashlane ajouter ses attributs
      const timer = setTimeout(() => {
        removeDashlaneAttributes();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages.length, loading]); // Utiliser messages.length au lieu de messages pour éviter les re-renders

  // Auto-refresh seulement si activé - rafraîchit uniquement les messages, pas la page
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Rafraîchir uniquement les messages via API, sans recharger la page
      fetchMessages();
    }, 30000); // 30 secondes
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]); // Ne pas inclure fetchMessages pour éviter les re-créations

  const handleSearch = () => {
    setPage(1);
    fetchMessages();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ export: 'csv' });
      if (search) params.append('search', search);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedServices.length > 0) params.append('services', selectedServices.join(','));

      const response = await fetch(`/api/messages?${params}`);
      
      if (response.ok) {
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `messages_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    
    try {
      const response = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleViewMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`);
      const message = await response.json();
      setSelectedMessage(message);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur détails message:', error);
    }
  };

  const getServicesString = (message: ContactMessage) => {
    const services = [];
    if (message.installation) services.push('Installation');
    if (message.maintenance) services.push('Maintenance');
    if (message.surveillance) services.push('Surveillance');
    if (message.consultation) services.push('Consultation');
    return services.join(', ');
  };

  const clearAllFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedServices([]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-globe-light">
      {/* En-tête - Design Amélioré */}
      <div className="bg-gradient-to-br from-globe-navy via-[#0d2540] to-globe-navy px-8 py-10 mb-8 shadow-2xl rounded-b-3xl relative overflow-hidden">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-globe-red rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-globe-red rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Messages de Contact</h1>
              <div className="flex items-center gap-3 text-white/80">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="font-semibold text-white">{total}</span> message{total > 1 ? 's' : ''}
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Dernière MAJ : <ClientOnly fallback="...">
                    <span className="font-medium">{lastRefresh.toLocaleTimeString('fr-FR')}</span>
                    {autoRefresh && (
                      <span className="ml-2 text-xs text-green-300 animate-pulse" title="Auto-refresh activé - les messages se rafraîchissent automatiquement toutes les 30 secondes">(Auto)</span>
                    )}
                  </ClientOnly>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                // Rafraîchir uniquement les messages, pas la page complète
                fetchMessages();
              }}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/40 transition-all shadow-lg"
              title="Actualiser uniquement les messages (sans recharger la page)"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2.5 rounded-xl backdrop-blur-sm border transition-all cursor-pointer ${
                autoRefresh 
                  ? 'bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30' 
                  : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
              }`}
              title={autoRefresh ? 'Cliquer pour désactiver l\'auto-refresh' : 'Cliquer pour activer l\'auto-refresh'}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-white/40'}`}></div>
                Auto: {autoRefresh ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6" suppressHydrationWarning>
        {/* Filtres - Design Amélioré */}
        <div className="bg-gradient-to-br from-white via-white to-globe-light/30 rounded-3xl shadow-xl border border-globe-navy/5 p-8 backdrop-blur-sm" suppressHydrationWarning>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-globe-red to-[#a02f2f] rounded-2xl shadow-lg">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-globe-navy">Recherche et Filtres</h3>
                <p className="text-sm text-gray-500 mt-0.5">Affinez votre recherche</p>
              </div>
            </div>
            {(search || dateFrom || dateTo || selectedServices.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-globe-red border-globe-red/30 hover:bg-globe-red/10 hover:border-globe-red/50 transition-all shadow-sm"
              >
                <X className="h-4 w-4 mr-1.5" />
                Effacer tout
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Recherche - Design Amélioré */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-globe-red/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-globe-red/60 group-focus-within:text-globe-red transition-colors" />
                <Input
                  placeholder="Rechercher par nom, email ou message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-12 pr-4 h-14 text-base border-2 border-globe-navy/10 focus:border-globe-red focus:ring-4 focus:ring-globe-red/20 rounded-2xl bg-white/80 backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Dates et pagination - Design Amélioré */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-globe-navy flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-globe-red rounded-full"></span>
                  Date début
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-12 border-2 border-globe-navy/10 focus:border-globe-red focus:ring-4 focus:ring-globe-red/20 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-globe-navy flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-globe-red rounded-full"></span>
                  Date fin
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-12 border-2 border-globe-navy/10 focus:border-globe-red focus:ring-4 focus:ring-globe-red/20 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-globe-navy flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-globe-red rounded-full"></span>
                  Lignes par page
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number.parseInt(e.target.value, 10))}
                  className="w-full h-12 px-4 border-2 border-globe-navy/10 rounded-xl focus:outline-none focus:border-globe-red focus:ring-4 focus:ring-globe-red/20 bg-white text-globe-navy font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
                  suppressHydrationWarning
                >
                  <option value="10">10 par page</option>
                  <option value="25">25 par page</option>
                  <option value="50">50 par page</option>
                </select>
              </div>
            </div>

            {/* Services - Design Amélioré avec badges */}
            <div className="space-y-3" suppressHydrationWarning>
              <label className="block text-sm font-semibold text-globe-navy flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-globe-red rounded-full"></span>
                Services
              </label>
              <div className="flex flex-wrap gap-3">
                {serviceOptions.map((service) => {
                  const isSelected = selectedServices.includes(service.value);
                  return (
                    <button
                      key={service.value}
                      onClick={() => {
                        setSelectedServices(prev => 
                          prev.includes(service.value)
                            ? prev.filter(s => s !== service.value)
                            : [...prev, service.value]
                        );
                      }}
                      className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform ${
                        isSelected
                          ? 'bg-gradient-to-r from-globe-red to-[#a02f2f] text-white shadow-lg shadow-globe-red/30 scale-105'
                          : 'bg-white text-globe-navy border-2 border-globe-navy/10 hover:border-globe-red/50 hover:bg-globe-red/5 shadow-sm hover:shadow-md'
                      }`}
                      suppressHydrationWarning
                    >
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <span className="w-2 h-2 bg-globe-red rounded-full"></span>
                        </span>
                      )}
                      <span className="relative z-10">{service.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boutons d'action - Design Amélioré */}
            <div className="flex gap-4 pt-4 border-t border-globe-navy/10" suppressHydrationWarning>
              <Button 
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-globe-red to-[#a02f2f] hover:from-[#a02f2f] hover:to-globe-red text-white h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all font-semibold"
                suppressHydrationWarning
              >
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
              <Button 
                onClick={handleExport}
                variant="outline"
                className="px-8 h-12 border-2 border-globe-navy/20 hover:bg-globe-navy/5 hover:border-globe-navy/40 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold"
                suppressHydrationWarning
              >
                <Download className="h-5 w-5 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Table - Design Amélioré */}
        <div className="bg-white rounded-3xl shadow-xl border border-globe-navy/5 overflow-hidden backdrop-blur-sm" suppressHydrationWarning>
          <div className="overflow-x-auto">
            <table className="w-full" suppressHydrationWarning>
              <thead className="bg-gradient-to-r from-globe-navy via-[#0d2540] to-globe-navy">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-white/90">Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-white/90">Contact</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-white/90">Email</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-white/90">Services</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-white/90">Message</th>
                  <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-white/90">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-globe-navy/5 bg-white" suppressHydrationWarning>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-globe-red border-t-transparent"></div>
                        <span className="ml-3 text-globe-navy">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="bg-red-50 border-2 border-globe-red rounded-xl p-6 max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <span className="text-2xl">⚠️</span>
                          <h3 className="text-lg font-semibold text-globe-red">Erreur de connexion</h3>
                        </div>
                        <p className="text-globe-navy mb-4">{error}</p>
                        <div className="text-sm text-gray-600 bg-white rounded-lg p-4 text-left">
                          <p className="font-semibold mb-2">💡 Solutions possibles :</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Vérifiez que PostgreSQL est démarré sur {process.env.NEXT_PUBLIC_POSTGRES_HOST || '192.168.0.187'}:5432</li>
                            <li>Vérifiez que le pare-feu autorise la connexion</li>
                            <li>Vérifiez que l'adresse IP est accessible depuis cette machine</li>
                            <li>Consultez le guide dans <code className="bg-gray-100 px-2 py-1 rounded">GUIDE_CONNEXION_POSTGRESQL.md</code></li>
                          </ul>
                        </div>
                        <Button
                          onClick={fetchMessages}
                          className="mt-4 bg-globe-red hover:bg-globe-red/90 text-white"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réessayer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : !messages || messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-globe-light to-white flex items-center justify-center mb-4 shadow-lg">
                          <MessageSquare className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-globe-navy mb-2">Aucun message trouvé</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          {search || dateFrom || dateTo || selectedServices.length > 0
                            ? 'Essayez de modifier vos critères de recherche'
                            : 'Aucun message n\'a été reçu pour le moment'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                        messages.map((message, index) => {
                          const services = [];
                          // Services résidentiels
                          if (message.cameras_residentiel) services.push({ name: 'Caméras Résidentiel', color: 'bg-blue-100 text-blue-700 border-blue-200' });
                          if (message.alarme_residentiel) services.push({ name: 'Alarme Résidentiel', color: 'bg-green-100 text-green-700 border-green-200' });
                          if (message.domotique) services.push({ name: 'Domotique', color: 'bg-amber-100 text-amber-700 border-amber-200' });
                          if (message.interphone) services.push({ name: 'Interphone', color: 'bg-purple-100 text-purple-700 border-purple-200' });
                          if (message.wifi_residentiel) services.push({ name: 'WiFi Résidentiel', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' });
                          // Services entreprise
                          if (message.portails_motorises) services.push({ name: 'Portails Motorisés', color: 'bg-red-100 text-red-700 border-red-200' });
                          if (message.securite_commerciale) services.push({ name: 'Sécurité Commerciale', color: 'bg-pink-100 text-pink-700 border-pink-200' });
                          if (message.controle_acces) services.push({ name: 'Contrôle d\'Accès', color: 'bg-teal-100 text-teal-700 border-teal-200' });
                          if (message.gestion_reseau) services.push({ name: 'Gestion Réseau', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' });
                          // Services généraux
                          if (message.maintenance) services.push({ name: 'Maintenance', color: 'bg-orange-100 text-orange-700 border-orange-200' });
                          if (message.consultation) services.push({ name: 'Consultation', color: 'bg-lime-100 text-lime-700 border-lime-200' });
                    
                    return (
                      <tr 
                        key={message.id} 
                        className="group hover:bg-gradient-to-r hover:from-globe-light hover:to-white transition-all duration-200 border-b border-globe-navy/5"
                        style={{ animationDelay: `${index * 50}ms` }}
                        suppressHydrationWarning
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <ClientOnly fallback={
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-globe-navy">--</span>
                              <span className="text-xs text-gray-500 mt-0.5">--</span>
                            </div>
                          }>
                            <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-globe-navy">
                                      {formatDateShort(message.created_at || message.date_envoi || '')}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                      {formatTime(message.created_at || message.date_envoi || '')}
                                    </span>
                            </div>
                          </ClientOnly>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-globe-red to-[#a02f2f] flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {message.prenom[0]}{message.nom[0]}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-globe-navy group-hover:text-globe-red transition-colors">
                                {message.prenom} {message.nom}
                              </div>
                              {message.telephone && (
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                  <span>{message.telephone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap" suppressHydrationWarning>
                          <a 
                            href={`mailto:${message.email}`}
                            className="text-sm text-globe-navy hover:text-globe-red transition-colors font-medium flex items-center gap-1 group/link"
                            suppressHydrationWarning
                          >
                            {message.email}
                            <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">↗</span>
                          </a>
                        </td>
                        <td className="px-6 py-5" suppressHydrationWarning>
                          <div className="flex flex-wrap gap-1.5">
                            {services.length > 0 ? (
                              services.map((service, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${service.color} shadow-sm`}
                                  suppressHydrationWarning
                                >
                                  {service.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">Aucun service</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5" suppressHydrationWarning>
                          <div className="text-sm text-globe-navy max-w-xs">
                            {message.message ? (
                              <p className="line-clamp-2 group-hover:text-globe-red/80 transition-colors">
                                {message.message}
                              </p>
                            ) : (
                              <span className="text-gray-400 italic">Aucun message</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right" suppressHydrationWarning>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMessage(message.id)}
                              className="border-globe-navy/20 hover:bg-globe-navy/5 hover:border-globe-navy/40 hover:scale-110 transition-all shadow-sm"
                              title="Voir les détails"
                              suppressHydrationWarning
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(message.id)}
                              className="border-globe-red/30 text-globe-red hover:bg-globe-red/10 hover:border-globe-red/50 hover:scale-110 transition-all shadow-sm"
                              title="Supprimer"
                              suppressHydrationWarning
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Design Amélioré */}
          {totalPages > 1 && (
            <div className="px-8 py-6 bg-gradient-to-r from-globe-light via-white to-globe-light border-t border-globe-navy/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-globe-navy font-medium">
                  <span className="text-globe-red font-bold">{((page - 1) * limit) + 1}</span> - <span className="text-globe-red font-bold">{Math.min(page * limit, total)}</span> sur <span className="text-globe-red font-bold">{total}</span> résultats
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="border-2 border-globe-navy/20 hover:bg-globe-navy/5 hover:border-globe-navy/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-globe-red to-[#a02f2f] text-white shadow-lg scale-110'
                              : 'bg-white text-globe-navy border-2 border-globe-navy/10 hover:border-globe-red/50 hover:bg-globe-red/5 shadow-sm hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="border-2 border-globe-navy/20 hover:bg-globe-navy/5 hover:border-globe-navy/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-md"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

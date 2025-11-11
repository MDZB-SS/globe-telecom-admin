'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContactMessage, MessagesResponse } from '../types/message';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Trash2, Eye, Search, Download, ChevronLeft, ChevronRight, RefreshCw,
  Filter, X
} from 'lucide-react';
import MessageDetailModal from './MessageDetailModal';
import { ClientOnly } from './ui/client-only';

export default function MessageTable() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  const [autoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const serviceOptions = [
    { value: 'installation', label: 'Installation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'surveillance', label: 'Surveillance' },
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
      const data: MessagesResponse = await response.json();
      
      setMessages(data.messages);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, dateFrom, dateTo, selectedServices]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMessages]);

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

  const handleDelete = async (id: number) => {
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

  const handleViewMessage = async (messageId: number) => {
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
      {/* En-tête */}
      <div className="bg-gradient-to-r from-globe-navy to-[#0d2540] px-6 py-8 mb-6 shadow-lg rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Messages de Contact</h1>
            <p className="text-white/70 mt-1">
              {total} message{total > 1 ? 's' : ''} • Dernière MAJ : <ClientOnly fallback="...">{lastRefresh.toLocaleTimeString('fr-FR')}</ClientOnly>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchMessages}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <div className={`px-3 py-2 rounded-lg ${autoRefresh ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'}`}>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}></div>
                Auto: {autoRefresh ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-globe-navy/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-globe-navy flex items-center gap-2">
              <Filter className="h-5 w-5 text-globe-red" />
              Recherche et Filtres
            </h3>
            {(search || dateFrom || dateTo || selectedServices.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-globe-red border-globe-red/20 hover:bg-globe-red/10"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer tout
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 h-12 border-globe-navy/10 focus:border-globe-red focus:ring-globe-red rounded-xl"
              />
            </div>

            {/* Dates et services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-globe-navy mb-2">Date début</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 border-globe-navy/10 focus:border-globe-red focus:ring-globe-red rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-globe-navy mb-2">Date fin</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 border-globe-navy/10 focus:border-globe-red focus:ring-globe-red rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-globe-navy mb-2">Lignes par page</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number.parseInt(e.target.value, 10))}
                  className="w-full h-10 px-3 border border-globe-navy/10 rounded-xl focus:outline-none focus:border-globe-red focus:ring-2 focus:ring-globe-red bg-white text-globe-navy"
                >
                  <option value="10">10 par page</option>
                  <option value="25">25 par page</option>
                  <option value="50">50 par page</option>
                </select>
              </div>
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-globe-navy mb-2">Services</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {serviceOptions.map((service) => (
                  <button
                    key={service.value}
                    onClick={() => {
                      setSelectedServices(prev => 
                        prev.includes(service.value)
                          ? prev.filter(s => s !== service.value)
                          : [...prev, service.value]
                      );
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedServices.includes(service.value)
                        ? 'bg-globe-red text-white shadow-lg'
                        : 'bg-globe-light text-globe-navy hover:bg-globe-navy/5'
                    }`}
                  >
                    {service.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-globe-red to-[#a02f2f] hover:from-[#a02f2f] hover:to-globe-red text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
              <Button 
                onClick={handleExport}
                variant="outline"
                className="border-globe-navy/20 hover:bg-globe-navy/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-globe-navy/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-globe-navy text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Services</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-globe-red border-t-transparent"></div>
                        <span className="ml-3 text-globe-navy">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : !messages || messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun message trouvé
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id} className="hover:bg-globe-light transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-globe-navy">
                        {new Intl.DateTimeFormat('fr-FR').format(new Date(message.date_envoi))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-globe-navy">
                          {message.prenom} {message.nom}
                        </div>
                        <div className="text-sm text-gray-600">{message.telephone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-globe-navy">
                        {message.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-globe-navy">
                          {getServicesString(message)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-globe-navy max-w-xs truncate">
                          {message.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessage(message.id)}
                            className="border-globe-navy/20 hover:bg-globe-navy/5"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                            className="border-globe-red/20 text-globe-red hover:bg-globe-red/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-globe-light border-t border-globe-navy/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-globe-navy">
                  Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} résultats
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="border-globe-navy/20 hover:bg-globe-navy/5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 bg-globe-navy text-white rounded-lg font-medium">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="border-globe-navy/20 hover:bg-globe-navy/5"
                  >
                    <ChevronRight className="h-4 w-4" />
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

'use client';

import { ContactMessage } from '../types/message';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

interface MessageDetailModalProps {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageDetailModal({ message, isOpen, onClose }: MessageDetailModalProps) {
  if (!message) return null;

  const services = [];
  if (message.installation) services.push('Installation');
  if (message.maintenance) services.push('Maintenance');
  if (message.surveillance) services.push('Surveillance');
  if (message.consultation) services.push('Consultation');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-globe-navy/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-globe-navy">
            Message #{message.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Informations de contact */}
          <div className="bg-globe-light p-4 rounded-lg border border-globe-navy/10">
            <h3 className="font-semibold text-globe-navy mb-3 text-lg">Informations de contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                <p className="font-medium text-globe-navy">{message.prenom} {message.nom}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-globe-red" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-globe-navy">{message.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-globe-red" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-globe-navy">{message.telephone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-globe-red" />
                <div>
                  <p className="text-sm text-gray-600">Date d&apos;envoi</p>
                  <p className="font-medium text-globe-navy">
                    {new Intl.DateTimeFormat('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(message.date_envoi))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services demandés */}
          <div className="bg-globe-light p-4 rounded-lg border border-globe-navy/10">
            <h3 className="font-semibold text-globe-navy mb-3 text-lg">Services demandés</h3>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 ? (
                services.map((service) => (
                  <span 
                    key={service} 
                    className="px-4 py-2 bg-gradient-to-r from-globe-red to-[#a02f2f] text-white rounded-lg font-medium shadow-md"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Aucun service spécifique</span>
              )}
            </div>
          </div>

          {/* Message */}
          {message.message && (
            <div className="bg-globe-light p-4 rounded-lg border border-globe-navy/10">
              <h3 className="font-semibold text-globe-navy mb-3 text-lg">Message</h3>
              <div className="bg-white p-4 rounded-lg border border-globe-navy/10">
                <p className="text-globe-navy whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            </div>
          )}

          {/* Préférences */}
          <div className="bg-globe-light p-4 rounded-lg border border-globe-navy/10">
            <h3 className="font-semibold text-globe-navy mb-3 text-lg">Préférences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-globe-navy/10">
                <span className="text-globe-navy font-medium">Recevoir des offres</span>
                <div className="flex items-center gap-2">
                  {message.recevoir_offres ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Oui</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Non</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-globe-navy/10">
                <span className="text-globe-navy font-medium">Conditions acceptées</span>
                <div className="flex items-center gap-2">
                  {message.accepte_conditions ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Oui</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 font-medium">Non</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="bg-globe-light p-4 rounded-lg border border-globe-navy/10">
            <h3 className="font-semibold text-globe-navy mb-3 text-lg">Informations techniques</h3>
            <div className="bg-white p-3 rounded-lg border border-globe-navy/10">
              <p className="text-xs text-gray-600 break-all font-mono">
                {message.user_agent}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

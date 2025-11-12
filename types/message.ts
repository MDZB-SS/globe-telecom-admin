export interface ContactMessage {
  id: string; // UUID maintenant
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  
  // Type de client
  clientType: 'residentiel' | 'entreprise';
  
  // Services résidentiels
  cameras_residentiel?: boolean;
  alarme_residentiel?: boolean;
  domotique?: boolean;
  interphone?: boolean;
  wifi_residentiel?: boolean;
  
  // Services entreprise
  portails_motorises?: boolean;
  securite_commerciale?: boolean;
  controle_acces?: boolean;
  gestion_reseau?: boolean;
  
  // Services généraux
  maintenance?: boolean;
  consultation?: boolean;
  
  // Informations supplémentaires
  type_propriete?: string;
  budget?: string;
  urgence?: string;
  
  // Message et préférences
  message?: string;
  newsletter?: boolean;
  consentement: boolean;
  
  // Métadonnées
  status?: 'nouveau' | 'en_cours' | 'traite' | 'ferme' | 'annule';
  priority?: 'basse' | 'normal' | 'haute' | 'urgent';
  assigned_to?: string;
  notes?: string;
  
  // Timestamps (utiliser created_at au lieu de date_envoi)
  created_at: string;
  updated_at?: string;
  responded_at?: string;
  closed_at?: string;
  
  // Pour compatibilité avec l'ancien code
  date_envoi?: string; // Alias de created_at
  recevoir_offres?: boolean; // Alias de newsletter
  accepte_conditions?: boolean; // Alias de consentement
}

export interface MessageFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  services?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MessagesResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  totalPages: number;
}
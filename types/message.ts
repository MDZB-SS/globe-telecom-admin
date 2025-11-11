export interface ContactMessage {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  installation: boolean;
  maintenance: boolean;
  surveillance: boolean;
  consultation: boolean;
  message: string;
  recevoir_offres: boolean;
  accepte_conditions: boolean;
  date_envoi: string;
  ip_address: string;
  user_agent: string;
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
/**
 * Utilitaires pour le formatage de dates qui évitent les erreurs d'hydratation
 */

/**
 * Formate une date de manière stable pour éviter les différences serveur/client
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Options par défaut stables
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  // Utiliser une locale fixe pour éviter les différences
  return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(dateObj);
}

/**
 * Formate une date courte (jour/mois)
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, { day: '2-digit', month: 'short' });
}

/**
 * Formate une heure (HH:MM)
 */
export function formatTime(date: string | Date): string {
  return formatDate(date, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formate une date complète avec heure
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


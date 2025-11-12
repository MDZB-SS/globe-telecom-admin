import db from '../db';
import cache from '../cache';
import { ContactMessage, MessageFilters, PaginationParams, MessagesResponse } from '../../types/message';

export class MessageService {
  static async getMessages(
    filters: MessageFilters = {},
    pagination: PaginationParams
  ): Promise<MessagesResponse> {
    // Check cache first (only for simple queries without complex filters)
    const isSimpleQuery = !filters.search && !filters.dateFrom && !filters.dateTo && !filters.services;
    const cacheKey = cache.generateMessagesKey(filters, pagination);
    
    if (isSimpleQuery) {
      const cachedResult = cache.get<MessagesResponse>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const { page, limit, sortBy = 'date_envoi', sortOrder = 'desc' } = pagination;
    const { search, dateFrom, dateTo, services } = filters;

    // Build WHERE clause
    const whereConditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        LOWER(prenom) LIKE LOWER($${paramCount}) OR 
        LOWER(nom) LIKE LOWER($${paramCount}) OR 
        LOWER(email) LIKE LOWER($${paramCount}) OR 
        LOWER(message) LIKE LOWER($${paramCount})
      )`);
      params.push(`%${search}%`);
    }

    // Date filters (utiliser created_at maintenant)
    if (dateFrom) {
      paramCount++;
      whereConditions.push(`created_at >= $${paramCount}`);
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereConditions.push(`created_at <= $${paramCount}`);
      params.push(dateTo);
    }

    // Services filter - adapter pour la nouvelle structure
    if (services && services.length > 0) {
      // Valider les noms de services pour éviter les injections SQL
      const validServices = [
        'cameras_residentiel', 'alarme_residentiel', 'domotique', 'interphone', 'wifi_residentiel',
        'portails_motorises', 'securite_commerciale', 'controle_acces', 'gestion_reseau',
        'maintenance', 'consultation'
      ];
      const filteredServices = services.filter(s => validServices.includes(s));
      
      if (filteredServices.length > 0) {
        const serviceConditions = filteredServices.map((service) => {
          paramCount++;
          params.push(true);
          return `${service} = $${paramCount}`;
        });
        whereConditions.push(`(${serviceConditions.join(' OR ')})`);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Execute both queries in parallel for better performance
    const allowedSortFields = ['date_envoi', 'prenom', 'nom', 'email'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'date_envoi';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Prepare pagination parameters
    const limitParam = paramCount + 1;
    const offsetParam = paramCount + 2;
    params.push(limit, (page - 1) * limit);

    // Mapper le tri pour la nouvelle structure
    const sortFieldMap: { [key: string]: string } = {
      'date_envoi': 'created_at',
      'prenom': 'prenom',
      'nom': 'nom',
      'email': 'email'
    };
    const mappedSortBy = sortFieldMap[safeSortBy] || 'created_at';

    // Execute count and data queries in parallel
    const [countResult, dataResult] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM public.contact_requests WHERE ${whereClause}`, params.slice(0, paramCount)),
      db.query(`
        SELECT 
          id, prenom, nom, email, telephone, clientType,
          cameras_residentiel, alarme_residentiel, domotique, interphone, wifi_residentiel,
          portails_motorises, securite_commerciale, controle_acces, gestion_reseau,
          maintenance, consultation,
          type_propriete, budget, urgence,
          message, newsletter, consentement,
          status, priority, assigned_to, notes,
          created_at, updated_at, responded_at, closed_at,
          created_at as date_envoi,
          newsletter as recevoir_offres,
          consentement as accepte_conditions
        FROM public.contact_requests 
        WHERE ${whereClause}
        ORDER BY ${mappedSortBy} ${safeSortOrder}
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `, params)
    ]);

    const total = parseInt(countResult.rows[0].count);
    
    const result = {
      messages: dataResult.rows as ContactMessage[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Cache simple queries for 30 seconds
    if (isSimpleQuery) {
      cache.set(cacheKey, result, 30000);
    }

    return result;
  }

  static async getMessageById(id: string): Promise<ContactMessage | null> {
    const query = `
      SELECT 
        id, prenom, nom, email, telephone, clientType,
        cameras_residentiel, alarme_residentiel, domotique, interphone, wifi_residentiel,
        portails_motorises, securite_commerciale, controle_acces, gestion_reseau,
        maintenance, consultation,
        type_propriete, budget, urgence,
        message, newsletter, consentement,
        status, priority, assigned_to, notes,
        created_at, updated_at, responded_at, closed_at,
        created_at as date_envoi,
        newsletter as recevoir_offres,
        consentement as accepte_conditions
      FROM public.contact_requests
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async deleteMessage(id: string): Promise<boolean> {
    const query = 'DELETE FROM public.contact_requests WHERE id = $1';
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async exportToCSV(filters: MessageFilters = {}): Promise<ContactMessage[]> {
    const { search, dateFrom, dateTo, services } = filters;

    let query = `
      SELECT 
        id, prenom, nom, email, telephone, clientType,
        cameras_residentiel, alarme_residentiel, domotique, interphone, wifi_residentiel,
        portails_motorises, securite_commerciale, controle_acces, gestion_reseau,
        maintenance, consultation,
        type_propriete, budget, urgence,
        message, newsletter, consentement,
        status, priority, assigned_to, notes,
        created_at, updated_at, responded_at, closed_at,
        created_at as date_envoi,
        newsletter as recevoir_offres,
        consentement as accepte_conditions
      FROM public.contact_requests
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(prenom) LIKE LOWER($${paramCount}) OR 
        LOWER(nom) LIKE LOWER($${paramCount}) OR 
        LOWER(email) LIKE LOWER($${paramCount}) OR 
        LOWER(message) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (dateFrom) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(dateTo);
    }

    if (services && services.length > 0) {
      // Valider les noms de services pour éviter les injections SQL
      const validServices = [
        'cameras_residentiel', 'alarme_residentiel', 'domotique', 'interphone', 'wifi_residentiel',
        'portails_motorises', 'securite_commerciale', 'controle_acces', 'gestion_reseau',
        'maintenance', 'consultation'
      ];
      const filteredServices = services.filter(s => validServices.includes(s));
      
      if (filteredServices.length > 0) {
        const serviceConditions = filteredServices.map((service) => {
          paramCount++;
          params.push(true);
          return `${service} = $${paramCount}`;
        });
        query += ` AND (${serviceConditions.join(' OR ')})`;
      }
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows as ContactMessage[];
  }
}
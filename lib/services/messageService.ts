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

    // Date filters
    if (dateFrom) {
      paramCount++;
      whereConditions.push(`date_envoi >= $${paramCount}`);
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereConditions.push(`date_envoi <= $${paramCount}`);
      params.push(dateTo);
    }

    // Services filter
    if (services && services.length > 0) {
      const serviceConditions = services.map((service) => {
        paramCount++;
        params.push(true);
        return `${service} = $${paramCount}`;
      });
      whereConditions.push(`(${serviceConditions.join(' OR ')})`);
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

    // Execute count and data queries in parallel
    const [countResult, dataResult] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM globetelecom.messages_contact WHERE ${whereClause}`, params.slice(0, paramCount)),
      db.query(`
        SELECT id, prenom, nom, email, telephone, installation, maintenance, 
               surveillance, consultation, message, recevoir_offres, 
               accepte_conditions, date_envoi, ip_address, user_agent
        FROM globetelecom.messages_contact 
        WHERE ${whereClause}
        ORDER BY ${safeSortBy} ${safeSortOrder}
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

  static async getMessageById(id: number): Promise<ContactMessage | null> {
    const query = `
      SELECT id, prenom, nom, email, telephone, installation, maintenance, 
             surveillance, consultation, message, recevoir_offres, 
             accepte_conditions, date_envoi, ip_address, user_agent
      FROM globetelecom.messages_contact
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async deleteMessage(id: number): Promise<boolean> {
    const query = 'DELETE FROM globetelecom.messages_contact WHERE id = $1';
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async exportToCSV(filters: MessageFilters = {}): Promise<ContactMessage[]> {
    const { search, dateFrom, dateTo, services } = filters;

    let query = `
      SELECT id, prenom, nom, email, telephone, installation, maintenance, 
             surveillance, consultation, message, recevoir_offres, 
             accepte_conditions, date_envoi, ip_address, user_agent
      FROM globetelecom.messages_contact
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
      query += ` AND date_envoi >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND date_envoi <= $${paramCount}`;
      params.push(dateTo);
    }

    if (services && services.length > 0) {
      const serviceConditions = services.map((service) => {
        paramCount++;
        params.push(true);
        return `${service} = $${paramCount}`;
      });
      query += ` AND (${serviceConditions.join(' OR ')})`;
    }

    query += ' ORDER BY date_envoi DESC';

    const result = await db.query(query, params);
    return result.rows as ContactMessage[];
  }
}
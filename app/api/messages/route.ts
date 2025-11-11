import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '../../../lib/services/messageService';
import { MessageFilters, PaginationParams } from '../../../types/message';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'date_envoi';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const search = searchParams.get('search') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const servicesParam = searchParams.get('services');
    const services = servicesParam ? servicesParam.split(',') : undefined;
    const exportCsv = searchParams.get('export') === 'csv';

    const filters: MessageFilters = {
      search,
      dateFrom,
      dateTo,
      services,
    };

    if (exportCsv) {
      const messages = await MessageService.exportToCSV(filters);
      
      // Préparer les données CSV
      const csvData = messages.map(msg => ({
        id: msg.id,
        date_envoi: new Date(msg.date_envoi).toLocaleString('fr-FR'),
        prenom: msg.prenom,
        nom: msg.nom,
        email: msg.email,
        telephone: msg.telephone || '',
        services: [
          msg.installation && 'Installation',
          msg.maintenance && 'Maintenance',
          msg.surveillance && 'Surveillance',
          msg.consultation && 'Consultation',
        ].filter(Boolean).join(', '),
        message: msg.message || '',
        recevoir_offres: msg.recevoir_offres ? 'Oui' : 'Non',
        accepte_conditions: msg.accepte_conditions ? 'Oui' : 'Non'
      }));

      // Créer l'en-tête CSV
      const headers = [
        'ID',
        'Date d\'envoi',
        'Prénom',
        'Nom',
        'Email',
        'Téléphone',
        'Services',
        'Message',
        'Recevoir offres',
        'Accepte conditions'
      ];

      // Convertir en CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => [
          row.id,
          `"${row.date_envoi}"`,
          `"${row.prenom}"`,
          `"${row.nom}"`,
          `"${row.email}"`,
          `"${row.telephone}"`,
          `"${row.services}"`,
          `"${row.message.replace(/"/g, '""')}"`,
          `"${row.recevoir_offres}"`,
          `"${row.accepte_conditions}"`
        ].join(','))
      ].join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="messages_contact.csv"',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const pagination: PaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await MessageService.getMessages(filters, pagination);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
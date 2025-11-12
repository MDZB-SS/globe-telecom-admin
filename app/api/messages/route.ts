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
      const csvData = messages.map(msg => {
        const services = [];
        if (msg.cameras_residentiel) services.push('Caméras Résidentiel');
        if (msg.alarme_residentiel) services.push('Alarme Résidentiel');
        if (msg.domotique) services.push('Domotique');
        if (msg.interphone) services.push('Interphone');
        if (msg.wifi_residentiel) services.push('WiFi Résidentiel');
        if (msg.portails_motorises) services.push('Portails Motorisés');
        if (msg.securite_commerciale) services.push('Sécurité Commerciale');
        if (msg.controle_acces) services.push('Contrôle d\'Accès');
        if (msg.gestion_reseau) services.push('Gestion Réseau');
        if (msg.maintenance) services.push('Maintenance');
        if (msg.consultation) services.push('Consultation');
        
        return {
          id: msg.id,
          date_envoi: new Date(msg.created_at || msg.date_envoi || '').toLocaleString('fr-FR'),
          prenom: msg.prenom,
          nom: msg.nom,
          email: msg.email,
          telephone: msg.telephone || '',
          clientType: msg.clientType || '',
          services: services.join(', '),
          message: msg.message || '',
          recevoir_offres: (msg.newsletter || msg.recevoir_offres) ? 'Oui' : 'Non',
          accepte_conditions: (msg.consentement || msg.accepte_conditions) ? 'Oui' : 'Non'
        };
      });

      // Créer l'en-tête CSV
      const headers = [
        'ID',
        'Date d\'envoi',
        'Prénom',
        'Nom',
        'Email',
        'Téléphone',
        'Type Client',
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
          `"${row.clientType}"`,
          `"${row.services}"`,
          `"${(row.message || '').replace(/"/g, '""')}"`,
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
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Message d'erreur plus informatif pour le client
    let errorMessage = 'Erreur de connexion à la base de données';
    if (error.code === 'EACCES' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Impossible de se connecter à la base de données. Vérifiez que PostgreSQL est accessible.';
    } else if (error.code === '28P01') {
      errorMessage = 'Erreur d\'authentification. Vérifiez les identifiants de connexion.';
    } else if (error.message?.includes('does not exist')) {
      errorMessage = 'Base de données ou table introuvable. Vérifiez la structure de la base de données.';
    }
    
    // Retourner une réponse avec un tableau vide pour éviter de casser l'interface
    return NextResponse.json(
      { 
        messages: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 200 } // Status 200 pour que l'interface puisse afficher l'erreur
    );
  }
}
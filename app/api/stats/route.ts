import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API Stats - Début');

    // 1. Total messages
    const totalResult = await db.query('SELECT COUNT(*) as total FROM public.contact_requests');
    const total = parseInt(totalResult?.rows?.[0]?.total || '0', 10);

    // 2. Messages aujourd'hui
    const todayResult = await db.query(`
      SELECT COUNT(*) as today 
      FROM public.contact_requests 
      WHERE created_at::date = CURRENT_DATE
    `);
    const today = parseInt(todayResult?.rows?.[0]?.today || '0', 10);

    // 3. Messages cette semaine
    const weekResult = await db.query(`
      SELECT COUNT(*) as week 
      FROM public.contact_requests 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);
    const week = parseInt(weekResult?.rows?.[0]?.week || '0', 10);

    // 4. Taux d'acceptation conditions
    const acceptanceResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN consentement = true THEN 1 END) as accepted,
        COUNT(*) as total
      FROM public.contact_requests
    `);
    const acceptanceRate = total > 0 ? 
      Math.round(((acceptanceResult?.rows?.[0]?.accepted || 0) / total) * 100 * 10) / 10 : 0;

    // 5. Taux d'acceptation des offres
    const offersResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN newsletter = true THEN 1 END) as accepted,
        COUNT(*) as total
      FROM public.contact_requests
    `);
    const offersRate = total > 0 ? 
      Math.round(((offersResult?.rows?.[0]?.accepted || 0) / total) * 100 * 10) / 10 : 0;

    // 6. Messages par jour (30 derniers jours)
    const dailyResult = await db.query(`
      SELECT 
        created_at::date as date,
        COUNT(*) as messages
      FROM public.contact_requests 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY created_at::date 
      ORDER BY created_at::date DESC
      LIMIT 30
    `);

    // S'assurer qu'on a des données pour les graphiques même si peu de messages
    let dailyData = (dailyResult?.rows || []).map(row => {
      const date = row.date ? new Date(row.date) : new Date();
      const messages = parseInt(row.messages || '0', 10);
      return {
        date: row.date || date.toISOString().split('T')[0],
        messages: isNaN(messages) ? 0 : messages,
        dateFormatted: date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      };
    }).reverse();

    // Si moins de 7 jours de données, compléter avec les jours manquants
    // Toujours s'assurer d'avoir au moins 7 jours de données pour le graphique
    if (dailyData.length < 7) {
      const missingDays = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!dailyData.find(d => d && d.date === dateStr)) {
          const formattedDate = date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
          missingDays.push({
            date: dateStr,
            messages: 0,
            dateFormatted: formattedDate || `${date.getDate()}/${date.getMonth() + 1}`
          });
        }
      }
      dailyData = [...missingDays, ...dailyData].slice(-7);
    }
    
    // S'assurer que dailyData est trié par date
    dailyData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('📊 Daily data préparé:', dailyData.length, 'jours');

    // 7. Répartition des services
    const servicesResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN cameras_residentiel = true THEN 1 END) as cameras_residentiel,
        COUNT(CASE WHEN alarme_residentiel = true THEN 1 END) as alarme_residentiel,
        COUNT(CASE WHEN domotique = true THEN 1 END) as domotique,
        COUNT(CASE WHEN interphone = true THEN 1 END) as interphone,
        COUNT(CASE WHEN wifi_residentiel = true THEN 1 END) as wifi_residentiel,
        COUNT(CASE WHEN portails_motorises = true THEN 1 END) as portails_motorises,
        COUNT(CASE WHEN securite_commerciale = true THEN 1 END) as securite_commerciale,
        COUNT(CASE WHEN controle_acces = true THEN 1 END) as controle_acces,
        COUNT(CASE WHEN gestion_reseau = true THEN 1 END) as gestion_reseau,
        COUNT(CASE WHEN maintenance = true THEN 1 END) as maintenance,
        COUNT(CASE WHEN consultation = true THEN 1 END) as consultation
      FROM public.contact_requests
    `);

    const row = servicesResult?.rows?.[0] || {};
    const servicesData = [
      { name: 'Caméras Résidentiel', value: parseInt(row.cameras_residentiel || '0', 10) || 0, color: '#3B82F6' },
      { name: 'Alarme Résidentiel', value: parseInt(row.alarme_residentiel || '0', 10) || 0, color: '#10B981' },
      { name: 'Domotique', value: parseInt(row.domotique || '0', 10) || 0, color: '#F59E0B' },
      { name: 'Interphone', value: parseInt(row.interphone || '0', 10) || 0, color: '#8B5CF6' },
      { name: 'WiFi Résidentiel', value: parseInt(row.wifi_residentiel || '0', 10) || 0, color: '#06B6D4' },
      { name: 'Portails Motorisés', value: parseInt(row.portails_motorises || '0', 10) || 0, color: '#EF4444' },
      { name: 'Sécurité Commerciale', value: parseInt(row.securite_commerciale || '0', 10) || 0, color: '#EC4899' },
      { name: 'Contrôle d\'Accès', value: parseInt(row.controle_acces || '0', 10) || 0, color: '#14B8A6' },
      { name: 'Gestion Réseau', value: parseInt(row.gestion_reseau || '0', 10) || 0, color: '#6366F1' },
      { name: 'Maintenance', value: parseInt(row.maintenance || '0', 10) || 0, color: '#F97316' },
      { name: 'Consultation', value: parseInt(row.consultation || '0', 10) || 0, color: '#84CC16' }
    ].filter(service => service && service.value > 0); // Enlever les services à 0 pour un graphique plus propre

    // 8. Messages par heure (aujourd'hui)
    const hourlyResult = await db.query(`
      SELECT 
        EXTRACT(hour FROM created_at) as hour,
        COUNT(*) as messages
      FROM public.contact_requests 
      WHERE created_at::date = CURRENT_DATE
      GROUP BY EXTRACT(hour FROM created_at)
      ORDER BY hour
    `);

    const hourlyMap: { [key: number]: number } = {};
    (hourlyResult?.rows || []).forEach(row => {
      hourlyMap[parseInt(row.hour)] = parseInt(row.messages);
    });

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}h`,
      messages: hourlyMap[hour] || 0
    }));

    // 9. Domaines email les plus fréquents
    const domainsResult = await db.query(`
      SELECT 
        SPLIT_PART(email, '@', 2) as domain,
        COUNT(*) as count
      FROM public.contact_requests 
      WHERE email IS NOT NULL AND email != ''
      GROUP BY SPLIT_PART(email, '@', 2)
      ORDER BY count DESC
      LIMIT 5
    `);

    const domainsData = (domainsResult?.rows || []).map(row => ({
      domain: row.domain,
      count: parseInt(row.count)
    }));

    // Si pas de domaines, ajouter un message explicatif
    if (domainsData.length === 0) {
      domainsData.push({ domain: 'Aucune donnée', count: 0 });
    }

    // 10. Activité récente (5 derniers messages)
    const recentResult = await db.query(`
      SELECT 
        id, prenom, nom, email, created_at,
        cameras_residentiel, alarme_residentiel, domotique, interphone, wifi_residentiel,
        portails_motorises, securite_commerciale, controle_acces, gestion_reseau,
        maintenance, consultation
      FROM public.contact_requests 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    const recentActivity = (recentResult?.rows || []).map(row => {
      const services = [];
      if (row.cameras_residentiel) services.push('Caméras Résidentiel');
      if (row.alarme_residentiel) services.push('Alarme Résidentiel');
      if (row.domotique) services.push('Domotique');
      if (row.interphone) services.push('Interphone');
      if (row.wifi_residentiel) services.push('WiFi Résidentiel');
      if (row.portails_motorises) services.push('Portails Motorisés');
      if (row.securite_commerciale) services.push('Sécurité Commerciale');
      if (row.controle_acces) services.push('Contrôle d\'Accès');
      if (row.gestion_reseau) services.push('Gestion Réseau');
      if (row.maintenance) services.push('Maintenance');
      if (row.consultation) services.push('Consultation');

      return {
        id: row.id,
        name: `${row.prenom} ${row.nom}`,
        email: row.email,
        date: row.created_at,
        services
      };
    });

    const stats = {
      metrics: {
        total,
        today,
        week,
        acceptanceRate,
        offersRate,
        avgPerDay: Math.round((total / 30) * 10) / 10,
        todayTrend: today
      },
      charts: {
        daily: dailyData,
        services: servicesData,
        hourly: hourlyData,
        domains: domainsData
      },
      recentActivity
    };

    console.log('✅ Statistiques générées avec vraies données');
    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('❌ Erreur API Stats:', error);
    
    // Message d'erreur plus informatif pour le client
    let errorMessage = 'Erreur de connexion à la base de données';
    if (error.code === 'EACCES' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Impossible de se connecter à la base de données. Vérifiez que PostgreSQL est accessible.';
    } else if (error.code === '28P01') {
      errorMessage = 'Erreur d\'authentification. Vérifiez les identifiants de connexion.';
    } else if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('schema')) {
      // Vérifier si c'est spécifiquement la table qui manque
      if (error.message?.includes('contact_requests')) {
        errorMessage = 'La table "contact_requests" n\'existe pas dans le schéma "public". Exécutez le script SQL de création de table fourni.';
      } else if (error.message?.includes('public')) {
        errorMessage = 'Le schéma "public" n\'existe pas. Vérifiez la configuration de la base de données.';
      } else {
        errorMessage = 'Base de données ou table introuvable. La table "contact_requests" doit exister dans le schéma "public".';
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur', 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
        hint: error.message?.includes('does not exist') ? 'Exécutez le script SQL de création de table que vous avez fourni pour créer la table contact_requests.' : undefined
      },
      { status: 500 }
    );
  }
}
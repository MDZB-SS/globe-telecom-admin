import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API Stats - Début');

    // 1. Total messages
    const totalResult = await db.query('SELECT COUNT(*) as total FROM globetelecom.messages_contact');
    const total = parseInt(totalResult.rows[0].total);

    // 2. Messages aujourd'hui
    const todayResult = await db.query(`
      SELECT COUNT(*) as today 
      FROM globetelecom.messages_contact 
      WHERE date_envoi::date = CURRENT_DATE
    `);
    const today = parseInt(todayResult.rows[0].today);

    // 3. Messages cette semaine
    const weekResult = await db.query(`
      SELECT COUNT(*) as week 
      FROM globetelecom.messages_contact 
      WHERE date_envoi >= CURRENT_DATE - INTERVAL '7 days'
    `);
    const week = parseInt(weekResult.rows[0].week);

    // 4. Taux d'acceptation conditions
    const acceptanceResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN accepte_conditions = true THEN 1 END) as accepted,
        COUNT(*) as total
      FROM globetelecom.messages_contact
    `);
    const acceptanceRate = total > 0 ? 
      Math.round((acceptanceResult.rows[0].accepted / total) * 100 * 10) / 10 : 0;

    // 5. Taux d'acceptation des offres
    const offersResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN recevoir_offres = true THEN 1 END) as accepted,
        COUNT(*) as total
      FROM globetelecom.messages_contact
    `);
    const offersRate = total > 0 ? 
      Math.round((offersResult.rows[0].accepted / total) * 100 * 10) / 10 : 0;

    // 6. Messages par jour (30 derniers jours)
    const dailyResult = await db.query(`
      SELECT 
        date_envoi::date as date,
        COUNT(*) as messages
      FROM globetelecom.messages_contact 
      WHERE date_envoi >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date_envoi::date 
      ORDER BY date_envoi::date DESC
      LIMIT 30
    `);

    // S'assurer qu'on a des données pour les graphiques même si peu de messages
    let dailyData = dailyResult.rows.map(row => ({
      date: row.date,
      messages: parseInt(row.messages),
      dateFormatted: new Date(row.date).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    })).reverse();

    // Si moins de 7 jours de données, compléter avec les jours manquants
    if (dailyData.length < 7) {
      const missingDays = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!dailyData.find(d => d.date === dateStr)) {
          missingDays.push({
            date: dateStr,
            messages: 0,
            dateFormatted: date.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit' 
            })
          });
        }
      }
      dailyData = [...missingDays, ...dailyData].slice(-7);
    }

    // 7. Répartition des services
    const servicesResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN installation = true THEN 1 END) as installation,
        COUNT(CASE WHEN maintenance = true THEN 1 END) as maintenance,
        COUNT(CASE WHEN surveillance = true THEN 1 END) as surveillance,
        COUNT(CASE WHEN consultation = true THEN 1 END) as consultation
      FROM globetelecom.messages_contact
    `);

    const servicesData = [
      { name: 'Installation', value: parseInt(servicesResult.rows[0].installation), color: '#3B82F6' },
      { name: 'Maintenance', value: parseInt(servicesResult.rows[0].maintenance), color: '#10B981' },
      { name: 'Surveillance', value: parseInt(servicesResult.rows[0].surveillance), color: '#F59E0B' },
      { name: 'Consultation', value: parseInt(servicesResult.rows[0].consultation), color: '#EF4444' }
    ].filter(service => service.value > 0); // Enlever les services à 0 pour un graphique plus propre

    // 8. Messages par heure (aujourd'hui)
    const hourlyResult = await db.query(`
      SELECT 
        EXTRACT(hour FROM date_envoi) as hour,
        COUNT(*) as messages
      FROM globetelecom.messages_contact 
      WHERE date_envoi::date = CURRENT_DATE
      GROUP BY EXTRACT(hour FROM date_envoi)
      ORDER BY hour
    `);

    const hourlyMap: { [key: number]: number } = {};
    hourlyResult.rows.forEach(row => {
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
      FROM globetelecom.messages_contact 
      WHERE email IS NOT NULL AND email != ''
      GROUP BY SPLIT_PART(email, '@', 2)
      ORDER BY count DESC
      LIMIT 5
    `);

    const domainsData = domainsResult.rows.map(row => ({
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
        id, prenom, nom, email, date_envoi,
        installation, maintenance, surveillance, consultation
      FROM globetelecom.messages_contact 
      ORDER BY date_envoi DESC 
      LIMIT 5
    `);

    const recentActivity = recentResult.rows.map(row => {
      const services = [];
      if (row.installation) services.push('Installation');
      if (row.maintenance) services.push('Maintenance');
      if (row.surveillance) services.push('Surveillance');
      if (row.consultation) services.push('Consultation');

      return {
        id: row.id,
        name: `${row.prenom} ${row.nom}`,
        email: row.email,
        date: row.date_envoi,
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

  } catch (error) {
    console.error('❌ Erreur API Stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
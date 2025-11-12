import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { MessageService } from '@/lib/services/messageService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const services = searchParams.get('services');

    // Récupérer les messages filtrés
    const filters: any = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (services) filters.services = services.split(',');

    const messagesResponse = await MessageService.getMessages(filters, { page: 1, limit: 10000 });
    const messages = messagesResponse.messages || [];

    // Créer le PDF avec jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // En-tête avec meilleur design
    doc.setFillColor(185, 55, 55); // #b93737
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('GLOBE TELECOM', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport des Messages de Contact', pageWidth / 2, 28, { align: 'center' });

    yPos = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Informations du rapport dans une boîte stylisée
    const infoBoxY = yPos;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, infoBoxY, contentWidth, 25, 2, 2, 'S');
    
    yPos += 8;
    doc.text(`Généré le: ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, margin + 5, yPos);
    
    yPos += 7;
    if (dateFrom || dateTo) {
      const period = dateFrom && dateTo 
        ? `Du ${format(new Date(dateFrom), 'dd/MM/yyyy', { locale: fr })} au ${format(new Date(dateTo), 'dd/MM/yyyy', { locale: fr })}`
        : dateFrom 
        ? `À partir du ${format(new Date(dateFrom), 'dd/MM/yyyy', { locale: fr })}`
        : `Jusqu'au ${format(new Date(dateTo!), 'dd/MM/yyyy', { locale: fr })}`;
      doc.text(`Période: ${period}`, margin + 5, yPos);
      yPos += 7;
    } else {
      yPos += 7;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de messages: ${messages.length}`, margin + 5, yPos);
    yPos += 20;

    // Tableau des messages
    if (messages.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Aucun message trouvé pour les critères sélectionnés.', margin, yPos);
    } else {
      // En-tête du tableau
      const tableTop = yPos;
      const rowHeight = 12;
      const tableWidth = contentWidth;
      
      // Largeurs des colonnes optimisées (total = 180mm pour A4)
      const colWidths = [
        20,  // Date
        38,  // Nom / Prénom
        52,  // Email
        30,  // Téléphone
        40   // Services
      ];
      
      // Calculer les positions de départ des colonnes
      const colStarts = [margin];
      for (let i = 1; i < colWidths.length; i++) {
        colStarts.push(colStarts[i - 1] + colWidths[i - 1]);
      }

      // En-tête du tableau avec ombre
      doc.setFillColor(185, 55, 55);
      doc.roundedRect(margin, tableTop, tableWidth, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const headerY = tableTop + 8;
      doc.text('Date', colStarts[0] + 4, headerY);
      doc.text('Nom / Prénom', colStarts[1] + 4, headerY);
      doc.text('Email', colStarts[2] + 4, headerY);
      doc.text('Téléphone', colStarts[3] + 4, headerY);
      doc.text('Services', colStarts[4] + 4, headerY);

      yPos = tableTop + rowHeight;

      // Lignes du tableau
      messages.forEach((message, index) => {
        // Calculer les services et leur hauteur AVANT de dessiner
        const serviceList: string[] = [];
        if (message.cameras_residentiel) serviceList.push('Caméras');
        if (message.alarme_residentiel) serviceList.push('Alarme');
        if (message.domotique) serviceList.push('Domotique');
        if (message.interphone) serviceList.push('Interphone');
        if (message.wifi_residentiel) serviceList.push('WiFi');
        if (message.portails_motorises) serviceList.push('Portails');
        if (message.securite_commerciale) serviceList.push('Sécurité');
        if (message.controle_acces) serviceList.push('Accès');
        if (message.gestion_reseau) serviceList.push('Réseau');
        if (message.maintenance) serviceList.push('Maint.');
        if (message.consultation) serviceList.push('Consult.');
        
        const servicesStr = serviceList.length > 0 ? serviceList.join(', ') : '-';
        const servicesMaxWidth = colWidths[4] - 8;
        const servicesLines = doc.splitTextToSize(servicesStr, servicesMaxWidth);
        const servicesHeight = Math.max(rowHeight, servicesLines.length * 3.5 + 2);
        const actualRowHeight = servicesHeight;

        // Vérifier si on doit créer une nouvelle page
        if (yPos + actualRowHeight > pageHeight - 20) {
          doc.addPage();
          yPos = margin + 10;
          
          // Réafficher l'en-tête du tableau sur la nouvelle page
          doc.setFillColor(185, 55, 55);
          doc.roundedRect(margin, yPos, tableWidth, rowHeight, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const newHeaderY = yPos + 8;
          doc.text('Date', colStarts[0] + 4, newHeaderY);
          doc.text('Nom / Prénom', colStarts[1] + 4, newHeaderY);
          doc.text('Email', colStarts[2] + 4, newHeaderY);
          doc.text('Téléphone', colStarts[3] + 4, newHeaderY);
          doc.text('Services', colStarts[4] + 4, newHeaderY);
          yPos += rowHeight;
        }

        // Couleur de fond alternée avec la bonne hauteur
        const rowColor = index % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.roundedRect(margin, yPos, tableWidth, actualRowHeight, 0.5, 0.5, 'F');

        // Bordures du tableau
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        // Ligne horizontale du haut
        doc.line(margin, yPos, margin + tableWidth, yPos);
        // Ligne horizontale du bas
        doc.line(margin, yPos + actualRowHeight, margin + tableWidth, yPos + actualRowHeight);
        // Lignes verticales entre colonnes
        for (let i = 1; i < colStarts.length; i++) {
          doc.line(colStarts[i], yPos, colStarts[i], yPos + actualRowHeight);
        }

        // Contenu avec meilleur espacement
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const cellPadding = 5;
        const cellY = yPos + 8;
        
        const date = message.created_at || message.date_envoi;
        const dateStr = date ? format(new Date(date), 'dd/MM/yy', { locale: fr }) : '-';
        doc.text(dateStr, colStarts[0] + cellPadding, cellY, { maxWidth: colWidths[0] - cellPadding * 2 });
        
        const name = `${message.prenom || ''} ${message.nom || ''}`.trim() || '-';
        const nameLines = doc.splitTextToSize(name, colWidths[1] - cellPadding * 2);
        doc.text(nameLines, colStarts[1] + cellPadding, cellY, { maxWidth: colWidths[1] - cellPadding * 2 });
        
        const email = message.email || '-';
        const emailLines = doc.splitTextToSize(email, colWidths[2] - cellPadding * 2);
        doc.text(emailLines, colStarts[2] + cellPadding, cellY, { maxWidth: colWidths[2] - cellPadding * 2 });
        
        const phone = message.telephone || '-';
        doc.text(phone, colStarts[3] + cellPadding, cellY, { maxWidth: colWidths[3] - cellPadding * 2 });
        
        // Afficher les services avec meilleur espacement
        let servicesY = cellY;
        servicesLines.forEach((line: string) => {
          doc.text(line, colStarts[4] + cellPadding, servicesY, { maxWidth: servicesMaxWidth });
          servicesY += 3.5;
        });
        
        // Passer à la ligne suivante
        yPos += actualRowHeight;

      });
    }

    // Pied de page sur toutes les pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} sur ${totalPages} - Globe Telecom`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Générer le PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-globetelecom-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du PDF',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

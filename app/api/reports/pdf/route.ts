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
    const margin = 20;
    let yPos = margin;

    // En-tête
    doc.setFillColor(185, 55, 55); // #b93737
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GLOBE TELECOM', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport des Messages de Contact', pageWidth / 2, 25, { align: 'center' });

    yPos = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le: ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, margin, yPos);
    
    yPos += 10;
    if (dateFrom || dateTo) {
      const period = dateFrom && dateTo 
        ? `Du ${format(new Date(dateFrom), 'dd/MM/yyyy', { locale: fr })} au ${format(new Date(dateTo), 'dd/MM/yyyy', { locale: fr })}`
        : dateFrom 
        ? `À partir du ${format(new Date(dateFrom), 'dd/MM/yyyy', { locale: fr })}`
        : `Jusqu'au ${format(new Date(dateTo!), 'dd/MM/yyyy', { locale: fr })}`;
      doc.text(`Période: ${period}`, margin, yPos);
      yPos += 8;
    }
    
    doc.text(`Total de messages: ${messages.length}`, margin, yPos);
    yPos += 15;

    // Tableau des messages
    if (messages.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Aucun message trouvé pour les critères sélectionnés.', margin, yPos);
    } else {
      // En-tête du tableau
      const tableTop = yPos;
      const rowHeight = 8;
      const colWidths = [25, 50, 60, 30, 25]; // Date, Nom, Email, Téléphone, Services
      const colStarts = [margin];
      for (let i = 1; i < colWidths.length; i++) {
        colStarts.push(colStarts[i - 1] + colWidths[i - 1]);
      }

      // En-tête du tableau
      doc.setFillColor(185, 55, 55);
      doc.rect(margin, tableTop, pageWidth - 2 * margin, rowHeight, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', colStarts[0] + 2, tableTop + 5);
      doc.text('Nom / Prénom', colStarts[1] + 2, tableTop + 5);
      doc.text('Email', colStarts[2] + 2, tableTop + 5);
      doc.text('Téléphone', colStarts[3] + 2, tableTop + 5);
      doc.text('Services', colStarts[4] + 2, tableTop + 5);

      yPos = tableTop + rowHeight;

      // Lignes du tableau
      messages.forEach((message, index) => {
        // Vérifier si on doit créer une nouvelle page
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }

        // Couleur de fond alternée
        const rowColor = index % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');

        // Contenu
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const date = message.created_at || message.date_envoi;
        const dateStr = date ? format(new Date(date), 'dd/MM/yy', { locale: fr }) : '-';
        doc.text(dateStr.substring(0, 8), colStarts[0] + 2, yPos + 5);
        
        const name = `${message.prenom || ''} ${message.nom || ''}`.trim() || '-';
        doc.text(name.substring(0, 25), colStarts[1] + 2, yPos + 5);
        
        doc.text((message.email || '-').substring(0, 30), colStarts[2] + 2, yPos + 5);
        doc.text((message.telephone || '-').substring(0, 12), colStarts[3] + 2, yPos + 5);
        
        // Services
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
        
        const servicesStr = serviceList.length > 0 ? serviceList.join(', ').substring(0, 20) : '-';
        doc.text(servicesStr, colStarts[4] + 2, yPos + 5);

        yPos += rowHeight;
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

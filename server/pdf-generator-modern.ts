import PDFDocument from 'pdfkit';

export function generateModernSWMSPDF(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, left: 40, right: 40, bottom: 40 }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = 842;
      const pageHeight = 595;
      
      // Modern gradient background
      doc.save();
      doc.linearGradient(0, 0, pageWidth, 0)
         .stop(0, '#f8fafc')
         .stop(1, '#f1f5f9');
      doc.rect(0, 0, pageWidth, pageHeight).fill();
      doc.restore();
      
      // Subtle RISKIFY watermark pattern
      doc.save();
      doc.opacity(0.025);
      doc.fontSize(48).fillColor('#64748b').font('Helvetica-Bold');
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
          doc.text('RISKIFY', 50 + (i * 100), 50 + (j * 90), { width: 80, align: 'center' });
        }
      }
      doc.restore();
      
      let yPos = 50;

      // MODERN HEADER SECTION
      doc.save();
      doc.linearGradient(40, yPos, 802, yPos + 80)
         .stop(0, '#1e293b')
         .stop(1, '#334155');
      doc.rect(40, yPos, 762, 80).fill();
      
      // Header text
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('SAFE WORK METHOD STATEMENT', 60, yPos + 15);
      
      doc.fillColor('#94a3b8')
         .fontSize(14)
         .font('Helvetica')
         .text('Professional SWMS Builder | Riskify', 60, yPos + 50);
      
      // Status badge
      doc.save();
      doc.fillColor('#059669')
         .roundedRect(650, yPos + 20, 120, 40, 8)
         .fill();
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('COMPLETED', 665, yPos + 35);
      doc.restore();
      
      doc.restore();
      yPos += 100;

      // PROJECT INFORMATION CARD
      doc.save();
      doc.fillColor('#ffffff')
         .roundedRect(40, yPos, 762, 120, 12)
         .fill();
      
      doc.strokeColor('#e2e8f0')
         .lineWidth(1)
         .roundedRect(40, yPos, 762, 120, 12)
         .stroke();
      
      // Card header
      doc.fillColor('#1e293b')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('PROJECT INFORMATION', 60, yPos + 20);
      
      // Project details in modern grid
      const projectInfo = [
        ['Project Name:', data.projectName || data.title || 'Project Name'],
        ['Location:', data.projectAddress || data.projectLocation || 'Project Location'],
        ['Contractor:', data.principalContractor || 'Principal Contractor'],
        ['Job Number:', data.jobNumber || 'Job Number'],
        ['Trade Type:', data.tradeType || 'Trade Type'],
        ['Date:', new Date().toLocaleDateString('en-AU')]
      ];
      
      let gridX = 60;
      let gridY = yPos + 50;
      
      for (let i = 0; i < projectInfo.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        
        const x = gridX + (col * 240);
        const y = gridY + (row * 25);
        
        doc.fillColor('#64748b')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(projectInfo[i][0], x, y);
           
        doc.fillColor('#1e293b')
           .fontSize(10)
           .font('Helvetica')
           .text(projectInfo[i][1], x + 80, y, { width: 150 });
      }
      doc.restore();
      yPos += 140;

      // RISK ASSESSMENT TABLE
      doc.save();
      doc.fillColor('#ffffff')
         .roundedRect(40, yPos, 762, 300, 12)
         .fill();
      
      doc.strokeColor('#e2e8f0')
         .lineWidth(1)
         .roundedRect(40, yPos, 762, 300, 12)
         .stroke();
      
      // Table header
      doc.fillColor('#1e293b')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('WORK ACTIVITIES & RISK ASSESSMENT', 60, yPos + 20);
      
      // Modern table headers
      const tableY = yPos + 50;
      const headerHeight = 35;
      
      doc.save();
      doc.linearGradient(60, tableY, 782, tableY)
         .stop(0, '#f1f5f9')
         .stop(1, '#e2e8f0');
      doc.rect(60, tableY, 722, headerHeight).fill();
      
      const headers = [
        { text: 'Activity/Item', width: 140 },
        { text: 'Hazards/Risks', width: 140 },
        { text: 'Initial Risk', width: 80 },
        { text: 'Control Measures', width: 180 },
        { text: 'Legislation/Codes', width: 100 },
        { text: 'Residual Risk', width: 82 }
      ];
      
      let headerX = 60;
      headers.forEach(header => {
        doc.fillColor('#374151')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(header.text, headerX + 8, tableY + 12, { width: header.width - 16, align: 'center' });
        
        doc.strokeColor('#d1d5db')
           .lineWidth(0.5)
           .moveTo(headerX + header.width, tableY)
           .lineTo(headerX + header.width, tableY + headerHeight)
           .stroke();
        
        headerX += header.width;
      });
      doc.restore();
      
      // Table rows with modern styling
      const activities = data.workActivities || [
        {
          activity: "Site Establishment & Access Control",
          hazards: "Manual handling, Trip hazards, Vehicle movement",
          initialRisk: "M (6)",
          controlMeasures: "Use mechanical aids, Clear walkways, Traffic management plan, PPE required",
          legislation: "WHS Regulation 2017",
          residualRisk: "L (2)"
        }
      ];
      
      let rowY = tableY + headerHeight;
      activities.slice(0, 5).forEach((activity: any, index: number) => {
        const rowHeight = 40;
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.fillColor('#f8fafc')
             .rect(60, rowY, 722, rowHeight)
             .fill();
        }
        
        // Risk level color coding
        const getRiskColor = (risk: string) => {
          if (risk.includes('L') || risk.includes('LOW')) return '#059669';
          if (risk.includes('M') || risk.includes('MEDIUM')) return '#d97706';
          if (risk.includes('H') || risk.includes('HIGH')) return '#dc2626';
          if (risk.includes('E') || risk.includes('EXTREME')) return '#991b1b';
          return '#6b7280';
        };
        
        let cellX = 60;
        const cellData = [
          activity.activity || 'Activity',
          activity.hazards || 'Hazards',
          activity.initialRisk || 'M (6)',
          activity.controlMeasures || 'Control measures',
          activity.legislation || 'WHS Regulation 2017',
          activity.residualRisk || 'L (2)'
        ];
        
        cellData.forEach((text, cellIndex) => {
          const cellWidth = headers[cellIndex].width;
          
          if (cellIndex === 2 || cellIndex === 5) {
            // Risk score badges
            const riskColor = getRiskColor(text);
            doc.save();
            doc.fillColor(riskColor)
               .roundedRect(cellX + 15, rowY + 10, 50, 20, 10)
               .fill();
            doc.fillColor('#ffffff')
               .fontSize(8)
               .font('Helvetica-Bold')
               .text(text, cellX + 25, rowY + 17, { width: 30, align: 'center' });
            doc.restore();
          } else {
            doc.fillColor('#374151')
               .fontSize(8)
               .font('Helvetica')
               .text(text, cellX + 8, rowY + 8, { 
                 width: cellWidth - 16, 
                 height: rowHeight - 16,
                 align: 'left'
               });
          }
          
          // Cell borders
          doc.strokeColor('#e5e7eb')
             .lineWidth(0.3)
             .moveTo(cellX + cellWidth, rowY)
             .lineTo(cellX + cellWidth, rowY + rowHeight)
             .stroke();
          
          cellX += cellWidth;
        });
        
        // Row border
        doc.strokeColor('#e5e7eb')
           .lineWidth(0.3)
           .moveTo(60, rowY + rowHeight)
           .lineTo(782, rowY + rowHeight)
           .stroke();
        
        rowY += rowHeight;
      });
      
      doc.restore();
      yPos += 320;

      // FOOTER
      doc.save();
      doc.fillColor('#64748b')
         .fontSize(8)
         .font('Helvetica')
         .text(`Generated by Riskify Professional SWMS Builder | ${new Date().toLocaleDateString('en-AU')} ${new Date().toLocaleTimeString('en-AU')}`, 
               40, pageHeight - 30, { width: pageWidth - 80, align: 'center' });
      doc.restore();

      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}
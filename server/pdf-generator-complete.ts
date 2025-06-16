import PDFDocument from 'pdfkit';

export function generateCompleteSWMSPDF(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'portrait',
        margins: { top: 40, left: 40, right: 40, bottom: 40 }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = 595;
      const pageHeight = 842;
      
      // Subtle RISKIFY watermark
      doc.save();
      doc.opacity(0.03);
      doc.fontSize(60).fillColor('#f8fafc').font('Helvetica-Bold');
      doc.text('RISKIFY', pageWidth/2 - 100, pageHeight/2 - 30, { width: 200, align: 'center' });
      doc.restore();
      
      let yPos = 40;

      // MODERN APP HEADER
      doc.fillColor('#f8fafc').rect(40, yPos, 515, 80).fill();
      doc.strokeColor('#e2e8f0').lineWidth(1).rect(40, yPos, 515, 80).stroke();
      
      doc.fontSize(24).fillColor('#1f2937').font('Helvetica-Bold');
      doc.text('Safe Work Method Statement', 60, yPos + 20);
      doc.fontSize(14).fillColor('#6b7280').font('Helvetica');
      doc.text('Professional SWMS Report', 60, yPos + 45);
      
      // Riskify brand badge
      doc.fillColor('#3b82f6').rect(450, yPos + 15, 80, 25).fill();
      doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
      doc.text('RISKIFY', 460, yPos + 22);

      yPos += 100;

      // PROJECT INFORMATION CARD
      doc.fillColor('#ffffff').rect(40, yPos, 515, 140).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 140).stroke();
      
      doc.fillColor('#f8fafc').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#374151').font('Helvetica-Bold');
      doc.text('Project Information', 60, yPos + 15);
      
      const projectInfo = [
        ['Project Name', data.projectName || data.title || 'N/A'],
        ['Project Address', data.projectAddress || data.projectLocation || 'N/A'],
        ['Principal Contractor', data.principalContractor || 'N/A'],
        ['Job Number', data.projectNumber || data.jobNumber || 'N/A'],
        ['Trade Type', data.tradeType || 'General Construction']
      ];
      
      let infoY = yPos + 60;
      projectInfo.forEach(([label, value], index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.fillColor(rowBg).rect(40, infoY, 515, 16).fill();
        
        doc.fontSize(11).fillColor('#6b7280').font('Helvetica-Bold');
        doc.text(label, 60, infoY + 3);
        doc.fontSize(11).fillColor('#1f2937').font('Helvetica');
        doc.text(value, 250, infoY + 3, { width: 280 });
        infoY += 16;
      });

      yPos += 160;

      // RISK ASSESSMENT MATRIX CARD
      doc.fillColor('#ffffff').rect(40, yPos, 515, 200).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 200).stroke();
      
      doc.fillColor('#fef3c7').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#92400e').font('Helvetica-Bold');
      doc.text('Risk Assessment Matrix', 60, yPos + 15);

      const riskLevels = [
        { level: 'Low', color: '#10b981', score: '1-3', action: 'Continue with current controls' },
        { level: 'Medium', color: '#f59e0b', score: '4-9', action: 'Additional controls may be required' },
        { level: 'High', color: '#ef4444', score: '10-15', action: 'Additional controls required' },
        { level: 'Extreme', color: '#7c2d12', score: '16-25', action: 'Stop work - eliminate/substitute' }
      ];

      let riskY = yPos + 60;
      riskLevels.forEach(({ level, color, score, action }, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.fillColor(rowBg).rect(40, riskY, 515, 30).fill();
        
        doc.fillColor(color).rect(60, riskY + 5, 60, 20).fill();
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(level, 70, riskY + 11);
        
        doc.fontSize(10).fillColor('#374151').font('Helvetica-Bold');
        doc.text(`Score: ${score}`, 140, riskY + 8);
        doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
        doc.text(action, 140, riskY + 18, { width: 350 });
        
        riskY += 30;
      });

      // NEW PAGE FOR MAIN SWMS TABLE
      doc.addPage();
      yPos = 40;

      // MAIN SWMS TABLE CARD
      doc.fillColor('#ffffff').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 40).stroke();
      
      doc.fillColor('#dbeafe').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#1e3a8a').font('Helvetica-Bold');
      doc.text('Safe Work Method Statement - Risk Assessment', 60, yPos + 15);

      yPos += 50;

      // EXACT TABLE STRUCTURE FROM SCREENSHOT
      const swmsHeaders = [
        'Activity / Item',
        'Hazards / Risks', 
        'Initial Risk Score',
        'Control Measures / Risk Treatment',
        'Legislation, Codes of Practice, and Guidelines',
        'Residual Risk Score'
      ];
      const swmsColWidths = [85, 90, 55, 110, 120, 55];
      
      let xPos = 40;
      swmsHeaders.forEach((header, i) => {
        doc.fillColor('#374151').rect(xPos, yPos, swmsColWidths[i], 35).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[i], 35).stroke();
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 4, yPos + 8, { width: swmsColWidths[i] - 8, align: 'center' });
        xPos += swmsColWidths[i];
      });
      yPos += 35;

      // SWMS ACTIVITIES DATA
      const swmsActivities = data.workActivities || data.activities || [
        {
          activity: 'Site Setup & Access',
          hazards: 'Manual handling, Trip hazards, Vehicle movement',
          initialRisk: 'M (9)',
          controlMeasures: 'Use mechanical aids, Clear walkways, Traffic management plan, PPE required',
          legislation: 'WHS Act 2011, Manual Handling COP 2018',
          residualRisk: 'L (3)'
        },
        {
          activity: 'Excavation Works',
          hazards: 'Cave-in, Underground services, Machinery operation',
          initialRisk: 'H (12)',
          controlMeasures: 'Dial before you dig, Trench shoring, Exclusion zones, Competent operator',
          legislation: 'WHS Regulation 2017, AS 2885.1',
          residualRisk: 'M (6)'
        },
        {
          activity: 'Construction Activities',
          hazards: 'Falls from height, Falling objects, Electrical hazards',
          initialRisk: 'H (15)',
          controlMeasures: 'Fall protection systems, Safety barriers, Hard hats, Lockout/tagout procedures',
          legislation: 'WHS Regulation 2017, AS/NZS 1891.1, AS/NZS 3000',
          residualRisk: 'L (4)'
        }
      ];

      swmsActivities.forEach((activity: any, index: number) => {
        const rowHeight = 60;
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        if (yPos + rowHeight > 750) {
          doc.addPage();
          yPos = 40;
        }

        xPos = 40;
        
        // Activity / Item
        doc.fillColor(rowBg).rect(xPos, yPos, swmsColWidths[0], rowHeight).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[0], rowHeight).stroke();
        doc.fontSize(9).fillColor('#374151').font('Helvetica-Bold');
        doc.text(activity.activity || `Activity ${index + 1}`, xPos + 4, yPos + 8, { width: swmsColWidths[0] - 8 });
        xPos += swmsColWidths[0];

        // Hazards / Risks
        doc.fillColor(rowBg).rect(xPos, yPos, swmsColWidths[1], rowHeight).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[1], rowHeight).stroke();
        doc.fontSize(8).fillColor('#6b7280').font('Helvetica');
        const hazards = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : activity.hazards || 'General construction hazards';
        doc.text(hazards, xPos + 4, yPos + 8, { width: swmsColWidths[1] - 8 });
        xPos += swmsColWidths[1];

        // Initial Risk Score
        doc.fillColor(rowBg).rect(xPos, yPos, swmsColWidths[2], rowHeight).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[2], rowHeight).stroke();
        const initialRisk = activity.initialRisk || activity.riskLevel || 'M (6)';
        const riskColorMap = { 'L': '#10b981', 'M': '#f59e0b', 'H': '#ef4444', 'E': '#7c2d12' };
        const riskLetter = initialRisk.charAt(0);
        const riskColor = riskColorMap[riskLetter as keyof typeof riskColorMap] || '#f59e0b';
        
        doc.fillColor(riskColor).rect(xPos + 8, yPos + 20, 39, 20).fill();
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(initialRisk, xPos + 12, yPos + 26, { width: 31, align: 'center' });
        xPos += swmsColWidths[2];

        // Control Measures / Risk Treatment
        doc.fillColor(rowBg).rect(xPos, yPos, swmsColWidths[3], rowHeight).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[3], rowHeight).stroke();
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const controls = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : activity.controlMeasures || 'Standard safety measures';
        doc.text(controls, xPos + 4, yPos + 8, { width: swmsColWidths[3] - 8 });
        xPos += swmsColWidths[3];

        // Legislation, Codes of Practice, and Guidelines
        doc.fillColor(rowBg).rect(xPos, yPos, swmsColWidths[4], rowHeight).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[4], rowHeight).stroke();
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const legislation = Array.isArray(activity.legislation) ? activity.legislation.join(', ') : activity.legislation || 'WHS Act 2011, AS/NZS Standards';
        doc.text(legislation, xPos + 4, yPos + 8, { width: swmsColWidths[4] - 8 });
        xPos += swmsColWidths[4];

        // Residual Risk Score
        doc.fillColor(rowBg).rect(xPos, yPos, swmsColWidths[5], rowHeight).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, swmsColWidths[5], rowHeight).stroke();
        const residualRisk = activity.residualRisk || 'L (3)';
        const residualLetter = residualRisk.charAt(0);
        const residualColor = riskColorMap[residualLetter as keyof typeof riskColorMap] || '#10b981';
        
        doc.fillColor(residualColor).rect(xPos + 8, yPos + 20, 39, 20).fill();
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(residualRisk, xPos + 12, yPos + 26, { width: 31, align: 'center' });
        
        yPos += rowHeight;
      });

      // NEW PAGE FOR TOOL REGISTER
      doc.addPage();
      yPos = 40;

      // TOOL REGISTER CARD
      doc.fillColor('#ffffff').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 40).stroke();
      
      doc.fillColor('#f0fdf4').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#166534').font('Helvetica-Bold');
      doc.text('Tool Register & Equipment', 60, yPos + 15);

      yPos += 60;

      // Tool register table
      const toolHeaders = ['Tool/Equipment', 'Type', 'Inspection Date', 'Status', 'Operator Requirements'];
      const toolColWidths = [120, 80, 90, 70, 155];
      
      xPos = 40;
      toolHeaders.forEach((header, i) => {
        doc.fillColor('#374151').rect(xPos, yPos, toolColWidths[i], 30).fill();
        doc.strokeColor('#e5e7eb').rect(xPos, yPos, toolColWidths[i], 30).stroke();
        doc.fontSize(9).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 10, { width: toolColWidths[i] - 10, align: 'center' });
        xPos += toolColWidths[i];
      });
      yPos += 30;

      const tools = [
        ['Hand Tools', 'Manual', new Date().toLocaleDateString('en-AU'), 'Current', 'General competency'],
        ['Power Tools', 'Electrical', new Date().toLocaleDateString('en-AU'), 'Current', 'Licensed operator'],
        ['Safety Equipment', 'PPE', new Date().toLocaleDateString('en-AU'), 'Current', 'Training required'],
        ['Plant Equipment', 'Machinery', new Date().toLocaleDateString('en-AU'), 'Current', 'High risk license']
      ];

      tools.forEach((tool, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        xPos = 40;
        
        tool.forEach((item, i) => {
          doc.fillColor(rowBg).rect(xPos, yPos, toolColWidths[i], 25).fill();
          doc.strokeColor('#e5e7eb').rect(xPos, yPos, toolColWidths[i], 25).stroke();
          doc.fontSize(8).fillColor('#374151').font('Helvetica');
          doc.text(item, xPos + 5, yPos + 8, { width: toolColWidths[i] - 10 });
          xPos += toolColWidths[i];
        });
        yPos += 25;
      });

      // NEW PAGE FOR SIGNATORY
      doc.addPage();
      yPos = 40;

      // SIGNATORY SECTION CARD
      doc.fillColor('#ffffff').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 40).stroke();
      
      doc.fillColor('#fef2f2').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#dc2626').font('Helvetica-Bold');
      doc.text('Document Authorization & Signatures', 60, yPos + 15);

      yPos += 80;

      // Signature boxes
      const signatureBoxes = [
        ['Prepared By', 'Site Supervisor'],
        ['Reviewed By', 'Safety Officer'],
        ['Approved By', 'Project Manager']
      ];

      signatureBoxes.forEach(([role, title], index) => {
        const boxY = yPos + (index * 120);
        
        doc.fillColor('#ffffff').rect(40, boxY, 515, 100).fill();
        doc.strokeColor('#e5e7eb').rect(40, boxY, 515, 100).stroke();
        
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold');
        doc.text(role, 60, boxY + 15);
        
        // Signature line
        doc.strokeColor('#9ca3af').lineWidth(1);
        doc.moveTo(60, boxY + 50).lineTo(280, boxY + 50).stroke();
        doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
        doc.text('Signature', 60, boxY + 55);
        
        // Date line
        doc.moveTo(320, boxY + 50).lineTo(480, boxY + 50).stroke();
        doc.text('Date', 320, boxY + 55);
        
        // Name and title
        doc.fontSize(10).fillColor('#374151').font('Helvetica');
        doc.text(`Name: ________________________`, 60, boxY + 75);
        doc.text(`Title: ${title}`, 320, boxY + 75);
      });

      // FOOTER
      doc.fontSize(8).fillColor('#6b7280').font('Helvetica');
      doc.text(`Generated by Riskify Professional SWMS Builder - Document ID: SWMS-${Date.now()}`, 40, 790);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')} ${new Date().toLocaleTimeString('en-AU')}`, 40, 805);
      doc.fontSize(10).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('RISKIFY', 500, 805);
      
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}
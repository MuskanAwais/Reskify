import PDFDocument from 'pdfkit';

interface SWMSData {
  title?: string;
  jobName?: string;
  jobNumber?: string;
  projectAddress?: string;
  companyName?: string;
  projectManager?: string;
  siteSupervisor?: string;
  principalContractor?: string;
  startDate?: string;
  duration?: string;
  emergencyProcedures?: {
    contacts?: Array<{ name: string; phone: string }>;
  };
  workActivities?: Array<{
    task?: string;
    hazards?: string[];
    controlMeasures?: string[];
    initialRiskLevel?: string;
    residualRiskLevel?: string;
  }>;
  plantEquipment?: Array<{
    name?: string;
    model?: string;
    serial?: string;
    riskLevel?: string;
    nextInspection?: string;
    certificationRequired?: string;
  }>;
}

export async function generateExactPDF(swmsData: SWMSData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // A4 Portrait layout exactly matching Figma design
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'portrait',
        margins: { top: 20, bottom: 20, left: 20, right: 20 }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Exact Figma header implementation
      // Riskify logo (green) - exact positioning from Figma
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#22C55E').text('Riskify', 30, 30);
      doc.fontSize(10).fillColor('#666666').text('AI SWMS Generator', 30, 55);
      
      // Main title - exact Figma typography
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000').text('SAFE WORK METHOD STATEMENT', 145, 30);
      
      // Document info (top right) - exact Figma positioning
      doc.fontSize(10).fillColor('#000000').text('Document ID: SWMS-NEW-60623', 420, 30);
      doc.text('Date: 23/06/2025', 420, 45);
      
      // Project details under title - exact Figma layout
      doc.fontSize(12).fillColor('#000000').text('Project: Untitled Project', 145, 55);
      doc.text(`Location: ${swmsData.projectAddress || '456 Southbank Boulevard, Southbank VIC 3006'}`, 145, 70);

      // Two-card layout section - exact Figma measurements and colors
      let yPos = 100;
      
      // Left card - PROJECT INFORMATION (Blue #3B82F6) - exact Figma card
      doc.roundedRect(30, yPos, 250, 170, 8).fillAndStroke('#3B82F6', '#3B82F6');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('PROJECT INFORMATION', 40, yPos + 15);
      
      // Project info content - exact Figma layout
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica');
      const projectLines = [
        `Job Name: ${swmsData.title || swmsData.jobName || 'Test Project'}`,
        `Job Number: ${swmsData.jobNumber || '123-456'}`,
        `Company: ${swmsData.companyName || 'Test Company'}`,
        `Manager: ${swmsData.projectManager || 'Project Manager'}`,
        `Supervisor: ${swmsData.siteSupervisor || 'Site Supervisor'}`,
        `Start Date: ${swmsData.startDate || '23/06/2025'}`,
        `Duration: ${swmsData.duration || '8 weeks'}`,
        `Principal: ${swmsData.principalContractor || 'Principal Contractor'}`
      ];
      
      projectLines.forEach((line, index) => {
        doc.text(line, 40, yPos + 40 + (index * 15), { width: 200 });
      });
      
      // Right card - EMERGENCY PROCEDURES (Red #EF4444) - exact Figma card
      doc.roundedRect(310, yPos, 250, 170, 8).fillAndStroke('#EF4444', '#EF4444');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('EMERGENCY PROCEDURES', 320, yPos + 15);
      
      // Emergency info content - exact Figma layout
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica');
      doc.text('Emergency Contact:', 320, yPos + 40);
      doc.text('000', 320, yPos + 55);
      
      const emergencyContacts = swmsData.emergencyProcedures?.contacts || [
        { name: 'Site Coordinator', phone: '0412 345 678' },
        { name: 'Building Management', phone: '0398 765 432' },
        { name: 'First Aid Officer', phone: '0456 789 123' }
      ];
      
      emergencyContacts.slice(0, 3).forEach((contact, index) => {
        doc.text(`${contact.name}: ${contact.phone}`, 320, yPos + 70 + (index * 15), { width: 220 });
      });
      
      yPos += 190;
      
      // CONSTRUCTION CONTROL RISK MATRIX - exact Figma 4-panel layout
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#6B7280').text('CONSTRUCTION CONTROL RISK MATRIX', 30, yPos);
      yPos += 30;
      
      // Panel A - QUALITATIVE SCALE (Cyan #06B6D4) - exact Figma panel
      doc.roundedRect(30, yPos, 250, 120, 8).fillAndStroke('#06B6D4', '#06B6D4');
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF').text('A - QUALITATIVE SCALE', 40, yPos + 15);
      
      // Qualitative scale content - exact Figma layout
      doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
      const qualitativeItems = [
        'Extreme    Fatality, significant disability',
        'High       Minor amputation, permanent disability',
        'Medium     Minor injury, Lost Time Injury',
        'Low        First Aid Treatment only'
      ];
      
      qualitativeItems.forEach((item, index) => {
        doc.text(item, 40, yPos + 35 + (index * 18));
      });
      
      // Panel B - QUANTITATIVE SCALE (Green #10B981) - exact Figma panel
      doc.roundedRect(310, yPos, 250, 120, 8).fillAndStroke('#10B981', '#10B981');
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF').text('B - QUANTITATIVE SCALE', 320, yPos + 15);
      
      // Quantitative scale content - exact Figma layout
      doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
      const quantitativeItems = [
        '$50,000+        Likely - Monthly',
        '$15,000-$50,000   Possible - Yearly',
        '$1,000-$15,000    Unlikely - 10 years',
        '$0-$1,000         Very Rarely - Lifetime'
      ];
      
      quantitativeItems.forEach((item, index) => {
        doc.text(item, 320, yPos + 35 + (index * 18));
      });
      
      yPos += 140;
      
      // Panel C - LIKELIHOOD vs CONSEQUENCE (Orange #F97316) - exact Figma panel
      doc.roundedRect(30, yPos, 250, 120, 8).fillAndStroke('#F97316', '#F97316');
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF').text('C - LIKELIHOOD vs CONSEQUENCE', 40, yPos + 15);
      
      // Likelihood matrix - exact Figma table layout
      doc.fontSize(8).fillColor('#FFFFFF').font('Helvetica');
      
      // Matrix headers
      const matrixHeaders = ['', 'Likely', 'Possible', 'Unlikely'];
      matrixHeaders.forEach((header, index) => {
        doc.text(header, 40 + (index * 50), yPos + 35);
      });
      
      // Matrix rows with color coding - exact Figma colors
      const matrixRows = [
        { label: 'Extreme', values: ['E', 'E', 'H', 'H'], color: '#DC2626' },
        { label: 'High', values: ['E', 'H', 'H', 'M'], color: '#EA580C' },
        { label: 'Medium', values: ['H', 'H', 'M', 'L'], color: '#CA8A04' },
        { label: 'Low', values: ['M', 'M', 'L', 'L'], color: '#059669' }
      ];
      
      matrixRows.forEach((row, rowIndex) => {
        doc.text(row.label, 40, yPos + 50 + (rowIndex * 15));
        row.values.forEach((value, colIndex) => {
          const cellX = 90 + (colIndex * 50);
          const cellY = yPos + 45 + (rowIndex * 15);
          doc.rect(cellX, cellY, 40, 12).fill(row.color);
          doc.fontSize(8).fillColor('#FFFFFF').text(value, cellX + 18, cellY + 2);
        });
      });
      
      // Panel D - RISK RATING MATRIX (Red #EF4444) - exact Figma panel
      doc.roundedRect(310, yPos, 250, 120, 8).fillAndStroke('#EF4444', '#EF4444');
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF').text('D - RISK RATING MATRIX', 320, yPos + 15);
      
      // Risk rating content - exact Figma layout
      doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
      const riskRatingItems = [
        '16-18 Severe (E)     Action 24hrs',
        '11-15 High (H)       Action 2hrs',
        '7-10 Medium (M)      Action 1 week',
        '1-6 Low (L)          Monitor'
      ];
      
      riskRatingItems.forEach((item, index) => {
        doc.text(item, 320, yPos + 35 + (index * 18));
      });

      // Add RISKIFY watermark - exact Figma placement
      doc.fontSize(72).font('Helvetica-Bold').fillColor('#000000').opacity(0.1);
      doc.text('RISKIFY', 150, 400, { align: 'center' });
      doc.opacity(1);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
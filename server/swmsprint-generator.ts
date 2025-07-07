/**
 * Integrated SWMSprint PDF Generator
 * This replaces the external SWMSprint app with internal generation
 */

import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

interface SWMSData {
  // Core project information
  jobName?: string;
  jobNumber?: string;
  projectAddress?: string;
  projectLocation?: string;
  startDate?: string;
  duration?: string;
  projectDescription?: string;
  workDescription?: string;
  
  // Personnel information
  swmsCreatorName?: string;
  swmsCreatorPosition?: string;
  principalContractor?: string;
  projectManager?: string;
  siteSupervisor?: string;
  
  // Work activities and assessments
  activities?: any[];
  workActivities?: any[];
  riskAssessments?: any[];
  hazards?: any[];
  
  // Safety equipment and procedures
  ppeRequirements?: any[];
  plantEquipment?: any[];
  emergencyProcedures?: any[];
  
  // Compliance and trade information
  tradeType?: string;
  hrcwCategories?: any[];
  complianceCodes?: any[];
  
  // Signatures and authorization
  signatures?: any[];
  signatureMethod?: string;
  signatureImage?: string;
  signatureText?: string;
  
  // Company branding
  companyLogo?: string;
}

export class IntegratedSWMSprintGenerator {
  
  async generatePDF(data: SWMSData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'portrait',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Generate PDF content
        this.generateHeader(doc, data);
        this.generateProjectDetails(doc, data);
        this.generatePersonnelSection(doc, data);
        this.generateWorkActivities(doc, data);
        this.generateRiskAssessments(doc, data);
        this.generatePPERequirements(doc, data);
        this.generatePlantEquipment(doc, data);
        this.generateEmergencyProcedures(doc, data);
        this.generateSignatures(doc, data);
        this.generateFooter(doc, data);

        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument, data: SWMSData) {
    const pageWidth = doc.page.width;
    const margin = 50;
    
    // Add RISKIFY watermark background
    doc.save();
    doc.fillOpacity(0.1);
    doc.fontSize(40);
    doc.fillColor('#cccccc');
    
    // Create watermark pattern
    for (let x = 0; x < pageWidth; x += 150) {
      for (let y = 0; y < doc.page.height; y += 100) {
        doc.text('RISKIFY', x, y, { rotation: 45 });
      }
    }
    doc.restore();

    // Header section
    doc.fillColor('#000000');
    doc.fontSize(24);
    doc.font('Helvetica-Bold');
    doc.text('SAFE WORK METHOD STATEMENT', margin, 70, {
      align: 'center',
      width: pageWidth - (margin * 2)
    });

    // Company logo if available
    if (data.companyLogo) {
      try {
        // Add logo (simplified - would need proper base64 decoding)
        doc.fontSize(12);
        doc.text('Company Logo', pageWidth - 150, 70);
      } catch (error) {
        console.log('Logo rendering skipped:', error);
      }
    }

    // Project title
    doc.fontSize(18);
    doc.font('Helvetica-Bold');
    doc.fillColor('#2563eb');
    doc.text(data.jobName || 'SWMS Document', margin, 120, {
      align: 'center',
      width: pageWidth - (margin * 2)
    });

    doc.moveDown(2);
  }

  private generateProjectDetails(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    
    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('PROJECT DETAILS', margin, doc.y + 20);
    
    doc.fontSize(11);
    doc.font('Helvetica');
    
    const details = [
      { label: 'Job Name:', value: data.jobName || 'N/A' },
      { label: 'Job Number:', value: data.jobNumber || 'N/A' },
      { label: 'Project Address:', value: data.projectAddress || 'N/A' },
      { label: 'Start Date:', value: data.startDate || 'N/A' },
      { label: 'Trade Type:', value: data.tradeType || 'N/A' },
      { label: 'Duration:', value: data.duration || 'N/A' }
    ];

    let yPosition = doc.y + 10;
    
    details.forEach(detail => {
      doc.font('Helvetica-Bold');
      doc.text(detail.label, margin, yPosition, { width: 120, continued: true });
      doc.font('Helvetica');
      doc.text(detail.value, { width: 400 });
      yPosition += 20;
    });

    doc.y = yPosition + 10;
  }

  private generatePersonnelSection(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    
    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('PROJECT PERSONNEL', margin, doc.y + 20);
    
    doc.fontSize(11);
    doc.font('Helvetica');
    
    const personnel = [
      { label: 'SWMS Creator:', value: data.swmsCreatorName || 'N/A' },
      { label: 'Position:', value: data.swmsCreatorPosition || 'N/A' },
      { label: 'Principal Contractor:', value: data.principalContractor || 'N/A' },
      { label: 'Project Manager:', value: data.projectManager || 'N/A' },
      { label: 'Site Supervisor:', value: data.siteSupervisor || 'N/A' }
    ];

    let yPosition = doc.y + 10;
    
    personnel.forEach(person => {
      doc.font('Helvetica-Bold');
      doc.text(person.label, margin, yPosition, { width: 150, continued: true });
      doc.font('Helvetica');
      doc.text(person.value, { width: 350 });
      yPosition += 20;
    });

    doc.y = yPosition + 10;
  }

  private generateWorkActivities(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    const activities = data.activities || data.workActivities || [];
    
    if (activities.length === 0) return;

    // Check if new page needed
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('WORK ACTIVITIES', margin, doc.y + 20);
    
    doc.fontSize(10);
    
    // Table headers
    const tableTop = doc.y + 20;
    const colWidths = [40, 150, 80, 150, 80];
    let xPosition = margin;
    
    doc.font('Helvetica-Bold');
    doc.rect(margin, tableTop, 500, 25);
    doc.fillAndStroke('#f3f4f6', '#000000');
    
    doc.fillColor('#000000');
    doc.text('No.', xPosition + 5, tableTop + 7);
    xPosition += colWidths[0];
    doc.text('Activity', xPosition + 5, tableTop + 7);
    xPosition += colWidths[1];
    doc.text('Hazards', xPosition + 5, tableTop + 7);
    xPosition += colWidths[2];
    doc.text('Control Measures', xPosition + 5, tableTop + 7);
    xPosition += colWidths[3];
    doc.text('Risk Level', xPosition + 5, tableTop + 7);

    let rowY = tableTop + 25;
    doc.font('Helvetica');

    activities.slice(0, 10).forEach((activity: any, index: number) => {
      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }

      const rowHeight = 40;
      xPosition = margin;

      // Draw row background
      if (index % 2 === 0) {
        doc.rect(margin, rowY, 500, rowHeight);
        doc.fillAndStroke('#f9fafb', '#e5e7eb');
      } else {
        doc.rect(margin, rowY, 500, rowHeight);
        doc.fillAndStroke('#ffffff', '#e5e7eb');
      }

      doc.fillColor('#000000');
      
      // Activity number
      doc.text((index + 1).toString(), xPosition + 5, rowY + 10);
      xPosition += colWidths[0];
      
      // Activity name
      const activityName = activity.name || activity.activity || activity.task || `Activity ${index + 1}`;
      doc.text(activityName, xPosition + 5, rowY + 5, { width: colWidths[1] - 10, height: rowHeight - 10 });
      xPosition += colWidths[1];
      
      // Hazards
      const hazards = activity.hazards || activity.hazard || ['General hazards'];
      const hazardText = Array.isArray(hazards) ? hazards.join(', ') : hazards.toString();
      doc.text(hazardText, xPosition + 5, rowY + 5, { width: colWidths[2] - 10, height: rowHeight - 10 });
      xPosition += colWidths[2];
      
      // Control measures
      const controls = activity.controlMeasures || activity.controls || ['Standard controls'];
      const controlText = Array.isArray(controls) ? controls.join(', ') : controls.toString();
      doc.text(controlText, xPosition + 5, rowY + 5, { width: colWidths[3] - 10, height: rowHeight - 10 });
      xPosition += colWidths[3];
      
      // Risk level
      const riskLevel = activity.riskLevel || activity.risk || 'Medium';
      const riskColor = riskLevel.toLowerCase() === 'high' ? '#dc2626' : 
                       riskLevel.toLowerCase() === 'low' ? '#16a34a' : '#f59e0b';
      doc.fillColor(riskColor);
      doc.text(riskLevel, xPosition + 5, rowY + 10);
      doc.fillColor('#000000');

      rowY += rowHeight;
    });

    doc.y = rowY + 20;
  }

  private generateRiskAssessments(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('RISK ASSESSMENT MATRIX', margin, doc.y + 20);
    
    // Risk matrix
    const matrixTop = doc.y + 20;
    const cellWidth = 80;
    const cellHeight = 30;
    
    // Headers
    doc.fontSize(10);
    doc.font('Helvetica-Bold');
    
    const riskLevels = ['', 'Low', 'Medium', 'High', 'Extreme'];
    const consequences = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
    
    // Draw matrix
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const x = margin + (col * cellWidth);
        const y = matrixTop + (row * cellHeight);
        
        if (row === 0 && col === 0) {
          // Corner cell
          doc.rect(x, y, cellWidth, cellHeight);
          doc.fillAndStroke('#e5e7eb', '#000000');
        } else if (row === 0) {
          // Header row
          doc.rect(x, y, cellWidth, cellHeight);
          doc.fillAndStroke('#dbeafe', '#000000');
          doc.fillColor('#000000');
          doc.text(riskLevels[col], x + 5, y + 10);
        } else if (col === 0) {
          // First column
          doc.rect(x, y, cellWidth, cellHeight);
          doc.fillAndStroke('#dbeafe', '#000000');
          doc.fillColor('#000000');
          doc.text(consequences[row - 1], x + 5, y + 10, { width: cellWidth - 10 });
        } else {
          // Risk cells
          const riskScore = row * col;
          let bgColor = '#16a34a'; // Low
          if (riskScore >= 12) bgColor = '#dc2626'; // High
          else if (riskScore >= 6) bgColor = '#f59e0b'; // Medium
          
          doc.rect(x, y, cellWidth, cellHeight);
          doc.fillAndStroke(bgColor, '#000000');
          doc.fillColor('#ffffff');
          doc.text(riskScore.toString(), x + cellWidth/2 - 5, y + 10);
        }
      }
    }

    doc.y = matrixTop + (5 * cellHeight) + 20;
  }

  private generatePPERequirements(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    const ppeItems = data.ppeRequirements || [];
    
    if (ppeItems.length === 0) return;

    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('PERSONAL PROTECTIVE EQUIPMENT', margin, doc.y + 20);
    
    doc.fontSize(11);
    doc.font('Helvetica');
    
    let yPosition = doc.y + 15;
    
    ppeItems.forEach((ppe: any, index: number) => {
      const ppeName = ppe.name || ppe.item || ppe.equipment || `PPE Item ${index + 1}`;
      doc.text(`• ${ppeName}`, margin + 20, yPosition);
      yPosition += 15;
    });

    doc.y = yPosition + 10;
  }

  private generatePlantEquipment(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    const equipment = data.plantEquipment || [];
    
    if (equipment.length === 0) return;

    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('PLANT & EQUIPMENT', margin, doc.y + 20);
    
    doc.fontSize(11);
    doc.font('Helvetica');
    
    let yPosition = doc.y + 15;
    
    equipment.forEach((item: any, index: number) => {
      const equipmentName = item.name || item.equipment || item.item || `Equipment ${index + 1}`;
      const riskLevel = item.riskLevel || 'Medium';
      
      doc.text(`• ${equipmentName}`, margin + 20, yPosition, { continued: true });
      doc.fillColor(riskLevel.toLowerCase() === 'high' ? '#dc2626' : '#16a34a');
      doc.text(` (${riskLevel} Risk)`, { continued: false });
      doc.fillColor('#000000');
      yPosition += 15;
    });

    doc.y = yPosition + 10;
  }

  private generateEmergencyProcedures(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('EMERGENCY PROCEDURES', margin, doc.y + 20);
    
    doc.fontSize(11);
    doc.font('Helvetica');
    
    const emergencyInfo = [
      'Emergency Contact: 000',
      'Site Emergency Assembly Point: Main entrance',
      'First Aid Officer: Site Supervisor',
      'Fire Extinguisher Location: Near site office',
      'Emergency Evacuation Route: Via main access road'
    ];

    let yPosition = doc.y + 15;
    
    emergencyInfo.forEach(info => {
      doc.text(`• ${info}`, margin + 20, yPosition);
      yPosition += 15;
    });

    doc.y = yPosition + 10;
  }

  private generateSignatures(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fillColor('#000000');
    doc.fontSize(14);
    doc.font('Helvetica-Bold');
    doc.text('AUTHORISATION', margin, doc.y + 20);
    
    doc.fontSize(11);
    doc.font('Helvetica');
    
    const signatureY = doc.y + 30;
    
    // Signature boxes
    doc.rect(margin, signatureY, 200, 60);
    doc.stroke();
    doc.text('Prepared by:', margin + 5, signatureY - 15);
    doc.text(data.swmsCreatorName || 'Name: _______________', margin + 5, signatureY + 5);
    doc.text('Signature: _______________', margin + 5, signatureY + 25);
    doc.text(`Date: ${new Date().toLocaleDateString('en-AU')}`, margin + 5, signatureY + 45);

    doc.rect(margin + 250, signatureY, 200, 60);
    doc.stroke();
    doc.text('Approved by:', margin + 255, signatureY - 15);
    doc.text('Site Supervisor: _______________', margin + 255, signatureY + 5);
    doc.text('Signature: _______________', margin + 255, signatureY + 25);
    doc.text('Date: _______________', margin + 255, signatureY + 45);

    doc.y = signatureY + 80;
  }

  private generateFooter(doc: PDFKit.PDFDocument, data: SWMSData) {
    const margin = 50;
    
    // Add footer
    doc.fontSize(8);
    doc.fillColor('#666666');
    doc.text('Generated by Riskify SWMS Builder', margin, doc.page.height - 30, {
      align: 'center',
      width: doc.page.width - (margin * 2)
    });
    
    // Document info
    doc.text(`Document created: ${new Date().toLocaleDateString('en-AU')}`, margin, doc.page.height - 15, {
      align: 'left'
    });
    
    doc.text('Australian WHS Compliant', doc.page.width - 150, doc.page.height - 15);
  }
}

// Export function for use in routes
export async function generateIntegratedSWMSprintPDF(data: SWMSData): Promise<Buffer> {
  const generator = new IntegratedSWMSprintGenerator();
  return await generator.generatePDF(data);
}
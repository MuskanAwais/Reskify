import PDFDocument from 'pdfkit';

interface FinalModernPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateFinalModernPDF(options: FinalModernPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 15, bottom: 15, left: 15, right: 15 }
  });

  // Modern app-style color palette
  const colors = {
    primary: '#2563eb',
    accent: '#0ea5e9', 
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    slate: '#64748b',
    light: '#f8fafc',
    border: '#e5e7eb',
    text: '#1f2937'
  };

  // Minimal project-specific watermark
  doc.save();
  doc.opacity(0.02);
  doc.fontSize(18);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  doc.text(`${projectName} • ${uniqueId}`, 200, 350, { width: 400, align: 'center' });
  doc.restore();

  // Modern card function with clean drop shadow
  function drawCard(x: number, y: number, w: number, h: number, title: string, headerColor = colors.primary) {
    // Drop shadow effect
    doc.fillColor('#000000');
    doc.opacity(0.04);
    doc.roundedRect(x + 2, y + 2, w, h, 6);
    doc.fill();
    doc.opacity(1);

    // Card background
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, w, h, 6);
    doc.fill();
    
    // Subtle border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 6);
    doc.stroke();

    // Modern header with rounded corners
    doc.fillColor(headerColor);
    doc.roundedRect(x, y, w, 24, 6);
    doc.fill();
    // Square off bottom of header
    doc.rect(x, y + 18, w, 6);
    doc.fill();
    
    // Clean title typography
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x + 12, y + 9);
  }

  // Project Information Card - Full width header
  drawCard(25, 25, 800, 55, 'PROJECT INFORMATION');
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(8);
  
  // Two-column layout for project details
  const projectDetails = [
    ['Project Name:', projectName],
    ['Project Address:', projectAddress],
    ['Trade Type:', swmsData.tradeType || 'General Construction']
  ];
  
  const documentDetails = [
    ['Document ID:', uniqueId],
    ['Generated Date:', new Date().toLocaleDateString('en-AU')],
    ['Status:', 'Active - Current Version']
  ];

  let leftY = 56, rightY = 56;
  projectDetails.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 40, leftY, { width: 80 });
    doc.font('Helvetica');
    doc.text(value, 125, leftY, { width: 280 });
    leftY += 11;
  });
  
  documentDetails.forEach(([label, value]) => {
    doc.font('Helvetica-Bold'); 
    doc.text(label, 450, rightY, { width: 80 });
    doc.font('Helvetica');
    doc.text(value, 535, rightY, { width: 280 });
    rightY += 11;
  });

  // Work Activities Card
  const activities = swmsData.work_activities || [];
  if (activities.length > 0) {
    drawCard(25, 95, 390, 130, 'WORK ACTIVITIES & TASKS', colors.accent);
    
    let actY = 128;
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(8);
    
    activities.slice(0, 5).forEach((activity: any, index: number) => {
      // Numbered activity badge
      doc.fillColor(colors.accent);
      doc.circle(45, actY + 4, 5);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      doc.text((index + 1).toString(), 43, actY + 2);
      
      // Activity description
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(8);
      const activityText = activity.activity || activity.description || 'Work activity';
      doc.text(activityText, 56, actY, { width: 345, height: 10, ellipsis: true });
      
      actY += 18;
    });
  }

  // Risk Assessment Matrix with alternating row colors
  const risks = swmsData.risk_assessments || [];
  if (risks.length > 0) {
    drawCard(435, 95, 390, 130, 'RISK ASSESSMENT MATRIX', colors.warning);
    
    // Clean table headers
    doc.fillColor(colors.light);
    doc.rect(450, 128, 360, 15);
    doc.fill();
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text('HAZARD', 455, 133);
    doc.text('LIKELIHOOD', 580, 133);
    doc.text('SEVERITY', 670, 133);
    doc.text('RISK LEVEL', 750, 133);
    
    let riskY = 143;
    risks.slice(0, 4).forEach((risk: any, index: number) => {
      // Alternating row colors for readability
      if (index % 2 === 1) {
        doc.fillColor('#f9fafb');
        doc.rect(450, riskY, 360, 14);
        doc.fill();
      }
      
      // Color-coded risk level badge
      const riskLevel = risk.risk_level || 'Medium';
      let riskColor = colors.warning;
      if (riskLevel.toLowerCase().includes('high')) riskColor = colors.danger;
      if (riskLevel.toLowerCase().includes('low')) riskColor = colors.success;
      
      doc.fillColor(riskColor);
      doc.roundedRect(750, riskY + 2, 55, 10, 3);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      doc.text(riskLevel.toUpperCase(), 752, riskY + 5, { width: 51, align: 'center' });
      
      // Risk data with clean typography
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(risk.hazard || 'Hazard', 455, riskY + 5, { width: 120, ellipsis: true });
      doc.text(risk.likelihood || 'Medium', 580, riskY + 5, { width: 85 });
      doc.text(risk.severity || 'Medium', 670, riskY + 5, { width: 75 });
      
      riskY += 14;
    });
  }

  // Control Measures Card
  const controls = swmsData.control_measures || [];
  if (controls.length > 0) {
    drawCard(25, 245, 390, 95, 'CONTROL MEASURES', colors.success);
    
    let controlY = 278;
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(8);
    
    controls.slice(0, 3).forEach((control: any) => {
      // Control type badge with proper color coding
      const controlType = control.control_type || 'Administrative';
      let badgeColor = colors.slate;
      if (controlType.toLowerCase().includes('engineering')) badgeColor = colors.primary;
      if (controlType.toLowerCase().includes('ppe')) badgeColor = colors.accent;
      
      doc.fillColor(badgeColor);
      doc.roundedRect(45, controlY, 50, 10, 3);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(5);
      doc.text(controlType.toUpperCase().slice(0, 8), 47, controlY + 3, { width: 46, align: 'center' });
      
      // Control measure description
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(8);
      const controlText = control.control_measure || control.description || 'Control measure';
      doc.text(controlText, 105, controlY, { width: 295, height: 10, ellipsis: true });
      
      controlY += 20;
    });
  }

  // Emergency Procedures Card
  const emergency = swmsData.emergency_procedures || {};
  drawCard(435, 245, 390, 95, 'EMERGENCY PROCEDURES', colors.danger);
  
  let emergY = 278;
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(8);
  
  const emergencyItems = [
    ['Emergency Contact:', emergency.emergency_contact || '000'],
    ['Assembly Point:', emergency.assembly_point || 'Site Entry Point'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local Hospital']
  ];
  
  emergencyItems.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 455, emergY, { width: 100 });
    doc.font('Helvetica');
    doc.text(value, 560, emergY, { width: 250 });
    emergY += 18;
  });

  // Professional footer with branding
  doc.fillColor(colors.primary);
  doc.rect(25, 360, 800, 20);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(7);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 35, 366);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 35, 373);
  doc.text('This document is project-specific and should not be reused without regeneration', 550, 370, { 
    width: 265, 
    align: 'right' 
  });

  return doc;
}
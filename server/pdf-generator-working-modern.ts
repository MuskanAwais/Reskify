import PDFDocument from 'pdfkit';

interface WorkingModernPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateWorkingModernPDF(options: WorkingModernPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  // Modern colors
  const blue = '#2563eb';
  const sky = '#0ea5e9';
  const green = '#10b981';
  const amber = '#f59e0b';
  const red = '#ef4444';
  const gray = '#64748b';

  // Simplified watermark - just project identifier
  doc.save();
  doc.opacity(0.04);
  doc.fontSize(20);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  doc.text(`${projectName} • ${uniqueId}`, 150, 350, { width: 500, align: 'center' });
  doc.restore();

  // Modern card function
  function modernCard(x: number, y: number, w: number, h: number, title: string, color = blue) {
    // Drop shadow
    doc.fillColor('#000000');
    doc.opacity(0.06);
    doc.roundedRect(x + 1, y + 1, w, h, 4);
    doc.fill();
    doc.opacity(1);

    // Card background
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, w, h, 4);
    doc.fill();
    
    // Subtle border
    doc.strokeColor('#e5e7eb');
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 4);
    doc.stroke();

    // Header bar
    doc.fillColor(color);
    doc.roundedRect(x, y, w, 20, 4);
    doc.fill();
    // Square off bottom of header
    doc.rect(x, y + 16, w, 4);
    doc.fill();
    
    // Title text
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(title, x + 8, y + 7);
  }

  // Project Information Card
  modernCard(30, 30, 780, 50, 'PROJECT INFORMATION');
  
  doc.fillColor('#1f2937');
  doc.font('Helvetica');
  doc.fontSize(8);
  
  // Project details in two columns
  const col1 = [
    ['Project:', projectName],
    ['Address:', projectAddress],
    ['Trade:', swmsData.tradeType || 'General Construction']
  ];
  
  const col2 = [
    ['Document ID:', uniqueId],
    ['Generated:', new Date().toLocaleDateString('en-AU')],
    ['Status:', 'Active']
  ];

  let y1 = 58, y2 = 58;
  col1.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 45, y1, { width: 70 });
    doc.font('Helvetica');
    doc.text(value, 120, y1, { width: 250 });
    y1 += 10;
  });
  
  col2.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 430, y2, { width: 70 });
    doc.font('Helvetica');
    doc.text(value, 505, y2, { width: 250 });
    y2 += 10;
  });

  // Work Activities Card
  const activities = swmsData.work_activities || swmsData.workActivities || [];
  if (activities.length > 0) {
    modernCard(30, 100, 380, 120, 'WORK ACTIVITIES', sky);
    
    let actY = 130;
    doc.fillColor('#1f2937');
    doc.font('Helvetica');
    doc.fontSize(7);
    
    activities.slice(0, 5).forEach((activity: any, index: number) => {
      // Activity number badge
      doc.fillColor(sky);
      doc.circle(48, actY + 3, 4);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(5);
      doc.text((index + 1).toString(), 46, actY + 1);
      
      // Activity text
      doc.fillColor('#1f2937');
      doc.font('Helvetica');
      doc.fontSize(7);
      const text = activity.activity || activity.description || 'Work activity';
      doc.text(text, 58, actY, { width: 340, height: 8, ellipsis: true });
      
      actY += 14;
    });
  }

  // Risk Assessment Card with clean table
  const risks = swmsData.risk_assessments || [];
  if (risks.length > 0) {
    modernCard(430, 100, 380, 120, 'RISK ASSESSMENT MATRIX', amber);
    
    // Table headers with background
    doc.fillColor('#f8fafc');
    doc.rect(445, 130, 350, 12);
    doc.fill();
    
    doc.fillColor('#1f2937');
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.text('HAZARD', 450, 134);
    doc.text('LIKELIHOOD', 570, 134);
    doc.text('SEVERITY', 660, 134);
    doc.text('RISK LEVEL', 740, 134);
    
    let riskY = 142;
    risks.slice(0, 4).forEach((risk: any, index: number) => {
      // Alternating row colors for better readability
      if (index % 2 === 1) {
        doc.fillColor('#f9fafb');
        doc.rect(445, riskY, 350, 12);
        doc.fill();
      }
      
      // Risk level color-coded badge
      const riskLevel = risk.risk_level || 'Medium';
      let riskColor = amber;
      if (riskLevel.toLowerCase().includes('high')) riskColor = red;
      if (riskLevel.toLowerCase().includes('low')) riskColor = green;
      
      doc.fillColor(riskColor);
      doc.roundedRect(740, riskY + 1, 50, 10, 2);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(5);
      doc.text(riskLevel.toUpperCase(), 742, riskY + 4, { width: 46, align: 'center' });
      
      // Risk data
      doc.fillColor('#1f2937');
      doc.font('Helvetica');
      doc.fontSize(6);
      doc.text(risk.hazard || 'Hazard not specified', 450, riskY + 4, { width: 115, ellipsis: true });
      doc.text(risk.likelihood || 'Medium', 570, riskY + 4, { width: 85 });
      doc.text(risk.severity || 'Medium', 660, riskY + 4, { width: 75 });
      
      riskY += 12;
    });
  }

  // Control Measures Card
  const controls = swmsData.control_measures || [];
  if (controls.length > 0) {
    modernCard(30, 240, 380, 90, 'CONTROL MEASURES', green);
    
    let controlY = 270;
    doc.fillColor('#1f2937');
    doc.font('Helvetica');
    doc.fontSize(7);
    
    controls.slice(0, 3).forEach((control: any) => {
      // Control type badge with color coding
      const controlType = control.control_type || 'Administrative';
      let badgeColor = gray;
      if (controlType.toLowerCase().includes('engineering')) badgeColor = blue;
      if (controlType.toLowerCase().includes('ppe')) badgeColor = sky;
      
      doc.fillColor(badgeColor);
      doc.roundedRect(48, controlY, 40, 8, 2);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(4);
      doc.text(controlType.toUpperCase().slice(0, 6), 50, controlY + 2, { width: 36, align: 'center' });
      
      // Control description
      doc.fillColor('#1f2937');
      doc.font('Helvetica');
      doc.fontSize(7);
      const controlText = control.control_measure || control.description || 'Control measure not specified';
      doc.text(controlText, 95, controlY, { width: 300, height: 8, ellipsis: true });
      
      controlY += 18;
    });
  }

  // Emergency Procedures Card
  const emergency = swmsData.emergency_procedures || {};
  modernCard(430, 240, 380, 90, 'EMERGENCY PROCEDURES', red);
  
  let emergY = 270;
  doc.fillColor('#1f2937');
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const emergencyItems = [
    ['Emergency Contact:', emergency.emergency_contact || '000'],
    ['Assembly Point:', emergency.assembly_point || 'Site Entry'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local Hospital']
  ];
  
  emergencyItems.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 450, emergY, { width: 90 });
    doc.font('Helvetica');
    doc.text(value, 545, emergY, { width: 250 });
    emergY += 16;
  });

  // Professional footer
  doc.fillColor(blue);
  doc.rect(30, 350, 780, 18);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(6);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 40, 356);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 40, 362);
  doc.text('This document is project-specific and should not be reused without regeneration', 550, 359, { 
    width: 250, 
    align: 'right' 
  });

  return doc;
}
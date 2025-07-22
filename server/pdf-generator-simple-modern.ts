import PDFDocument from 'pdfkit';

interface SimplePDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateSimpleModernPDF(options: SimplePDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 25, bottom: 25, left: 25, right: 25 }
  });

  // Modern color scheme
  const blue = '#2563eb';
  const gray = '#64748b';
  const lightGray = '#f1f5f9';
  const green = '#10b981';
  const amber = '#f59e0b';
  const red = '#ef4444';

  // Project-specific watermark
  doc.save();
  doc.opacity(0.04);
  doc.fontSize(60);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  
  // RISKIFY diagonal pattern
  for (let x = 0; x < 800; x += 150) {
    for (let y = 0; y < 550; y += 100) {
      doc.save();
      doc.translate(x, y);
      doc.rotate(-25);
      doc.text('RISKIFY', 0, 0);
      doc.restore();
    }
  }
  
  // Project identifier
  doc.fontSize(14);
  doc.text(`${projectName} • ${uniqueId}`, 50, 500, { width: 650, align: 'center' });
  doc.restore();

  // Card drawing function with modern styling
  function drawModernCard(x: number, y: number, width: number, height: number, title: string, color = blue) {
    // Card shadow
    doc.save();
    doc.fillColor('#000000');
    doc.opacity(0.08);
    doc.roundedRect(x + 2, y + 2, width, height, 4);
    doc.fill();
    doc.restore();

    // Card background
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, width, height, 4);
    doc.fill();
    
    // Card border
    doc.strokeColor('#e5e7eb');
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, width, height, 4);
    doc.stroke();

    // Header
    doc.fillColor(color);
    doc.roundedRect(x, y, width, 24, 4);
    doc.fill();
    doc.fillColor(color);
    doc.rect(x, y + 20, width, 4);
    doc.fill();
    
    // Title
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x + 10, y + 8);
  }

  // Project Information Card
  drawModernCard(40, 40, 760, 60, 'PROJECT INFORMATION');
  
  doc.fillColor('#1e293b');
  doc.font('Helvetica');
  doc.fontSize(8);
  
  // Project details in columns
  const projectInfo = [
    ['Project:', swmsData.projectName || projectName],
    ['Address:', swmsData.projectAddress || projectAddress],
    ['Contractor:', swmsData.principalContractor || 'Not specified']
  ];
  
  const projectInfo2 = [
    ['Document ID:', uniqueId],
    ['Generated:', new Date().toLocaleDateString('en-AU')],
    ['Trade Type:', swmsData.tradeType || 'General Construction']
  ];

  let infoY = 72;
  projectInfo.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 60, infoY, { width: 80 });
    doc.font('Helvetica');
    doc.text(value, 145, infoY, { width: 250 });
    infoY += 10;
  });
  
  infoY = 72;
  projectInfo2.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 420, infoY, { width: 80 });
    doc.font('Helvetica');
    doc.text(value, 505, infoY, { width: 250 });
    infoY += 10;
  });

  // Work Activities Card
  const activities = swmsData.work_activities || swmsData.workActivities || [];
  if (activities.length > 0) {
    drawModernCard(40, 120, 360, 140, 'WORK ACTIVITIES', '#0ea5e9');
    
    let actY = 152;
    doc.fillColor('#1e293b');
    doc.font('Helvetica');
    doc.fontSize(7);
    
    activities.slice(0, 5).forEach((activity: any, index: number) => {
      // Activity number
      doc.fillColor('#0ea5e9');
      doc.circle(58, actY + 3, 5);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      doc.text((index + 1).toString(), 56, actY + 1);
      
      // Activity text
      doc.fillColor('#1e293b');
      doc.font('Helvetica');
      doc.fontSize(7);
      const text = activity.activity || activity.description || 'Activity not specified';
      doc.text(text, 70, actY, { width: 310, height: 10, ellipsis: true });
      
      actY += 18;
    });
  }

  // Risk Assessment Card with alternating row colors
  const risks = swmsData.risk_assessments || [];
  if (risks.length > 0) {
    drawModernCard(420, 120, 380, 140, 'RISK ASSESSMENT MATRIX', amber);
    
    // Table headers
    doc.fillColor(lightGray);
    doc.rect(440, 152, 340, 16);
    doc.fill();
    
    doc.fillColor('#1e293b');
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text('HAZARD', 445, 158);
    doc.text('LIKELIHOOD', 550, 158);
    doc.text('SEVERITY', 630, 158);
    doc.text('RISK LEVEL', 710, 158);
    
    let riskY = 168;
    risks.slice(0, 4).forEach((risk: any, index: number) => {
      // Alternating row background
      if (index % 2 === 1) {
        doc.fillColor('#f9fafb');
        doc.rect(440, riskY, 340, 14);
        doc.fill();
      }
      
      // Risk level badge with color coding
      const riskLevel = risk.risk_level || 'Medium';
      let riskColor = amber;
      if (riskLevel.toLowerCase().includes('high')) riskColor = red;
      if (riskLevel.toLowerCase().includes('low')) riskColor = green;
      
      doc.fillColor(riskColor);
      doc.roundedRect(710, riskY + 1, 65, 12, 2);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      doc.text(riskLevel.toUpperCase(), 712, riskY + 5, { width: 61, align: 'center' });
      
      // Risk data
      doc.fillColor('#1e293b');
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(risk.hazard || 'Not specified', 445, riskY + 5, { width: 100, ellipsis: true });
      doc.text(risk.likelihood || 'Medium', 550, riskY + 5, { width: 75 });
      doc.text(risk.severity || 'Medium', 630, riskY + 5, { width: 75 });
      
      riskY += 14;
    });
  }

  // Control Measures Card
  const controls = swmsData.control_measures || [];
  if (controls.length > 0) {
    drawModernCard(40, 280, 360, 100, 'CONTROL MEASURES', green);
    
    let controlY = 312;
    doc.fillColor('#1e293b');
    doc.font('Helvetica');
    doc.fontSize(7);
    
    controls.slice(0, 3).forEach((control: any, index: number) => {
      // Control type badge
      const controlType = control.control_type || 'Administrative';
      let badgeColor = gray;
      if (controlType.toLowerCase().includes('engineering')) badgeColor = blue;
      if (controlType.toLowerCase().includes('ppe')) badgeColor = '#0ea5e9';
      
      doc.fillColor(badgeColor);
      doc.roundedRect(58, controlY, 45, 8, 2);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(5);
      doc.text(controlType.toUpperCase().slice(0, 6), 60, controlY + 2, { width: 41, align: 'center' });
      
      // Control description
      doc.fillColor('#1e293b');
      doc.font('Helvetica');
      doc.fontSize(7);
      const controlText = control.control_measure || control.description || 'Control not specified';
      doc.text(controlText, 110, controlY, { width: 270, height: 10, ellipsis: true });
      
      controlY += 20;
    });
  }

  // Emergency Procedures Card
  const emergency = swmsData.emergency_procedures || {};
  drawModernCard(420, 280, 380, 100, 'EMERGENCY PROCEDURES', red);
  
  let emergY = 312;
  doc.fillColor('#1e293b');
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const emergencyData = [
    ['Emergency Contact:', emergency.emergency_contact || '000'],
    ['Assembly Point:', emergency.assembly_point || 'Site Entry'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local Hospital']
  ];
  
  emergencyData.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 440, emergY, { width: 100 });
    doc.font('Helvetica');
    doc.text(value, 550, emergY, { width: 230 });
    emergY += 16;
  });

  // Modern footer
  doc.fillColor(blue);
  doc.rect(40, 400, 760, 20);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(6);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 50, 408);
  doc.text(`Document ID: ${uniqueId} | ${new Date().toLocaleString('en-AU')}`, 50, 415);
  doc.text('This document is project-specific and should not be reused without regeneration', 500, 411, { width: 290, align: 'right' });

  return doc;
}
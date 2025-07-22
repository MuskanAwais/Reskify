import PDFDocument from 'pdfkit';

interface CardPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateCardBasedPDF(options: CardPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 30, bottom: 30, left: 30, right: 30 }
  });

  // Modern color palette
  const colors = {
    primary: '#2563eb',
    secondary: '#64748b', 
    accent: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    lightGray: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b'
  };

  // Project-specific watermark
  function addWatermark() {
    doc.save();
    doc.opacity(0.05);
    doc.fontSize(80);
    doc.font('Helvetica-Bold');
    doc.fillColor('#000000');
    
    // Diagonal RISKIFY pattern
    for (let x = -50; x < 900; x += 180) {
      for (let y = -30; y < 600; y += 120) {
        doc.save();
        doc.translate(x, y);
        doc.rotate(-30);
        doc.text('RISKIFY', 0, 0);
        doc.restore();
      }
    }
    
    // Project identifier at bottom
    doc.fontSize(16);
    doc.text(`${projectName} • ${uniqueId}`, 50, 520, {
      width: 700,
      align: 'center'
    });
    
    doc.restore();
  }

  // Draw modern card with shadow
  function drawCard(x: number, y: number, width: number, height: number, title: string, headerColor = colors.primary) {
    // Drop shadow
    doc.save();
    doc.fillColor('#000000');
    doc.opacity(0.1);
    doc.roundedRect(x + 2, y + 2, width, height, 6);
    doc.fill();
    doc.restore();

    // Main card background
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, width, height, 6);
    doc.fill();
    
    // Card border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, width, height, 6);
    doc.stroke();

    // Header
    doc.fillColor(headerColor);
    doc.roundedRect(x, y, width, 28, 6);
    doc.fill();
    doc.fillColor(headerColor);
    doc.rect(x, y + 22, width, 6);
    doc.fill();
    
    // Title
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(10);
    doc.text(title, x + 12, y + 10, { width: width - 24 });
  }

  // Start document
  addWatermark();

  // Header Card - Project Information
  drawCard(40, 50, 760, 70, 'PROJECT INFORMATION');
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(9);
  
  const projectData = [
    ['Project:', swmsData.projectName || projectName],
    ['Address:', swmsData.projectAddress || projectAddress],
    ['Contractor:', swmsData.principalContractor || 'Not specified'],
    ['ID:', uniqueId],
    ['Date:', new Date().toLocaleDateString('en-AU')],
    ['Trade:', swmsData.tradeType || 'General Construction']
  ];

  let infoY = 90;
  projectData.forEach((item, index) => {
    const x = index % 2 === 0 ? 60 : 420;
    const y = infoY + Math.floor(index / 2) * 12;
    
    doc.font('Helvetica-Bold');
    doc.text(item[0], x, y, { width: 80 });
    doc.font('Helvetica');
    doc.text(item[1], x + 85, y, { width: 250 });
  });

  // Work Activities Card
  const activities = swmsData.work_activities || swmsData.workActivities || [];
  if (activities.length > 0) {
    drawCard(40, 140, 370, 160, 'WORK ACTIVITIES', colors.accent);
    
    let actY = 180;
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(8);
    
    activities.slice(0, 6).forEach((activity: any, index: number) => {
      // Number badge
      doc.fillColor(colors.accent);
      doc.circle(58, actY + 4, 6);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(7);
      doc.text((index + 1).toString(), 55, actY + 1);
      
      // Activity text
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(8);
      const activityText = activity.activity || activity.description || 'Activity not specified';
      doc.text(activityText, 72, actY, { width: 320, height: 12, ellipsis: true });
      
      actY += 20;
    });
  }

  // Risk Assessment Card
  const risks = swmsData.risk_assessments || [];
  if (risks.length > 0) {
    drawCard(430, 140, 370, 160, 'RISK ASSESSMENT', colors.warning);
    
    // Risk table header
    doc.fillColor(colors.lightGray);
    doc.rect(450, 180, 330, 20);
    doc.fill();
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text('HAZARD', 455, 187);
    doc.text('LIKELIHOOD', 580, 187);
    doc.text('SEVERITY', 650, 187);
    doc.text('RISK LEVEL', 720, 187);
    
    let riskY = 200;
    risks.slice(0, 4).forEach((risk: any, index: number) => {
      // Alternating row colors
      if (index % 2 === 1) {
        doc.fillColor('#f9fafb');
        doc.rect(450, riskY, 330, 18);
        doc.fill();
      }
      
      // Risk level color
      const riskLevel = risk.risk_level || 'Medium';
      let riskColor = colors.warning;
      if (riskLevel.toLowerCase().includes('high')) riskColor = colors.danger;
      if (riskLevel.toLowerCase().includes('low')) riskColor = colors.success;
      
      // Risk badge
      doc.fillColor(riskColor);
      doc.roundedRect(720, riskY + 2, 55, 14, 3);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      doc.text(riskLevel.toUpperCase(), 722, riskY + 7, { width: 51, align: 'center' });
      
      // Risk data
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(risk.hazard || 'Not specified', 455, riskY + 7, { width: 120, ellipsis: true });
      doc.text(risk.likelihood || 'Medium', 580, riskY + 7, { width: 65 });
      doc.text(risk.severity || 'Medium', 650, riskY + 7, { width: 65 });
      
      riskY += 18;
    });
  }

  // Control Measures Card
  const controls = swmsData.control_measures || [];
  if (controls.length > 0) {
    drawCard(40, 320, 370, 120, 'CONTROL MEASURES', colors.success);
    
    let controlY = 360;
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(8);
    
    controls.slice(0, 4).forEach((control: any, index: number) => {
      // Control type badge
      const controlType = control.control_type || 'Admin';
      let badgeColor = colors.secondary;
      if (controlType.toLowerCase().includes('engineering')) badgeColor = colors.primary;
      if (controlType.toLowerCase().includes('ppe')) badgeColor = colors.accent;
      
      doc.fillColor(badgeColor);
      doc.roundedRect(58, controlY, 50, 10, 2);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      doc.text(controlType.toUpperCase().slice(0, 8), 60, controlY + 3, { width: 46, align: 'center' });
      
      // Control text
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(8);
      const controlText = control.control_measure || control.description || 'Control not specified';
      doc.text(controlText, 115, controlY + 1, { width: 280, height: 12, ellipsis: true });
      
      controlY += 22;
    });
  }

  // Emergency Procedures Card
  const emergency = swmsData.emergency_procedures || {};
  drawCard(430, 320, 370, 120, 'EMERGENCY PROCEDURES', colors.danger);
  
  let emergY = 360;
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(8);
  
  const emergencyItems = [
    ['Emergency Contact:', emergency.emergency_contact || 'Site Supervisor'],
    ['Phone Number:', emergency.phone_number || '000'],
    ['Assembly Point:', emergency.assembly_point || 'Site Entry'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local Hospital']
  ];
  
  emergencyItems.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 450, emergY, { width: 100 });
    doc.font('Helvetica');
    doc.text(value, 560, emergY, { width: 220 });
    emergY += 18;
  });

  // Footer
  doc.fillColor(colors.primary);
  doc.rect(40, 460, 760, 25);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(7);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 50, 470);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 50, 479);
  doc.text('This document is project-specific and should not be reused without regeneration', 500, 474, { width: 290, align: 'right' });

  return doc;
}
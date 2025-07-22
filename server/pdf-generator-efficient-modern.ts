import PDFDocument from 'pdfkit';

interface EfficientPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateEfficientModernPDF(options: EfficientPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  // Color palette
  const colors = {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    lightBg: '#f8fafc',
    border: '#e5e7eb',
    text: '#1f2937'
  };

  // Efficient watermark
  doc.save();
  doc.opacity(0.05);
  doc.fontSize(50);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  
  // Simple diagonal pattern
  for (let x = 0; x < 800; x += 120) {
    for (let y = 0; y < 550; y += 80) {
      doc.save();
      doc.translate(x, y);
      doc.rotate(-20);
      doc.text('RISKIFY', 0, 0);
      doc.restore();
    }
  }
  
  doc.fontSize(12);
  doc.text(`${projectName} • ${uniqueId}`, 100, 480, { width: 600, align: 'center' });
  doc.restore();

  // Efficient card function
  function drawCard(x: number, y: number, w: number, h: number, title: string, color = colors.primary) {
    // Shadow
    doc.fillColor('#000000');
    doc.opacity(0.06);
    doc.roundedRect(x + 1, y + 1, w, h, 3);
    doc.fill();
    doc.opacity(1);

    // Card
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, w, h, 3);
    doc.fill();
    
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 3);
    doc.stroke();

    // Header
    doc.fillColor(color);
    doc.roundedRect(x, y, w, 20, 3);
    doc.fill();
    doc.rect(x, y + 17, w, 3);
    doc.fill();
    
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(title, x + 8, y + 7);
  }

  // Header - Project Info
  drawCard(30, 30, 780, 50, 'PROJECT INFORMATION');
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const info = [
    ['Project:', projectName],
    ['Address:', projectAddress],
    ['ID:', uniqueId]
  ];
  
  const info2 = [
    ['Date:', new Date().toLocaleDateString('en-AU')],
    ['Trade:', swmsData.tradeType || 'Construction'],
    ['Status:', swmsData.status || 'Active']
  ];

  let y = 58;
  info.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 45, y, { width: 60 });
    doc.font('Helvetica');
    doc.text(value, 110, y, { width: 250 });
    y += 8;
  });
  
  y = 58;
  info2.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 420, y, { width: 60 });
    doc.font('Helvetica');
    doc.text(value, 485, y, { width: 250 });
    y += 8;
  });

  // Activities Card
  const activities = swmsData.work_activities || swmsData.workActivities || [];
  if (activities.length > 0) {
    drawCard(30, 100, 380, 120, 'WORK ACTIVITIES', colors.accent);
    
    let actY = 128;
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(7);
    
    activities.slice(0, 4).forEach((activity: any, index: number) => {
      doc.fillColor(colors.accent);
      doc.circle(48, actY + 2, 4);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(5);
      doc.text((index + 1).toString(), 46, actY);
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      const text = activity.activity || activity.description || 'Activity';
      doc.text(text, 58, actY, { width: 330, height: 8, ellipsis: true });
      
      actY += 16;
    });
  }

  // Risk Matrix Card
  const risks = swmsData.risk_assessments || [];
  if (risks.length > 0) {
    drawCard(430, 100, 380, 120, 'RISK ASSESSMENT', colors.warning);
    
    // Headers
    doc.fillColor(colors.lightBg);
    doc.rect(445, 128, 350, 12);
    doc.fill();
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.text('HAZARD', 450, 132);
    doc.text('LEVEL', 580, 132);
    doc.text('LIKELIHOOD', 640, 132);
    doc.text('SEVERITY', 720, 132);
    
    let riskY = 140;
    risks.slice(0, 3).forEach((risk: any, index: number) => {
      if (index % 2 === 1) {
        doc.fillColor('#f9fafb');
        doc.rect(445, riskY, 350, 12);
        doc.fill();
      }
      
      const level = risk.risk_level || 'Medium';
      let levelColor = colors.warning;
      if (level.toLowerCase().includes('high')) levelColor = colors.danger;
      if (level.toLowerCase().includes('low')) levelColor = colors.success;
      
      doc.fillColor(levelColor);
      doc.roundedRect(580, riskY + 1, 45, 10, 2);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(5);
      doc.text(level.toUpperCase(), 582, riskY + 4, { width: 41, align: 'center' });
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(6);
      doc.text(risk.hazard || 'Hazard', 450, riskY + 4, { width: 125, ellipsis: true });
      doc.text(risk.likelihood || 'Med', 640, riskY + 4, { width: 75 });
      doc.text(risk.severity || 'Med', 720, riskY + 4, { width: 70 });
      
      riskY += 12;
    });
  }

  // Controls Card
  const controls = swmsData.control_measures || [];
  if (controls.length > 0) {
    drawCard(30, 240, 380, 90, 'CONTROL MEASURES', colors.success);
    
    let controlY = 268;
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(7);
    
    controls.slice(0, 3).forEach((control: any) => {
      const type = control.control_type || 'Admin';
      let typeColor = colors.secondary;
      if (type.toLowerCase().includes('eng')) typeColor = colors.primary;
      if (type.toLowerCase().includes('ppe')) typeColor = colors.accent;
      
      doc.fillColor(typeColor);
      doc.roundedRect(48, controlY, 35, 7, 1);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(4);
      doc.text(type.toUpperCase().slice(0, 5), 50, controlY + 2, { width: 31, align: 'center' });
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      const controlText = control.control_measure || control.description || 'Control measure';
      doc.text(controlText, 90, controlY, { width: 300, height: 8, ellipsis: true });
      
      controlY += 18;
    });
  }

  // Emergency Card
  const emergency = swmsData.emergency_procedures || {};
  drawCard(430, 240, 380, 90, 'EMERGENCY PROCEDURES', colors.danger);
  
  let emergY = 268;
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const emergencyData = [
    ['Contact:', emergency.emergency_contact || '000'],
    ['Assembly:', emergency.assembly_point || 'Site Entry'],
    ['Hospital:', emergency.nearest_hospital || 'Local Hospital']
  ];
  
  emergencyData.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 450, emergY, { width: 60 });
    doc.font('Helvetica');
    doc.text(value, 515, emergY, { width: 270 });
    emergY += 16;
  });

  // Footer
  doc.fillColor(colors.primary);
  doc.rect(30, 350, 780, 16);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(6);
  doc.text('RISKIFY - Professional SWMS Builder', 40, 356);
  doc.text(`ID: ${uniqueId} | ${new Date().toLocaleString('en-AU')}`, 40, 361);
  doc.text('Project-specific document - do not reuse without regeneration', 600, 358, { width: 200, align: 'right' });

  return doc;
}
import PDFDocument from 'pdfkit';

interface FastModernPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateFastModernPDF(options: FastModernPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 15, bottom: 15, left: 15, right: 15 }
  });

  // Modern color palette
  const blue = '#2563eb';
  const sky = '#0ea5e9';
  const green = '#10b981';
  const amber = '#f59e0b';
  const red = '#ef4444';
  const slate = '#64748b';
  const lightBg = '#f8fafc';
  const border = '#e5e7eb';

  // Simple project watermark
  doc.save();
  doc.opacity(0.03);
  doc.fontSize(24);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  doc.text(`${projectName} • ${uniqueId}`, 200, 400, { width: 400, align: 'center' });
  doc.restore();

  // Card drawing function
  function card(x: number, y: number, w: number, h: number, title: string, color = blue) {
    // Shadow
    doc.fillColor('#000000');
    doc.opacity(0.05);
    doc.roundedRect(x + 1, y + 1, w, h, 2);
    doc.fill();
    doc.opacity(1);

    // Background
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, w, h, 2);
    doc.fill();
    
    // Border
    doc.strokeColor(border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 2);
    doc.stroke();

    // Header
    doc.fillColor(color);
    doc.rect(x, y, w, 18);
    doc.fill();
    
    // Title
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(title, x + 6, y + 6);
  }

  // Project Information
  card(25, 25, 790, 45, 'PROJECT INFORMATION');
  
  doc.fillColor('#1f2937');
  doc.font('Helvetica');
  doc.fontSize(7);
  
  // Project data in columns
  doc.font('Helvetica-Bold');
  doc.text('Project:', 35, 52);
  doc.text('Address:', 35, 62);
  
  doc.font('Helvetica');
  doc.text(projectName, 85, 52, { width: 300 });
  doc.text(projectAddress, 85, 62, { width: 300 });
  
  doc.font('Helvetica-Bold');
  doc.text('Document ID:', 420, 52);
  doc.text('Generated:', 420, 62);
  
  doc.font('Helvetica');
  doc.text(uniqueId, 490, 52, { width: 300 });
  doc.text(new Date().toLocaleDateString('en-AU'), 490, 62, { width: 300 });

  // Work Activities
  const activities = swmsData.work_activities || swmsData.workActivities || [];
  if (activities.length > 0) {
    card(25, 85, 390, 105, 'WORK ACTIVITIES', sky);
    
    let y = 112;
    doc.fillColor('#1f2937');
    doc.font('Helvetica');
    doc.fontSize(6);
    
    activities.slice(0, 4).forEach((activity: any, index: number) => {
      // Number
      doc.fillColor(sky);
      doc.circle(40, y + 2, 3);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(4);
      doc.text((index + 1).toString(), 38, y);
      
      // Text
      doc.fillColor('#1f2937');
      doc.font('Helvetica');
      doc.fontSize(6);
      const text = activity.activity || activity.description || 'Activity';
      doc.text(text, 50, y, { width: 350, height: 6, ellipsis: true });
      
      y += 12;
    });
  }

  // Risk Assessment with alternating rows
  const risks = swmsData.risk_assessments || [];
  if (risks.length > 0) {
    card(435, 85, 380, 105, 'RISK ASSESSMENT MATRIX', amber);
    
    // Headers
    doc.fillColor(lightBg);
    doc.rect(445, 112, 360, 10);
    doc.fill();
    
    doc.fillColor('#1f2937');
    doc.font('Helvetica-Bold');
    doc.fontSize(5);
    doc.text('HAZARD', 450, 116);
    doc.text('LIKELIHOOD', 580, 116);
    doc.text('SEVERITY', 670, 116);
    doc.text('RISK LEVEL', 750, 116);
    
    let y = 122;
    risks.slice(0, 3).forEach((risk: any, index: number) => {
      // Alternating background
      if (index % 2 === 1) {
        doc.fillColor('#f9fafb');
        doc.rect(445, y, 360, 10);
        doc.fill();
      }
      
      // Risk level badge
      const level = risk.risk_level || 'Medium';
      let levelColor = amber;
      if (level.toLowerCase().includes('high')) levelColor = red;
      if (level.toLowerCase().includes('low')) levelColor = green;
      
      doc.fillColor(levelColor);
      doc.roundedRect(750, y + 1, 50, 8, 1);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(4);
      doc.text(level.toUpperCase(), 752, y + 3, { width: 46, align: 'center' });
      
      // Data
      doc.fillColor('#1f2937');
      doc.font('Helvetica');
      doc.fontSize(5);
      doc.text(risk.hazard || 'Hazard', 450, y + 3, { width: 125, ellipsis: true });
      doc.text(risk.likelihood || 'Medium', 580, y + 3, { width: 85 });
      doc.text(risk.severity || 'Medium', 670, y + 3, { width: 75 });
      
      y += 10;
    });
  }

  // Control Measures
  const controls = swmsData.control_measures || [];
  if (controls.length > 0) {
    card(25, 210, 390, 80, 'CONTROL MEASURES', green);
    
    let y = 237;
    doc.fillColor('#1f2937');
    doc.font('Helvetica');
    doc.fontSize(6);
    
    controls.slice(0, 3).forEach((control: any) => {
      const type = control.control_type || 'Admin';
      let typeColor = slate;
      if (type.toLowerCase().includes('eng')) typeColor = blue;
      if (type.toLowerCase().includes('ppe')) typeColor = sky;
      
      doc.fillColor(typeColor);
      doc.roundedRect(40, y, 30, 6, 1);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(3);
      doc.text(type.toUpperCase().slice(0, 4), 42, y + 2, { width: 26, align: 'center' });
      
      doc.fillColor('#1f2937');
      doc.font('Helvetica');
      doc.fontSize(6);
      const text = control.control_measure || control.description || 'Control';
      doc.text(text, 75, y, { width: 325, height: 6, ellipsis: true });
      
      y += 15;
    });
  }

  // Emergency Procedures
  const emergency = swmsData.emergency_procedures || {};
  card(435, 210, 380, 80, 'EMERGENCY PROCEDURES', red);
  
  let y = 237;
  doc.fillColor('#1f2937');
  doc.font('Helvetica');
  doc.fontSize(6);
  
  const emergencyData = [
    ['Contact:', emergency.emergency_contact || '000'],
    ['Assembly:', emergency.assembly_point || 'Site Entry'],
    ['Hospital:', emergency.nearest_hospital || 'Local Hospital']
  ];
  
  emergencyData.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.text(label, 450, y, { width: 50 });
    doc.font('Helvetica');
    doc.text(value, 505, y, { width: 295 });
    y += 12;
  });

  // Footer
  doc.fillColor(blue);
  doc.rect(25, 310, 790, 12);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(5);
  doc.text('RISKIFY - Professional SWMS Builder', 30, 315);
  doc.text(`${uniqueId} | ${new Date().toLocaleString('en-AU')}`, 30, 319);
  doc.text('Project-specific document', 700, 317, { width: 110, align: 'right' });

  return doc;
}
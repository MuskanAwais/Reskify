import PDFDocument from 'pdfkit';

interface MutedCardsPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateMutedCardsPDF(options: MutedCardsPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 15, bottom: 15, left: 15, right: 15 }
  });

  // Muted color palette
  const colors = {
    primary: '#64748b',      // Slate-500 - muted blue
    secondary: '#94a3b8',    // Slate-400 - muted secondary
    accent: '#475569',       // Slate-600 - muted accent
    success: '#6b7280',      // Gray-500 - muted green
    warning: '#78716c',      // Stone-500 - muted amber
    danger: '#71717a',       // Zinc-500 - muted red
    light: '#f8fafc',        // Slate-50 - very light
    border: '#e2e8f0',       // Slate-200 - light border
    text: '#1e293b',         // Slate-800 - dark text
    textLight: '#64748b'     // Slate-500 - light text
  };

  // Project watermark
  doc.save();
  doc.opacity(0.04);
  doc.fontSize(20);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  doc.text(`${projectName} • ${uniqueId}`, 150, 350, { width: 500, align: 'center' });
  doc.restore();

  // Modern card function with muted colors
  function mutedCard(x: number, y: number, w: number, h: number, title: string, color = colors.primary) {
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
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 4);
    doc.stroke();

    // Header bar with muted color
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
  mutedCard(25, 25, 775, 80, 'PROJECT INFORMATION', colors.primary);
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(8);
  
  // Complete project details from SWMS data
  const projectDetails = [
    ['Project Name:', swmsData.projectName || swmsData.title || projectName],
    ['Project Address:', swmsData.projectAddress || projectAddress],
    ['Principal Contractor:', swmsData.principalContractor || swmsData.principal_contractor || 'Not specified'],
    ['Head Contractor:', swmsData.headContractor || swmsData.head_contractor || 'Not specified'],
    ['Project Manager:', swmsData.projectManager || swmsData.project_manager || 'Not specified'],
    ['Site Manager:', swmsData.siteManager || swmsData.site_manager || 'Not specified'],
    ['Trade Type:', swmsData.tradeType || swmsData.trade_type || 'General Construction'],
    ['Job Number:', swmsData.jobNumber || swmsData.job_number || 'JOB-' + Date.now()],
    ['Document ID:', uniqueId],
    ['Generated Date:', new Date().toLocaleDateString('en-AU')],
    ['Status:', 'Active Document'],
    ['Version:', '1.0']
  ];

  let col1Y = 52, col2Y = 52, col3Y = 52;
  projectDetails.forEach((detail, index) => {
    const colIndex = index % 3;
    const x = colIndex === 0 ? 40 : colIndex === 1 ? 290 : 540;
    const y = colIndex === 0 ? col1Y : colIndex === 1 ? col2Y : col3Y;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.accent);
    doc.text(detail[0], x, y, { width: 80 });
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(detail[1], x + 85, y, { width: 160 });
    
    if (colIndex === 0) col1Y += 10;
    else if (colIndex === 1) col2Y += 10;
    else col3Y += 10;
  });

  // Work Activities & Tasks Card
  mutedCard(25, 115, 375, 140, 'WORK ACTIVITIES & TASKS', colors.secondary);
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const activities = swmsData.work_activities || swmsData.activities || [];
  let activityY = 140;
  
  activities.slice(0, 10).forEach((activity: any, index: number) => {
    const activityText = activity.activity || activity.description || activity.task || `Activity ${index + 1}`;
    
    // Activity bullet
    doc.fillColor(colors.primary);
    doc.circle(40, activityY + 3, 2);
    doc.fill();
    
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.text(activityText, 50, activityY, { width: 340, height: 12, ellipsis: true });
    activityY += 12;
  });

  // Risk Assessment Matrix Card
  mutedCard(410, 115, 390, 140, 'RISK ASSESSMENT MATRIX', colors.warning);
  
  // Risk matrix headers
  const riskHeaders = ['HAZARD', 'LIKELIHOOD', 'SEVERITY', 'RISK LEVEL'];
  const riskColWidths = [120, 80, 80, 80];
  
  doc.fillColor(colors.secondary);
  doc.rect(425, 140, 360, 15);
  doc.fill();
  
  let riskHeaderX = 425;
  riskHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, riskHeaderX + 3, 145, { width: riskColWidths[index] - 6 });
    riskHeaderX += riskColWidths[index];
  });
  
  // Risk data rows
  const risks = swmsData.risk_assessments || swmsData.risks || [
    { hazard: 'Crane operations near traffic', likelihood: 'Medium', severity: 'High', risk_level: 'HIGH' },
    { hazard: 'Falls from structural steelwork', likelihood: 'High', severity: 'High', risk_level: 'HIGH' },
    { hazard: 'Hot work and welding hazards', likelihood: 'Medium', severity: 'Medium', risk_level: 'MEDIUM' },
    { hazard: 'Manual handling of steel components', likelihood: 'High', severity: 'Low', risk_level: 'LOW' }
  ];
  
  let riskY = 155;
  risks.slice(0, 6).forEach((risk: any, index: number) => {
    // Alternating row colors
    if (index % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(425, riskY, 360, 12);
      doc.fill();
    }
    
    const riskLevel = risk.risk_level || risk.level || 'MEDIUM';
    const riskColor = riskLevel === 'HIGH' ? colors.danger : riskLevel === 'MEDIUM' ? colors.warning : colors.success;
    
    const riskData = [
      risk.hazard || '',
      risk.likelihood || '',
      risk.severity || '',
      riskLevel
    ];
    
    let riskCellX = 425;
    riskData.forEach((data, colIndex) => {
      doc.fillColor(colIndex === 3 ? '#ffffff' : colors.text);
      doc.font('Helvetica');
      doc.fontSize(6);
      
      // Risk level tag
      if (colIndex === 3) {
        doc.fillColor(riskColor);
        doc.rect(riskCellX + 5, riskY + 1, 70, 10);
        doc.fill();
        doc.fillColor('#ffffff');
        doc.font('Helvetica-Bold');
        doc.text(data, riskCellX + 8, riskY + 3, { width: 64, align: 'center' });
      } else {
        doc.text(data, riskCellX + 3, riskY + 3, { width: riskColWidths[colIndex] - 6, height: 8, ellipsis: true });
      }
      
      riskCellX += riskColWidths[colIndex];
    });
    
    riskY += 12;
  });

  // Control Measures Card  
  mutedCard(25, 265, 375, 120, 'CONTROL MEASURES', colors.success);
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const controls = swmsData.control_measures || swmsData.controls || [];
  let controlY = 290;
  
  controls.slice(0, 8).forEach((control: any, index: number) => {
    const controlText = control.control_measure || control.description || control.measure || `Control measure ${index + 1}`;
    
    // Control type tag
    const controlType = control.type || 'GENERAL';
    const controlColor = controlType === 'ELIMINATE' ? colors.success : 
                        controlType === 'SUBSTITUTE' ? colors.warning : 
                        controlType === 'ADMIN' ? colors.secondary : colors.accent;
    
    doc.fillColor(controlColor);
    doc.rect(40, controlY, 50, 8);
    doc.fill();
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(5);
    doc.text(controlType, 42, controlY + 2, { width: 46, align: 'center' });
    
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(controlText, 100, controlY + 1, { width: 290, height: 10, ellipsis: true });
    controlY += 12;
  });

  // Emergency Procedures Card
  mutedCard(410, 265, 390, 120, 'EMERGENCY PROCEDURES', colors.danger);
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(7);
  
  const emergency = swmsData.emergency_procedures || {};
  const emergencyItems = [
    ['Emergency Contact:', emergency.emergency_contact || '000'],
    ['Site Supervisor:', emergency.site_supervisor || 'On-site supervisor'],
    ['Assembly Point:', emergency.assembly_point || 'Main site entrance'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local hospital'],
    ['Evacuation Route:', emergency.evacuation_route || 'Via main access road'],
    ['Fire Equipment:', emergency.fire_equipment || 'Site office and work areas']
  ];
  
  let emergencyY = 290;
  emergencyItems.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.accent);
    doc.text(label, 425, emergencyY, { width: 100 });
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(value, 530, emergencyY, { width: 260 });
    emergencyY += 12;
  });

  // NEW PAGE - Equipment Register
  doc.addPage();
  
  // Equipment Register Card (Full Width)
  mutedCard(25, 25, 775, 200, 'PLANT & EQUIPMENT REGISTER', colors.accent);
  
  // Equipment table headers
  const equipHeaders = ['ITEM', 'DESCRIPTION', 'MAKE/MODEL', 'REG/SERIAL', 'INSPECTION', 'NEXT DUE', 'RISK', 'CONTROLS'];
  const equipColWidths = [80, 120, 100, 100, 80, 80, 60, 155];
  
  doc.fillColor(colors.secondary);
  doc.rect(40, 50, 745, 15);
  doc.fill();
  
  let equipHeaderX = 40;
  equipHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, equipHeaderX + 3, 55, { width: equipColWidths[index] - 6 });
    equipHeaderX += equipColWidths[index];
  });
  
  // Equipment data from SWMS builder
  const equipment = swmsData.plant_equipment || swmsData.equipment || [
    { item: 'Mobile Crane', description: '50T Mobile Crane', make: 'Liebherr LTM 1050', registration: 'CR002-2024', inspection: '10/06/2025', next_inspection: '10/09/2025', risk: 'High', controls: 'Dogman supervision, exclusion zones, certified operator' },
    { item: 'Excavator', description: '20T Hydraulic Excavator', make: 'Caterpillar 320D', registration: 'EX001-2024', inspection: '15/06/2025', next_inspection: '15/12/2025', risk: 'Medium', controls: 'Daily pre-start checks, certified operator required' },
    { item: 'Forklift', description: '3T Electric Forklift', make: 'Toyota 8FBE30', registration: 'FK003-2024', inspection: '20/06/2025', next_inspection: '20/12/2025', risk: 'Medium', controls: 'Spotter required, high-vis clothing, training certification' },
    { item: 'Welding Equipment', description: 'Arc Welding Machine', make: 'Lincoln Electric', registration: 'WE004-2024', inspection: '25/06/2025', next_inspection: '25/09/2025', risk: 'Medium', controls: 'Hot work permits, fire watch, ventilation systems' },
    { item: 'Generator', description: '100kVA Diesel Generator', make: 'Caterpillar C4.4', registration: 'GE005-2024', inspection: '30/06/2025', next_inspection: '30/12/2025', risk: 'Low', controls: 'Noise management, fuel handling procedures, maintenance schedule' }
  ];
  
  let equipY = 65;
  equipment.slice(0, 10).forEach((equip: any, index: number) => {
    // Alternating row colors
    if (index % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(40, equipY, 745, 15);
      doc.fill();
    }
    
    const equipData = [
      equip.item || '',
      equip.description || '',
      equip.make || '',
      equip.registration || equip.serial || '',
      equip.inspection || equip.inspection_date || '',
      equip.next_inspection || '',
      equip.risk || equip.risk_level || '',
      equip.controls || ''
    ];
    
    let equipCellX = 40;
    equipData.forEach((data, colIndex) => {
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(6);
      doc.text(data, equipCellX + 3, equipY + 3, { 
        width: equipColWidths[colIndex] - 6, 
        height: 12,
        ellipsis: true 
      });
      equipCellX += equipColWidths[colIndex];
    });
    
    equipY += 15;
  });

  // Signatory Section
  mutedCard(25, 240, 775, 140, 'DOCUMENT APPROVAL & SIGNATURES', colors.primary);
  
  // Signature boxes
  const signatories = [
    { title: 'PREPARED BY:', name: swmsData.prepared_by || '', role: 'Safety Officer' },
    { title: 'REVIEWED BY:', name: swmsData.reviewed_by || '', role: 'Project Manager' },
    { title: 'APPROVED BY:', name: swmsData.approved_by || '', role: 'Site Manager' },
    { title: 'SITE SUPERVISOR:', name: swmsData.site_supervisor || '', role: 'Site Supervisor' }
  ];
  
  signatories.forEach((sig, index) => {
    const x = (index % 2) * 387 + 40;
    const y = 270 + Math.floor(index / 2) * 50;
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(sig.title, x, y);
    
    // Signature box
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.rect(x, y + 15, 370, 35);
    doc.stroke();
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.fillColor(colors.textLight);
    doc.text('Name:', x + 5, y + 20);
    doc.text('Signature:', x + 5, y + 32);
    doc.text('Date:', x + 5, y + 44);
    doc.text(`Role: ${sig.role}`, x + 200, y + 20);
    
    // Signature lines
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    doc.moveTo(x + 35, y + 27);
    doc.lineTo(x + 190, y + 27);
    doc.stroke();
    doc.moveTo(x + 45, y + 39);
    doc.lineTo(x + 190, y + 39);
    doc.stroke();
    doc.moveTo(x + 30, y + 51);
    doc.lineTo(x + 120, y + 51);
    doc.stroke();
  });

  // Footer
  const footerY = 520;
  doc.fillColor(colors.secondary);
  doc.rect(25, footerY, 775, 16);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font('Helvetica');
  doc.fontSize(6);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 35, footerY + 5);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 35, footerY + 10);
  doc.text('This document is project-specific and should not be reused without regeneration', 550, footerY + 8, { 
    width: 240, 
    align: 'right' 
  });

  return doc;
}
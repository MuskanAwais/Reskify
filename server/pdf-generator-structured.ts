import PDFDocument from 'pdfkit';

interface StructuredPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateStructuredPDF(options: StructuredPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 15, bottom: 15, left: 15, right: 15 }
  });

  // Muted color palette
  const colors = {
    primary: '#64748b',      // Slate-500 - muted blue-gray
    secondary: '#94a3b8',    // Slate-400 - lighter gray
    accent: '#475569',       // Slate-600 - darker gray
    success: '#6b7280',      // Gray-500 - muted green
    warning: '#78716c',      // Stone-500 - muted amber
    danger: '#71717a',       // Zinc-500 - muted red
    light: '#f8fafc',        // Slate-50 - very light gray
    border: '#e2e8f0',       // Slate-200 - light border
    text: '#1e293b',         // Slate-800 - dark text
    textLight: '#64748b'     // Slate-500 - light text
  };

  // Minimal project watermark
  doc.save();
  doc.opacity(0.02);
  doc.fontSize(16);
  doc.font('Helvetica');
  doc.fillColor('#000000');
  doc.text(`${projectName} • ${uniqueId}`, 200, 400, { width: 400, align: 'center' });
  doc.restore();

  let yPosition = 20;

  // Project Information Header (outside card)
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(12);
  doc.text('PROJECT INFORMATION', 25, yPosition);
  
  yPosition += 20;
  
  // Project details in structured layout
  doc.fillColor(colors.light);
  doc.rect(25, yPosition, 800, 80);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.rect(25, yPosition, 800, 80);
  doc.stroke();
  
  // Project info content
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(8);
  
  const projectInfo = [
    ['Project Name:', swmsData.projectName || projectName],
    ['Project Address:', swmsData.projectAddress || projectAddress],
    ['Principal Contractor:', swmsData.principalContractor || 'Not specified'],
    ['Trade Type:', swmsData.tradeType || 'General Construction'],
    ['Job Number:', swmsData.jobNumber || 'JOB-' + Date.now()],
    ['Document ID:', uniqueId],
    ['Date Generated:', new Date().toLocaleDateString('en-AU')],
    ['Status:', 'Active Document']
  ];

  let col1Y = yPosition + 15;
  let col2Y = yPosition + 15;
  
  projectInfo.forEach((info, index) => {
    const x = index % 2 === 0 ? 40 : 430;
    const y = index % 2 === 0 ? col1Y : col2Y;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.accent);
    doc.text(info[0], x, y, { width: 120 });
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(info[1], x + 125, y, { width: 250 });
    
    if (index % 2 === 0) {
      col1Y += 12;
    } else {
      col2Y += 12;
    }
  });

  yPosition += 100;

  // Construction Control Risk Matrix (from attached image)
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(11);
  doc.text('CONSTRUCTION CONTROL RISK MATRIX', 25, yPosition);
  
  yPosition += 20;
  
  // Risk matrix table
  const matrixData = [
    ['', 'Qualitative Scale', 'Quantitative Scale', 'Magnitude Scale', 'Probability Scale', 'Likely', 'Possible', 'Unlikely', 'Very Rarely', 'Score', 'Ranking', 'Action'],
    ['Extreme', 'Fatality, significant disability, catastrophic property damage', '$50,000+', 'Likely', 'Good chance', '16', '14', '11', '7', '14-16', 'Severe (S)', 'Action Required (A)'],
    ['High', 'Major amputation, minor permanent disability, moderate property damage', '$15,000-$50,000', 'Possible', 'Even chance', '15', '12', '8', '5', '11-13', 'High (H)', 'Action in next 24 hrs'],
    ['Medium', 'Minor injury resulting in Lost Time Injury or Medically Treated Injury', '$1,000-$15,000', 'Unlikely', 'Low chance', '13', '9', '', '', '7-10', 'Medium (M)', 'Action this week'],
    ['Low', 'First Aid Treatment with no lost time', '$0-$1,000', 'Very Rarely', 'Practically no chance', '10', '', '', '', '', '', '']
  ];

  let matrixY = yPosition;
  const colWidths = [50, 120, 80, 60, 60, 40, 40, 40, 40, 40, 50, 80];
  
  matrixData.forEach((row, rowIndex) => {
    let cellX = 25;
    
    // Header row background
    if (rowIndex === 0) {
      doc.fillColor(colors.secondary);
      doc.rect(25, matrixY, 800, 15);
      doc.fill();
    }
    
    row.forEach((cell, colIndex) => {
      // Cell borders
      doc.strokeColor(colors.border);
      doc.lineWidth(0.5);
      doc.rect(cellX, matrixY, colWidths[colIndex], 15);
      doc.stroke();
      
      // Cell content
      doc.fillColor(rowIndex === 0 ? colors.light : colors.text);
      doc.font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
      doc.fontSize(6);
      doc.text(cell, cellX + 2, matrixY + 4, { 
        width: colWidths[colIndex] - 4, 
        height: 11,
        ellipsis: true 
      });
      
      cellX += colWidths[colIndex];
    });
    
    matrixY += 15;
  });

  yPosition = matrixY + 20;

  // Risk Assessment Table (full width)
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(11);
  doc.text('RISK ASSESSMENT & CONTROL MEASURES', 25, yPosition);
  
  yPosition += 20;
  
  // Table headers
  const headers = ['Activity/Item', 'Hazards/Risks', 'Initial Risk Score', 'Control Measures/Risk Treatment', 'Legislation, Codes of Practice, and Guidelines', 'Residual Risk Score'];
  const tableColWidths = [120, 150, 60, 200, 150, 80];
  
  doc.fillColor(colors.secondary);
  doc.rect(25, yPosition, 800, 18);
  doc.fill();
  
  let headerX = 25;
  headers.forEach((header, index) => {
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.rect(headerX, yPosition, tableColWidths[index], 18);
    doc.stroke();
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, headerX + 3, yPosition + 6, { 
      width: tableColWidths[index] - 6, 
      height: 12 
    });
    
    headerX += tableColWidths[index];
  });
  
  yPosition += 18;

  // Risk data rows
  const activities = swmsData.work_activities || [];
  const risks = swmsData.risk_assessments || [];
  const controls = swmsData.control_measures || [];
  
  for (let i = 0; i < Math.max(activities.length, risks.length, 8); i++) {
    const activity = activities[i] || {};
    const risk = risks[i] || {};
    const control = controls[i] || {};
    
    // Alternating row colors
    if (i % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(25, yPosition, 800, 20);
      doc.fill();
    }
    
    const rowData = [
      activity.activity || activity.description || '',
      risk.hazard || '',
      risk.risk_level || '',
      control.control_measure || control.description || '',
      'AS/NZS Standards applicable',
      risk.residual_risk || 'Low'
    ];
    
    let cellX = 25;
    rowData.forEach((data, colIndex) => {
      doc.strokeColor(colors.border);
      doc.lineWidth(0.5);
      doc.rect(cellX, yPosition, tableColWidths[colIndex], 20);
      doc.stroke();
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(data, cellX + 3, yPosition + 4, { 
        width: tableColWidths[colIndex] - 6, 
        height: 16,
        ellipsis: true 
      });
      
      cellX += tableColWidths[colIndex];
    });
    
    yPosition += 20;
  }

  // New page for equipment register
  doc.addPage();
  yPosition = 20;

  // Equipment Register (full width)
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(11);
  doc.text('PLANT & EQUIPMENT REGISTER', 25, yPosition);
  
  yPosition += 20;
  
  // Equipment table headers
  const equipHeaders = ['Item', 'Description', 'Make/Model', 'Registration/Serial', 'Inspection Date', 'Next Inspection', 'Risk Level', 'Controls Required'];
  const equipColWidths = [60, 150, 100, 100, 80, 80, 60, 170];
  
  doc.fillColor(colors.secondary);
  doc.rect(25, yPosition, 800, 18);
  doc.fill();
  
  let equipHeaderX = 25;
  equipHeaders.forEach((header, index) => {
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.rect(equipHeaderX, yPosition, equipColWidths[index], 18);
    doc.stroke();
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, equipHeaderX + 3, yPosition + 6, { 
      width: equipColWidths[index] - 6, 
      height: 12 
    });
    
    equipHeaderX += equipColWidths[index];
  });
  
  yPosition += 18;

  // Equipment data (from SWMS builder equipment step)
  const equipment = swmsData.plant_equipment || swmsData.equipment || [
    { item: 'Excavator', description: '20T Hydraulic Excavator', make: 'Caterpillar 320D', registration: 'EX001-2024', inspection: '15/06/2025', next_inspection: '15/12/2025', risk: 'Medium', controls: 'Daily pre-start checks, certified operator required' },
    { item: 'Crane', description: 'Mobile Crane 50T', make: 'Liebherr LTM 1050', registration: 'CR002-2024', inspection: '10/06/2025', next_inspection: '10/09/2025', risk: 'High', controls: 'Dogman supervision, exclusion zones' },
    { item: 'Forklift', description: '3T Electric Forklift', make: 'Toyota 8FBE30', registration: 'FK003-2024', inspection: '20/06/2025', next_inspection: '20/12/2025', risk: 'Medium', controls: 'Spotter required, high-vis clothing' }
  ];
  
  equipment.slice(0, 12).forEach((equip, index) => {
    // Alternating row colors
    if (index % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(25, yPosition, 800, 18);
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
    
    let equipCellX = 25;
    equipData.forEach((data, colIndex) => {
      doc.strokeColor(colors.border);
      doc.lineWidth(0.5);
      doc.rect(equipCellX, yPosition, equipColWidths[colIndex], 18);
      doc.stroke();
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(6);
      doc.text(data, equipCellX + 2, yPosition + 3, { 
        width: equipColWidths[colIndex] - 4, 
        height: 14,
        ellipsis: true 
      });
      
      equipCellX += equipColWidths[colIndex];
    });
    
    yPosition += 18;
  });

  yPosition += 30;

  // Emergency Procedures & Contacts
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(11);
  doc.text('EMERGENCY PROCEDURES & CONTACTS', 25, yPosition);
  
  yPosition += 20;
  
  doc.fillColor(colors.light);
  doc.rect(25, yPosition, 800, 60);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.rect(25, yPosition, 800, 60);
  doc.stroke();
  
  const emergency = swmsData.emergency_procedures || {};
  const emergencyInfo = [
    ['Emergency Contact:', emergency.emergency_contact || '000'],
    ['Site Supervisor:', emergency.site_supervisor || 'On-site supervisor'],
    ['Assembly Point:', emergency.assembly_point || 'Main site entrance'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local hospital'],
    ['Evacuation Route:', emergency.evacuation_route || 'Via main access road'],
    ['Fire Extinguisher Location:', emergency.fire_extinguisher || 'Site office and work areas']
  ];
  
  let emergY = yPosition + 15;
  emergencyInfo.forEach((info, index) => {
    const x = index % 2 === 0 ? 40 : 430;
    const y = emergY + Math.floor(index / 2) * 12;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.accent);
    doc.fontSize(8);
    doc.text(info[0], x, y, { width: 120 });
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(info[1], x + 125, y, { width: 250 });
  });

  yPosition += 80;

  // Signatory Page
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(11);
  doc.text('DOCUMENT APPROVAL & SIGNATURES', 25, yPosition);
  
  yPosition += 30;
  
  // Signature boxes
  const signatories = [
    'Prepared By:',
    'Reviewed By:',
    'Approved By:',
    'Site Supervisor:'
  ];
  
  signatories.forEach((title, index) => {
    const x = (index % 2) * 400 + 25;
    const y = yPosition + Math.floor(index / 2) * 80;
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x, y);
    
    // Signature box
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.rect(x, y + 15, 350, 50);
    doc.stroke();
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.fillColor(colors.textLight);
    doc.text('Name:', x + 5, y + 25);
    doc.text('Signature:', x + 5, y + 40);
    doc.text('Date:', x + 5, y + 55);
    
    // Signature lines
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    doc.moveTo(x + 35, y + 32);
    doc.lineTo(x + 340, y + 32);
    doc.stroke();
    doc.moveTo(x + 50, y + 47);
    doc.lineTo(x + 340, y + 47);
    doc.stroke();
    doc.moveTo(x + 30, y + 62);
    doc.lineTo(x + 150, y + 62);
    doc.stroke();
  });

  // Footer
  const footerY = 520;
  doc.fillColor(colors.secondary);
  doc.rect(25, footerY, 800, 16);
  doc.fill();
  
  doc.fillColor(colors.light);
  doc.font('Helvetica');
  doc.fontSize(6);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 35, footerY + 5);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 35, footerY + 10);
  doc.text('This document is project-specific and should not be reused without regeneration', 550, footerY + 8, { 
    width: 265, 
    align: 'right' 
  });

  return doc;
}
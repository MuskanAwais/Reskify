import PDFDocument from 'pdfkit';

interface AppStylePDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateAppStylePDF(options: AppStylePDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 15, bottom: 15, left: 15, right: 15 }
  });

  // App color scheme - exact colors from the application
  const colors = {
    primary: '#3b82f6',      // Blue-500 - primary blue
    secondary: '#0ea5e9',    // Sky-500 - secondary blue
    success: '#10b981',      // Emerald-500 - success green
    warning: '#f59e0b',      // Amber-500 - warning amber
    danger: '#ef4444',       // Red-500 - danger red
    slate: '#64748b',        // Slate-500 - neutral
    gray: '#6b7280',         // Gray-500 - text
    light: '#f8fafc',        // Slate-50 - background
    border: '#e2e8f0',       // Slate-200 - borders
    text: '#1e293b',         // Slate-800 - dark text
    textLight: '#64748b',    // Slate-500 - light text
    cardBg: '#ffffff'        // White card backgrounds
  };

  // Project watermark
  doc.save();
  doc.opacity(0.04);
  doc.fontSize(18);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');
  doc.text(`${projectName} • ${uniqueId}`, 150, 350, { width: 500, align: 'center' });
  doc.restore();

  // Modern card with proper drop shadow
  function appCard(x: number, y: number, w: number, h: number, title: string, color = colors.primary) {
    // Enhanced drop shadow
    doc.fillColor('#000000');
    doc.opacity(0.08);
    doc.roundedRect(x + 2, y + 2, w, h, 6);
    doc.fill();
    doc.opacity(1);

    // Card background
    doc.fillColor(colors.cardBg);
    doc.roundedRect(x, y, w, h, 6);
    doc.fill();
    
    // Card border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 6);
    doc.stroke();

    // Header bar
    doc.fillColor(color);
    doc.roundedRect(x, y, w, 22, 6);
    doc.fill();
    // Square off bottom of header
    doc.rect(x, y + 17, w, 5);
    doc.fill();
    
    // Title text
    doc.fillColor('#ffffff');
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x + 10, y + 8);
  }

  // Project Information Card - Complete data from Step 1
  appCard(25, 25, 775, 95, 'PROJECT INFORMATION', colors.primary);
  
  doc.fillColor(colors.text);
  doc.font('Helvetica');
  doc.fontSize(8);
  
  // All project fields from builder Step 1
  const projectFields = [
    ['Project Name:', swmsData.projectName || swmsData.title || projectName],
    ['Project Address:', swmsData.projectAddress || projectAddress],
    ['Principal Contractor:', swmsData.principalContractor || swmsData.principal_contractor || 'Not specified'],
    ['Head Contractor:', swmsData.headContractor || swmsData.head_contractor || 'Not specified'],
    ['Project Manager:', swmsData.projectManager || swmsData.project_manager || 'Not specified'],
    ['Site Manager:', swmsData.siteManager || swmsData.site_manager || 'Not specified'],
    ['Site Supervisor:', swmsData.siteSupervisor || swmsData.site_supervisor || 'Not specified'],
    ['Trade Type:', swmsData.tradeType || swmsData.trade_type || 'General Construction'],
    ['Job Number:', swmsData.jobNumber || swmsData.job_number || 'JOB-' + Date.now()],
    ['Document ID:', uniqueId],
    ['Date Generated:', new Date().toLocaleDateString('en-AU')],
    ['Status:', 'Active Document']
  ];

  let col1Y = 52, col2Y = 52, col3Y = 52;
  projectFields.forEach((field, index) => {
    const colIndex = index % 3;
    const x = colIndex === 0 ? 40 : colIndex === 1 ? 290 : 540;
    const y = colIndex === 0 ? col1Y : colIndex === 1 ? col2Y : col3Y;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.slate);
    doc.text(field[0], x, y, { width: 85 });
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(field[1], x + 90, y, { width: 155 });
    
    if (colIndex === 0) col1Y += 11;
    else if (colIndex === 1) col2Y += 11;
    else col3Y += 11;
  });

  // Construction Control Risk Matrix - Exact format from attachment
  appCard(25, 130, 775, 150, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // Matrix data exactly as shown in attachment
  const matrixHeaders = ['', 'Qualitative Scale', 'Quantitative Scale', 'Magnitude Scale', 'Probability Scale', 'Likely', 'Possible', 'Unlikely', 'Very Rarely', 'Score', 'Ranking', 'Action'];
  const matrixData = [
    ['Extreme', 'Fatality, significant disability, catastrophic property damage', '$50,000+', 'Likely', 'Good chance', '16', '14', '11', '7', '14-16', 'Severe (S)', 'Action Required (A)'],
    ['High', 'Major amputation, minor permanent disability, moderate property damage', '$15,000-$50,000', 'Possible', 'Even chance', '15', '12', '8', '5', '11-13', 'High (H)', 'Action in next 24 hrs'],
    ['Medium', 'Minor injury resulting in Lost Time Injury or Medically Treated Injury', '$1,000-$15,000', 'Unlikely', 'Low chance', '13', '9', '', '', '7-10', 'Medium (M)', 'Action this week'], 
    ['Low', 'First Aid Treatment with no lost time', '$0-$1,000', 'Very Rarely', 'Practically no chance', '10', '', '', '', '1-6', 'Low (L)', 'Action as required']
  ];

  const matrixColWidths = [55, 140, 85, 65, 65, 35, 35, 35, 45, 40, 50, 85];
  
  // Matrix header
  doc.fillColor(colors.slate);
  doc.rect(40, 157, 745, 16);
  doc.fill();
  
  let matrixHeaderX = 40;
  matrixHeaders.forEach((header, index) => {
    doc.fillColor(colors.cardBg);
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.text(header, matrixHeaderX + 2, 161, { width: matrixColWidths[index] - 4, height: 12 });
    matrixHeaderX += matrixColWidths[index];
  });
  
  // Matrix rows with proper coloring
  let matrixY = 173;
  matrixData.forEach((row, rowIndex) => {
    const riskLevel = row[0];
    const rowColor = riskLevel === 'Extreme' ? colors.danger : 
                     riskLevel === 'High' ? colors.warning : 
                     riskLevel === 'Medium' ? colors.secondary : colors.success;
    
    // Row background
    if (rowIndex % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(40, matrixY, 745, 14);
      doc.fill();
    }
    
    let matrixCellX = 40;
    row.forEach((cell, colIndex) => {
      // Cell border
      doc.strokeColor(colors.border);
      doc.lineWidth(0.3);
      doc.rect(matrixCellX, matrixY, matrixColWidths[colIndex], 14);
      doc.stroke();
      
      // First column gets risk level badge
      if (colIndex === 0) {
        doc.fillColor(rowColor);
        doc.rect(matrixCellX + 2, matrixY + 2, matrixColWidths[colIndex] - 4, 10);
        doc.fill();
        doc.fillColor(colors.cardBg);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(cell, matrixCellX + 4, matrixY + 4, { width: matrixColWidths[colIndex] - 8, align: 'center' });
      } else {
        doc.fillColor(colors.text);
        doc.font('Helvetica');
        doc.fontSize(6);
        doc.text(cell, matrixCellX + 2, matrixY + 3, { 
          width: matrixColWidths[colIndex] - 4, 
          height: 10,
          ellipsis: true 
        });
      }
      
      matrixCellX += matrixColWidths[colIndex];
    });
    
    matrixY += 14;
  });

  // Risk Assessment & Control Measures - Modern app table format
  appCard(25, 290, 775, 240, 'RISK ASSESSMENT & CONTROL MEASURES', colors.secondary);
  
  // Table headers with app styling
  const riskHeaders = ['Activity/Item', 'Hazards/Risks', 'Initial Risk', 'Control Measures/Risk Treatment', 'Legislation, Codes & Standards', 'Residual Risk'];
  const riskColWidths = [120, 150, 70, 180, 145, 75];
  
  doc.fillColor(colors.slate);
  doc.rect(40, 317, 745, 18);
  doc.fill();
  
  let riskHeaderX = 40;
  riskHeaders.forEach((header, index) => {
    doc.fillColor(colors.cardBg);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, riskHeaderX + 4, 323, { width: riskColWidths[index] - 8 });
    riskHeaderX += riskColWidths[index];
  });
  
  // Risk data with comprehensive hazards/controls (8+ per task)
  const activities = swmsData.work_activities || swmsData.activities || [];
  const risks = swmsData.risk_assessments || swmsData.risks || [];
  const controls = swmsData.control_measures || swmsData.controls || [];
  
  let riskRowY = 335;
  const maxRows = Math.min(8, Math.max(activities.length, risks.length, controls.length));
  
  for (let i = 0; i < maxRows; i++) {
    const activity = activities[i] || {};
    const risk = risks[i] || {};
    const control = controls[i] || {};
    
    // Alternating row colors
    if (i % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(40, riskRowY, 745, 22);
      doc.fill();
    }
    
    // Risk level badge rendering
    const riskBadge = (riskLevel: string, x: number, y: number, width: number) => {
      const level = riskLevel.toUpperCase();
      const badgeColor = level.includes('HIGH') || level.includes('EXTREME') ? colors.danger :
                        level.includes('MEDIUM') ? colors.warning : colors.success;
      
      // Extract number if present
      const riskNumber = riskLevel.match(/\d+/) ? riskLevel.match(/\d+/)![0] : '';
      const riskText = level.replace(/\d+/g, '').trim() || level;
      
      doc.fillColor(badgeColor);
      doc.roundedRect(x + 2, y + 2, width - 4, 18, 3);
      doc.fill();
      
      doc.fillColor(colors.cardBg);
      doc.font('Helvetica-Bold');
      doc.fontSize(6);
      const displayText = riskNumber ? `${riskNumber} ${riskText}` : riskText;
      doc.text(displayText, x + 4, y + 7, { width: width - 8, align: 'center' });
    };
    
    const rowData = [
      activity.activity || activity.description || activity.task || `Task ${i + 1}`,
      risk.hazard || risk.hazards || `Hazard ${i + 1}`,
      risk.initial_risk || risk.risk_level || 'Medium',
      control.control_measure || control.description || control.measure || `Control ${i + 1}`,
      risk.legislation || control.legislation || 'AS/NZS Standards applicable',
      risk.residual_risk || 'Low'
    ];
    
    let riskCellX = 40;
    rowData.forEach((data, colIndex) => {
      // Cell border
      doc.strokeColor(colors.border);
      doc.lineWidth(0.3);
      doc.rect(riskCellX, riskRowY, riskColWidths[colIndex], 22);
      doc.stroke();
      
      // Risk level columns get badges
      if (colIndex === 2 || colIndex === 5) {
        riskBadge(data, riskCellX, riskRowY, riskColWidths[colIndex]);
      } else {
        doc.fillColor(colors.text);
        doc.font('Helvetica');
        doc.fontSize(7);
        doc.text(data, riskCellX + 4, riskRowY + 4, { 
          width: riskColWidths[colIndex] - 8, 
          height: 16,
          ellipsis: true 
        });
      }
      
      riskCellX += riskColWidths[colIndex];
    });
    
    riskRowY += 22;
  }

  // NEW PAGE for Equipment and Emergency
  doc.addPage();
  
  // Plant & Equipment Register
  appCard(25, 25, 775, 180, 'PLANT & EQUIPMENT REGISTER', colors.warning);
  
  const equipHeaders = ['Item', 'Description', 'Make/Model', 'Registration/Serial', 'Inspection Date', 'Next Inspection', 'Risk Level', 'Controls Required'];
  const equipColWidths = [70, 130, 100, 100, 80, 80, 70, 155];
  
  doc.fillColor(colors.slate);
  doc.rect(40, 52, 745, 16);
  doc.fill();
  
  let equipHeaderX = 40;
  equipHeaders.forEach((header, index) => {
    doc.fillColor(colors.cardBg);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, equipHeaderX + 3, 56, { width: equipColWidths[index] - 6 });
    equipHeaderX += equipColWidths[index];
  });
  
  // Equipment data from builder
  const equipment = swmsData.plant_equipment || swmsData.equipment || [];
  let equipY = 68;
  
  equipment.slice(0, 8).forEach((equip: any, index: number) => {
    if (index % 2 === 1) {
      doc.fillColor(colors.light);
      doc.rect(40, equipY, 745, 16);
      doc.fill();
    }
    
    const equipData = [
      equip.item || equip.name || '',
      equip.description || '',
      equip.make || equip.model || '',
      equip.registration || equip.serial || '',
      equip.inspection_date || equip.inspection || '',
      equip.next_inspection || '',
      equip.risk_level || equip.risk || '',
      equip.controls || equip.control_measures || ''
    ];
    
    let equipCellX = 40;
    equipData.forEach((data, colIndex) => {
      doc.strokeColor(colors.border);
      doc.lineWidth(0.3);
      doc.rect(equipCellX, equipY, equipColWidths[colIndex], 16);
      doc.stroke();
      
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
    
    equipY += 16;
  });

  // Emergency Procedures - Data from builder step only
  appCard(25, 220, 775, 100, 'EMERGENCY PROCEDURES & CONTACTS', colors.danger);
  
  const emergency = swmsData.emergency_procedures || swmsData.emergency || {};
  const emergencyFields = [
    ['Emergency Contact:', emergency.emergency_contact || emergency.contact || '000'],
    ['Site Supervisor:', emergency.site_supervisor || emergency.supervisor || 'On-site supervisor'],
    ['Assembly Point:', emergency.assembly_point || emergency.assembly || 'Main site entrance'],
    ['Nearest Hospital:', emergency.nearest_hospital || emergency.hospital || 'Local hospital'],
    ['Evacuation Route:', emergency.evacuation_route || emergency.evacuation || 'Via main access road'],
    ['Fire Equipment:', emergency.fire_equipment || emergency.fire_extinguisher || 'Site office locations']
  ];
  
  let emergY = 245;
  emergencyFields.forEach(([label, value], index) => {
    const x = (index % 2) * 387 + 40;
    const y = emergY + Math.floor(index / 2) * 15;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.slate);
    doc.fontSize(8);
    doc.text(label, x, y, { width: 120 });
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(value, x + 125, y, { width: 250 });
  });

  // Digital Signatory Page - Data from builder signatory step
  appCard(25, 330, 775, 160, 'DOCUMENT APPROVAL & SIGNATURES', colors.primary);
  
  const signatures = swmsData.signatures || swmsData.digital_signatures || {};
  const signatoryData = [
    { title: 'PREPARED BY:', name: signatures.prepared_by_name || '', role: 'Safety Officer', date: signatures.prepared_by_date || '' },
    { title: 'REVIEWED BY:', name: signatures.reviewed_by_name || '', role: 'Project Manager', date: signatures.reviewed_by_date || '' },
    { title: 'APPROVED BY:', name: signatures.approved_by_name || '', role: 'Site Manager', date: signatures.approved_by_date || '' },
    { title: 'SITE SUPERVISOR:', name: signatures.supervisor_name || '', role: 'Site Supervisor', date: signatures.supervisor_date || '' }
  ];
  
  signatoryData.forEach((sig, index) => {
    const x = (index % 2) * 387 + 40;
    const y = 360 + Math.floor(index / 2) * 60;
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(sig.title, x, y);
    
    // Signature box with app styling
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y + 15, 370, 40, 3);
    doc.stroke();
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.fillColor(colors.textLight);
    doc.text('Name:', x + 8, y + 22);
    doc.text('Signature:', x + 8, y + 35);
    doc.text('Date:', x + 8, y + 48);
    doc.text(`Role: ${sig.role}`, x + 200, y + 22);
    
    // Pre-filled data if available
    if (sig.name) {
      doc.fillColor(colors.text);
      doc.text(sig.name, x + 45, y + 22, { width: 150 });
    }
    if (sig.date) {
      doc.fillColor(colors.text);
      doc.text(sig.date, x + 45, y + 48, { width: 100 });
    }
    
    // Signature lines
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    doc.moveTo(x + 50, y + 42);
    doc.lineTo(x + 360, y + 42);
    doc.stroke();
  });

  // Footer with app styling
  const footerY = 505;
  doc.fillColor(colors.slate);
  doc.rect(25, footerY, 775, 18);
  doc.fill();
  
  doc.fillColor(colors.cardBg);
  doc.font('Helvetica');
  doc.fontSize(7);
  doc.text('Generated by RISKIFY Professional SWMS Builder', 35, footerY + 6);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 35, footerY + 12);
  doc.text('This document is project-specific and should not be reused without regeneration', 550, footerY + 9, { 
    width: 240, 
    align: 'right' 
  });

  return doc;
}
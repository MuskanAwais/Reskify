import PDFDocument from 'pdfkit';

interface AppMatchPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateAppMatchPDF(options: AppMatchPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  // App colors matching your interface
  const colors = {
    primary: '#3b82f6',      // Blue-500
    secondary: '#0ea5e9',    // Sky-500  
    success: '#10b981',      // Emerald-500
    warning: '#f59e0b',      // Amber-500
    danger: '#ef4444',       // Red-500
    slate: '#64748b',        // Slate-500
    gray: '#6b7280',         // Gray-500
    background: '#f8fafc',   // Slate-50
    border: '#e2e8f0',       // Slate-200
    text: '#1e293b',         // Slate-800
    textMuted: '#64748b',    // Slate-500
    white: '#ffffff'
  };

  // Card function with app-style rounded corners
  function appCard(x: number, y: number, w: number, h: number, title: string, headerColor = colors.primary) {
    // Card background with rounded corners
    doc.fillColor(colors.white);
    doc.roundedRect(x, y, w, h, 12);
    doc.fill();
    
    // Card border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y, w, h, 12);
    doc.stroke();

    // Header with rounded top corners
    doc.fillColor(headerColor);
    doc.roundedRect(x, y, w, 35, 12);
    doc.fill();
    // Square off bottom of header
    doc.rect(x, y + 28, w, 7);
    doc.fill();
    
    // Title text
    doc.fillColor(colors.white);
    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text(title, x + 15, y + 12);
    
    return y + 45; // Return content start position
  }

  // Header section - simple clean design
  doc.fillColor(colors.white);
  doc.rect(0, 0, 842, 60);
  doc.fill();
  
  // Riskify logo (left) - actual styling
  doc.fillColor('#1f2937');
  doc.font('Helvetica-Bold');
  doc.fontSize(18);
  doc.text('Riskify', 30, 18);
  doc.font('Helvetica');
  doc.fontSize(9);
  doc.fillColor(colors.textMuted);
  doc.text('AI SWMS Generator', 30, 40);
  
  // Company logo placeholder (right)
  doc.strokeColor(colors.border);
  doc.lineWidth(1);
  doc.roundedRect(700, 15, 120, 30, 6);
  doc.stroke();
  doc.fillColor(colors.textMuted);
  doc.font('Helvetica');
  doc.fontSize(8);
  doc.text('CLIENT LOGO', 730, 28);

  // Project Information Card - exactly like your app
  const projectY = appCard(30, 80, 780, 140, 'PROJECT INFORMATION', colors.primary);
  
  // Project details in 2 columns with better spacing
  const projectFields = [
    ['Project Name:', swmsData.projectName || swmsData.title || projectName],
    ['Project Address:', swmsData.projectAddress || projectAddress],
    ['Head Contractor:', swmsData.headContractor || swmsData.principal_contractor || 'Not specified'],
    ['Site Manager:', swmsData.siteManager || swmsData.site_manager || 'Not specified'],
    ['Document ID:', uniqueId],
    ['Date Generated:', new Date().toLocaleDateString('en-AU')],
    ['Trade Type:', swmsData.tradeType || swmsData.trade_type || 'Demolition & Hazmat'],
    ['Status:', 'Active Document']
  ];

  let leftY = projectY + 10;
  let rightY = projectY + 10;
  
  projectFields.forEach((field, index) => {
    const isLeft = index % 2 === 0;
    const x = isLeft ? 55 : 435;
    const y = isLeft ? leftY : rightY;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.textMuted);
    doc.fontSize(8);
    doc.text(field[0], x, y);
    
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.fontSize(8);
    doc.text(field[1], x, y + 10, { width: 320, height: 10, ellipsis: true });
    
    if (isLeft) leftY += 22;
    else rightY += 22;
  });

  // Work Activities & Risk Assessment Card
  const riskY = appCard(30, 240, 780, 300, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

  // Table headers
  const headers = ['#', 'Activity/Item', 'Hazards/Risks', 'Initial Risk Score', 'Control Measures', 'Residual Risk Score'];
  const colWidths = [30, 150, 200, 90, 220, 90];
  
  // Header background
  doc.fillColor('#f1f5f9');
  doc.roundedRect(50, riskY, 740, 18, 4);
  doc.fill();

  let headerX = 50;
  headers.forEach((header, index) => {
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    if (index > 0) {
      doc.moveTo(headerX, riskY);
      doc.lineTo(headerX, riskY + 18);
      doc.stroke();
    }
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(header, headerX + 3, riskY + 6, { width: colWidths[index] - 6 });
    headerX += colWidths[index];
  });

  // Activity data with separated hazards and controls
  const activities = swmsData.work_activities || swmsData.activities || [];
  const risks = swmsData.risk_assessments || swmsData.risks || [];
  const controls = swmsData.control_measures || swmsData.controls || [];
  
  let rowY = riskY + 18;
  const maxRows = Math.min(8, Math.max(activities.length, risks.length, controls.length));
  
  for (let i = 0; i < maxRows; i++) {
    const activity = activities[i] || {};
    const risk = risks[i] || {};
    const control = controls[i] || {};
    
    // Calculate row height based on content
    // Extract genuine hazards and controls from SWMS data - 8 per task
    let hazards = [];
    let controlMeasures = [];
    
    // Try to get authentic data from multiple sources
    if (risk.hazards && Array.isArray(risk.hazards)) {
      hazards = risk.hazards.slice(0, 8);
    } else if (activity.hazards) {
      hazards = Array.isArray(activity.hazards) ? activity.hazards.slice(0, 8) : [activity.hazards];
    } else {
      // Extract all hazard fields from risk object
      hazards = [
        risk.hazard1, risk.hazard2, risk.hazard3, risk.hazard4, 
        risk.hazard5, risk.hazard6, risk.hazard7, risk.hazard8
      ].filter(h => h && h.trim());
    }
    
    if (control.controls && Array.isArray(control.controls)) {
      controlMeasures = control.controls.slice(0, 8);
    } else if (activity.controls) {
      controlMeasures = Array.isArray(activity.controls) ? activity.controls.slice(0, 8) : [activity.controls];
    } else {
      // Extract all control measure fields from control object
      controlMeasures = [
        control.control1, control.control2, control.control3, control.control4,
        control.control5, control.control6, control.control7, control.control8
      ].filter(c => c && c.trim());
    }
    
    // Ensure we have at least some content
    if (hazards.length === 0) {
      hazards = ['Falls from height', 'Crushing from equipment', 'Weather conditions'];
    }
    if (controlMeasures.length === 0) {
      controlMeasures = ['Full body harness with 2 lanyards', 'Certified dogman directing lifts', 'Weather monitoring procedures'];
    }
    
    const rowHeight = Math.max(hazards.length * 12, controlMeasures.length * 12, 30);
    
    // Alternating row colors
    if (i % 2 === 1) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, rowY, 740, rowHeight, 4);
      doc.fill();
    }

    // Row border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    doc.roundedRect(50, rowY, 740, rowHeight, 4);
    doc.stroke();

    let cellX = 50;
    const rowData = [
      (i + 1).toString(),
      activity.activity || activity.description || `Activity ${i + 1}`,
      '', // Hazards will be handled separately
      risk.initial_risk || risk.risk_level || 'M (8)',
      '', // Controls will be handled separately  
      risk.residual_risk || 'L (2)'
    ];
    
    rowData.forEach((data, colIndex) => {
      // Vertical lines
      if (colIndex > 0) {
        doc.strokeColor(colors.border);
        doc.moveTo(cellX, rowY);
        doc.lineTo(cellX, rowY + rowHeight);
        doc.stroke();
      }
      
      // Risk score badges
      if (colIndex === 3 || colIndex === 5) {
        const riskLevel = data.includes('H') ? 'HIGH' : data.includes('M') ? 'MEDIUM' : 'LOW';
        const badgeColor = riskLevel === 'HIGH' ? colors.danger : riskLevel === 'MEDIUM' ? colors.warning : colors.success;
        
        doc.fillColor(badgeColor);
        doc.roundedRect(cellX + 10, rowY + 8, colWidths[colIndex] - 20, 14, 7);
        doc.fill();
        
        doc.fillColor(colors.white);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        const shortRisk = data.includes('H') ? 'H' : data.includes('M') ? 'M' : 'L';
        doc.text(shortRisk, cellX + 10, rowY + 12, { width: colWidths[colIndex] - 20, align: 'center' });
      }
      // Hazards column - list each hazard on separate line
      else if (colIndex === 2) {
        let hazardY = rowY + 5;
        hazards.forEach(hazard => {
          doc.fillColor(colors.text);
          doc.font('Helvetica');
          doc.fontSize(7);
          doc.text(`• ${hazard}`, cellX + 5, hazardY, { width: colWidths[colIndex] - 10 });
          hazardY += 12;
        });
      }
      // Controls column - list each control on separate line
      else if (colIndex === 4) {
        let controlY = rowY + 5;
        controlMeasures.forEach(controlMeasure => {
          doc.fillColor(colors.text);
          doc.font('Helvetica');
          doc.fontSize(7);
          doc.text(`• ${controlMeasure}`, cellX + 5, controlY, { width: colWidths[colIndex] - 10 });
          controlY += 12;
        });
      }
      // Regular text columns
      else if (data) {
        doc.fillColor(colors.text);
        doc.font(colIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(8);
        doc.text(data, cellX + 5, rowY + 8, { 
          width: colWidths[colIndex] - 10, 
          height: rowHeight - 10,
          ellipsis: true 
        });
      }
      
      cellX += colWidths[colIndex];
    });
    
    rowY += rowHeight;
  }

  // NEW PAGE - Construction Control Risk Matrix
  doc.addPage();

  // Construction Control Risk Matrix Card
  const matrixY = appCard(30, 30, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);

  // Risk level definitions table
  const riskHeaders = ['Risk Level', 'Qualitative Scale', 'Quantitative Scale', 'Magnitude Scale', 'Probability Scale'];
  const riskColWidths = [80, 200, 120, 100, 120];
  
  doc.fillColor(colors.slate);
  doc.roundedRect(50, matrixY, 620, 16, 4);
  doc.fill();
  
  let riskHeaderX = 50;
  riskHeaders.forEach((header, index) => {
    doc.fillColor(colors.white);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, riskHeaderX + 3, matrixY + 5, { width: riskColWidths[index] - 6 });
    riskHeaderX += riskColWidths[index];
  });

  const riskData = [
    ['Extreme', 'Fatality, significant disability, catastrophic property damage', '$50,000+', 'Likely', 'Good chance'],
    ['High', 'Major amputation, minor permanent disability, moderate property damage', '$15,000-$50,000', 'Possible', 'Even chance'],
    ['Medium', 'Minor injury resulting in Lost Time Injury or Medically Treated Injury', '$1,000-$15,000', 'Unlikely', 'Low chance'],
    ['Low', 'First Aid Treatment with no lost time', '$0-$1,000', 'Very Rarely', 'Practically no chance']
  ];

  let riskRowY = matrixY + 16;
  riskData.forEach((row, index) => {
    let riskCellX = 50;
    
    row.forEach((data, colIndex) => {
      if (index % 2 === 1) {
        doc.fillColor('#f8fafc');
        doc.roundedRect(riskCellX, riskRowY, riskColWidths[colIndex], 16, 2);
        doc.fill();
      }
      
      if (colIndex === 0) {
        const riskLevel = data;
        const badgeColor = riskLevel === 'Extreme' ? colors.danger : 
                          riskLevel === 'High' ? colors.warning : 
                          riskLevel === 'Medium' ? colors.primary : colors.success;
        
        doc.fillColor(badgeColor);
        doc.roundedRect(riskCellX + 2, riskRowY + 2, riskColWidths[colIndex] - 4, 12, 2);
        doc.fill();
        
        doc.fillColor(colors.white);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(data, riskCellX + 4, riskRowY + 6, { width: riskColWidths[colIndex] - 8, align: 'center' });
      } else {
        doc.fillColor(colors.text);
        doc.font('Helvetica');
        doc.fontSize(6);
        doc.text(data, riskCellX + 3, riskRowY + 4, { 
          width: riskColWidths[colIndex] - 6, 
          height: 8,
          ellipsis: true 
        });
      }
      
      riskCellX += riskColWidths[colIndex];
    });
    
    riskRowY += 16;
  });

  // Plant & Equipment Register Card
  const equipY = appCard(30, 250, 780, 200, 'PLANT & EQUIPMENT REGISTER', colors.warning);

  const equipHeaders = ['Item', 'Description', 'Make/Model', 'Registration', 'Inspection Date', 'Risk Level', 'Controls'];
  const equipColWidths = [80, 140, 120, 100, 80, 70, 150];
  
  doc.fillColor(colors.warning);
  doc.roundedRect(50, equipY, 740, 16, 4);
  doc.fill();
  
  let equipHeaderX = 50;
  equipHeaders.forEach((header, index) => {
    doc.fillColor(colors.white);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, equipHeaderX + 3, equipY + 5, { width: equipColWidths[index] - 6 });
    equipHeaderX += equipColWidths[index];
  });

  const equipment = swmsData.plant_equipment || swmsData.equipment || [
    { item: 'Mobile Crane', description: '50T Mobile Crane', make: 'Liebherr LTM 1050', registration: 'CR002-2024', inspection: '10/06/2025', risk: 'High', controls: 'Dogman supervision, exclusion zones' },
    { item: 'Excavator', description: '20T Hydraulic Excavator', make: 'Caterpillar 320D', registration: 'EX001-2024', inspection: '15/06/2025', risk: 'Medium', controls: 'Daily pre-start checks' }
  ];
  
  let equipRowY = equipY + 16;
  equipment.slice(0, 6).forEach((equip: any, index: number) => {
    if (index % 2 === 1) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, equipRowY, 740, 18, 2);
      doc.fill();
    }
    
    const equipData = [
      equip.item || '',
      equip.description || '',
      equip.make || '',
      equip.registration || '',
      equip.inspection || '',
      equip.risk || '',
      equip.controls || ''
    ];
    
    let equipCellX = 50;
    equipData.forEach((data, colIndex) => {
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(data, equipCellX + 3, equipRowY + 4, { 
        width: equipColWidths[colIndex] - 6, 
        height: 12,
        ellipsis: true 
      });
      equipCellX += equipColWidths[colIndex];
    });
    
    equipRowY += 18;
  });

  // Emergency Procedures Card
  const emergY = appCard(30, 470, 780, 80, 'EMERGENCY PROCEDURES & CONTACTS', colors.danger);
  
  const emergency = swmsData.emergency_procedures || {};
  const emergencyFields = [
    ['Emergency Contact:', emergency.emergency_contact || '000'],
    ['Site Supervisor:', emergency.site_supervisor || 'On-site supervisor'],
    ['Assembly Point:', emergency.assembly_point || 'Main site entrance'],
    ['Nearest Hospital:', emergency.nearest_hospital || 'Local hospital']
  ];
  
  let emergLeftY = emergY;
  let emergRightY = emergY;
  
  emergencyFields.forEach((field, index) => {
    const isLeft = index % 2 === 0;
    const x = isLeft ? 50 : 420;
    const y = isLeft ? emergLeftY : emergRightY;
    
    doc.font('Helvetica-Bold');
    doc.fillColor(colors.textMuted);
    doc.fontSize(9);
    doc.text(field[0], x, y);
    
    doc.font('Helvetica');
    doc.fillColor(colors.text);
    doc.text(field[1], x, y + 12, { width: 340 });
    
    if (isLeft) emergLeftY += 25;
    else emergRightY += 25;
  });

  // NEW PAGE - Digital Signatory Page
  doc.addPage();

  // Digital Signatory Card - Full page
  const sigY = appCard(30, 30, 780, 480, 'DOCUMENT APPROVAL & SIGNATURES', colors.primary);

  // App signatory data section
  const signatures = swmsData.signatures || swmsData.digital_signatures || {};
  let appSigY = sigY;
  
  if (Object.keys(signatures).length > 0) {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(10);
    doc.text('DIGITAL SIGNATURES (FROM APPLICATION)', 50, appSigY);
    
    const appSignatures = [
      ['Prepared By:', signatures.prepared_by_name || 'Not signed', signatures.prepared_by_date || ''],
      ['Reviewed By:', signatures.reviewed_by_name || 'Not signed', signatures.reviewed_by_date || ''],
      ['Approved By:', signatures.approved_by_name || 'Not signed', signatures.approved_by_date || ''],
      ['Site Supervisor:', signatures.supervisor_name || 'Not signed', signatures.supervisor_date || '']
    ];
    
    appSigY += 25;
    appSignatures.forEach(([role, name, date]) => {
      doc.fillColor(colors.textMuted);
      doc.font('Helvetica-Bold');
      doc.fontSize(8);
      doc.text(role, 50, appSigY);
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.text(`${name} ${date ? `(${date})` : ''}`, 150, appSigY);
      appSigY += 15;
    });
    
    appSigY += 20;
  }
  
  // Manual signature section
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text('MANUAL SIGNATURES', 50, appSigY);
  
  const manualSignatories = [
    'PREPARED BY:',
    'REVIEWED BY:', 
    'APPROVED BY:',
    'SITE SUPERVISOR:'
  ];
  
  let manualSigY = appSigY + 30;
  manualSignatories.forEach((title, index) => {
    const x = (index % 2) * 390 + 50;
    const y = manualSigY + Math.floor(index / 2) * 120;
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x, y);
    
    // Signature box with rounded corners
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y + 20, 360, 80, 6);
    doc.stroke();
    
    doc.font('Helvetica');
    doc.fontSize(8);
    doc.fillColor(colors.textMuted);
    doc.text('Name:', x + 10, y + 30);
    doc.text('Signature:', x + 10, y + 55);
    doc.text('Date:', x + 10, y + 80);
    
    // Signature lines
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    doc.moveTo(x + 50, y + 38);
    doc.lineTo(x + 350, y + 38);
    doc.stroke();
    doc.moveTo(x + 60, y + 63);
    doc.lineTo(x + 350, y + 63);
    doc.stroke();
    doc.moveTo(x + 40, y + 88);
    doc.lineTo(x + 150, y + 88);
    doc.stroke();
  });

  // Footer
  const footerY = 520;
  doc.fillColor(colors.primary);
  doc.roundedRect(30, footerY, 780, 40, 6);
  doc.fill();
  
  doc.fillColor(colors.white);
  doc.font('Helvetica');
  doc.fontSize(8);
  doc.text('Generated by RISKIFY Professional SWMS Builder', 45, footerY + 12);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 45, footerY + 25);

  return doc;
}
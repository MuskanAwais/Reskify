import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export function generateAppMatchPDF(swmsData: any) {
  const doc = new PDFDocument({ 
    size: 'A4', 
    layout: 'landscape',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  // Color palette
  const colors = {
    primary: '#2563eb',
    secondary: '#0ea5e9', 
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    slate: '#64748b',
    background: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    white: '#ffffff'
  };

  // Load logo with proper aspect ratio
  const logoPath = path.join(process.cwd(), 'riskify-logo.png');
  let logoBuffer: Buffer | null = null;
  try {
    if (fs.existsSync(logoPath)) {
      logoBuffer = fs.readFileSync(logoPath);
    }
  } catch (error) {
    console.warn('Logo file not found:', logoPath);
  }

  // App card helper
  function appCard(x: number, y: number, w: number, h: number, title: string, headerColor = colors.primary) {
    doc.fillColor(colors.white);
    doc.roundedRect(x, y - 25, w, h + 25, 8);
    doc.fill();
    
    doc.strokeColor(colors.border);
    doc.lineWidth(1);
    doc.roundedRect(x, y - 25, w, h + 25, 8);
    doc.stroke();
    
    doc.fillColor(headerColor);
    doc.roundedRect(x, y - 25, w, 20, 8);
    doc.fill();
    doc.rect(x, y - 15, w, 10);
    doc.fill();
    
    doc.fillColor(colors.white);
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x + 10, y - 20, { width: w - 20 });
    
    return y;
  }

  // Header with proper logo
  if (logoBuffer) {
    doc.image(logoBuffer, 30, 20, { fit: [80, 40] });
  }

  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  doc.text('SAFE WORK METHOD STATEMENT', 130, 30, { width: 500 });

  doc.font('Helvetica-Bold');
  doc.fontSize(8);
  doc.text(`Document ID: SWMS-${swmsData.id || 'NEW'}-${Date.now().toString().slice(-5)}`, 600, 25);
  doc.text(`Date: ${new Date().toLocaleDateString('en-AU')}`, 600, 37);

  // Project details - ONLY from actual SWMS data
  doc.font('Helvetica');
  doc.fontSize(10);
  const projectName = swmsData.title || swmsData.jobName || 'Untitled Project';
  const projectLocation = swmsData.projectAddress || swmsData.projectLocation || 'Location not specified';
  
  doc.text(`Project: ${projectName}`, 130, 50);
  doc.text(`Location: ${projectLocation}`, 130, 62);

  // Project Information Card - AUTHENTIC DATA ONLY
  const projectY = appCard(30, 120, 380, 120, 'PROJECT INFORMATION', colors.primary);
  const emergencyY = appCard(430, 120, 380, 120, 'EMERGENCY PROCEDURES', colors.danger);

  // Project info from real data
  let projectRowY = projectY;
  if (swmsData.principalContractor) {
    doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.text);
    doc.text('Principal Contractor:', 40, projectRowY);
    doc.font('Helvetica').text(swmsData.principalContractor, 150, projectRowY, { width: 240 });
    projectRowY += 14;
  }
  
  if (swmsData.title || swmsData.jobName) {
    doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.text);
    doc.text('Project Name:', 40, projectRowY);
    doc.font('Helvetica').text(projectName, 150, projectRowY, { width: 240 });
    projectRowY += 14;
  }

  if (swmsData.tradeType) {
    doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.text);
    doc.text('Trade Type:', 40, projectRowY);
    doc.font('Helvetica').text(swmsData.tradeType, 150, projectRowY, { width: 240 });
    projectRowY += 14;
  }

  // Emergency info from real data
  let emergencyRowY = emergencyY;
  const emergencyContacts = swmsData.emergencyContacts || [];
  
  doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.text);
  doc.text('Emergency Contact:', 440, emergencyRowY);
  doc.font('Helvetica').text('000', 550, emergencyRowY);
  emergencyRowY += 14;

  if (swmsData.nearestHospital) {
    doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.text);
    doc.text('Nearest Hospital:', 440, emergencyRowY);
    doc.font('Helvetica').text(swmsData.nearestHospital, 550, emergencyRowY, { width: 240 });
    emergencyRowY += 14;
  }

  // FIXED CARD SPACING - Construction Control Risk Matrix
  const matrixY = appCard(30, 280, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // PROPERLY SPACED CARDS WITH VISIBLE GAPS
  const containerX = 50;
  const containerY = 300;
  const containerWidth = 740;
  const containerHeight = 160;
  
  const gapX = 40; // LARGER horizontal gap between cards
  const gapY = 25; // LARGER vertical gap between cards
  
  const cardW = (containerWidth - gapX) / 2;
  const cardH = (containerHeight - gapY) / 2;
  
  // Card positions with VISIBLE SPACING
  const card1X = containerX;
  const card1Y = containerY;
  const card2X = containerX + cardW + gapX;
  const card2Y = containerY;
  const card3X = containerX;
  const card3Y = containerY + cardH + gapY;
  const card4X = containerX + cardW + gapX;
  const card4Y = containerY + cardH + gapY;

  // A - Qualitative Scale (top left)
  const qualY = appCard(card1X, card1Y, cardW, cardH, 'A - QUALITATIVE SCALE', colors.secondary);
  
  const qualData = [
    ['Extreme', 'Fatality, significant disability'],
    ['High', 'Minor amputation, permanent disability'], 
    ['Medium', 'Minor injury, Lost Time Injury'],
    ['Low', 'First Aid Treatment only']
  ];
  
  let qY = qualY;
  qualData.forEach(([level, desc]) => {
    doc.font('Helvetica-Bold').fontSize(6).fillColor(colors.text);
    doc.text(level, card1X + 8, qY);
    doc.font('Helvetica').fontSize(5);
    doc.text(desc, card1X + 55, qY, { width: cardW - 65 });
    qY += 12;
  });

  // B - Quantitative Scale (top right)
  const quantY = appCard(card2X, card2Y, cardW, cardH, 'B - QUANTITATIVE SCALE', colors.success);
  
  const quantData = [
    ['$50,000+', 'Likely - Monthly'],
    ['$15,000-$50,000', 'Possible - Yearly'],
    ['$1,000-$15,000', 'Unlikely - 10 years'],
    ['$0-$1,000', 'Very Rarely - Lifetime']
  ];
  
  let qtY = quantY;
  quantData.forEach(([cost, prob]) => {
    doc.font('Helvetica-Bold').fontSize(6).fillColor(colors.text);
    doc.text(cost, card2X + 8, qtY);
    doc.font('Helvetica').fontSize(5);
    doc.text(prob, card2X + 85, qtY, { width: cardW - 95 });
    qtY += 12;
  });

  // C - Likelihood vs Consequence (bottom left)
  const likelihoodY = appCard(card3X, card3Y, cardW, cardH, 'C - LIKELIHOOD vs CONSEQUENCE', colors.warning);
  
  const matrix = [
    ['', 'Likely', 'Possible', 'Unlikely'],
    ['Extreme', '16', '14', '11'],
    ['High', '15', '12', '8'],
    ['Medium', '13', '9', '']
  ];
  
  let mY = likelihoodY;
  matrix.forEach((row, rowIdx) => {
    let mX = card3X + 8;
    row.forEach((cell, colIdx) => {
      if (cell) {
        if (rowIdx > 0 && colIdx > 0 && cell) {
          const score = parseInt(cell);
          const scoreColor = score >= 16 ? '#DC2626' : score >= 11 ? '#F59E0B' : '#10B981';
          doc.fillColor(scoreColor);
          doc.roundedRect(mX - 1, mY - 1, 24, 10, 1);
          doc.fill();
          doc.fillColor(colors.white);
        } else {
          doc.fillColor(colors.text);
        }
        
        doc.font(rowIdx === 0 || colIdx === 0 ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(5);
        doc.text(cell, mX, mY, { width: 24 });
      }
      mX += 26;
    });
    mY += 10;
  });

  // D - Risk Scoring (bottom right)
  const scoringY = appCard(card4X, card4Y, cardW, cardH, 'D - RISK SCORING', colors.danger);
  
  const scoring = [
    ['16-18', 'Severe (E)', 'Action now'],
    ['11-15', 'High (H)', 'Action 24hrs'],
    ['7-10', 'Medium (M)', 'Action 1 week'],
    ['1-6', 'Low (L)', 'Monitor']
  ];
  
  let sY = scoringY;
  scoring.forEach(([score, rank, action]) => {
    doc.font('Helvetica-Bold').fontSize(6).fillColor(colors.text);
    doc.text(`${score} ${rank}`, card4X + 8, sY);
    doc.font('Helvetica').fontSize(5);
    doc.text(action, card4X + 95, sY, { width: cardW - 105 });
    sY += 12;
  });

  // Page 2 - Work Activities (ONLY if data exists)
  if (swmsData.workActivities && swmsData.workActivities.length > 0) {
    doc.addPage();
    
    const activitiesY = appCard(30, 80, 780, 500, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);
    const headers = ['Activity', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Legislation'];
    const colWidths = [130, 140, 70, 150, 70, 120];
    
    // Header
    doc.fillColor(colors.background);
    doc.roundedRect(50, activitiesY, 740, 16, 4);
    doc.fill();
    
    let headerX = 50;
    headers.forEach((header, idx) => {
      if (idx > 0) {
        doc.strokeColor(colors.border).lineWidth(0.5);
        doc.moveTo(headerX, activitiesY).lineTo(headerX, activitiesY + 16).stroke();
      }
      doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(7);
      doc.text(header, headerX + 3, activitiesY + 5, { width: colWidths[idx] - 6 });
      headerX += colWidths[idx];
    });

    // Activities from REAL data
    let rowY = activitiesY + 16;
    swmsData.workActivities.slice(0, 8).forEach((activity: any, idx: number) => {
      if (idx % 2 === 1) {
        doc.fillColor(colors.background);
        doc.roundedRect(50, rowY, 740, 50, 2);
        doc.fill();
      }
      
      let cellX = 50;
      const rowData = [
        activity.activity || activity.description || '',
        Array.isArray(activity.hazards) ? activity.hazards.join('\n• ') : (activity.hazards || ''),
        activity.initialRisk || activity.initial_risk || '',
        Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join('\n• ') : (activity.controlMeasures || activity.control_measures || ''),
        activity.residualRisk || activity.residual_risk || '',
        activity.legislation || ''
      ];
      
      rowData.forEach((data, colIdx) => {
        if (colIdx > 0) {
          doc.strokeColor(colors.border).lineWidth(0.5);
          doc.moveTo(cellX, rowY).lineTo(cellX, rowY + 50).stroke();
        }
        
        doc.fillColor(colors.text).font('Helvetica').fontSize(7);
        doc.text(data, cellX + 3, rowY + 4, { 
          width: colWidths[colIdx] - 6, 
          height: 42
        });
        cellX += colWidths[colIdx];
      });
      
      rowY += 50;
    });
  }

  // Page 3 - Additional sections (ONLY if data exists)
  const hasPlantEquipment = swmsData.plantEquipment && swmsData.plantEquipment.length > 0;
  const hasEmergencyProcedures = swmsData.emergencyProcedures && Object.keys(swmsData.emergencyProcedures).length > 0;
  const hasSignage = swmsData.safetySignage || swmsData.signageRequirements;

  if (hasPlantEquipment || hasEmergencyProcedures || hasSignage) {
    doc.addPage();
    
    // Plant & Equipment (if exists)
    if (hasPlantEquipment) {
      const equipY = appCard(30, 80, 380, 160, 'PLANT & EQUIPMENT REGISTER', colors.warning);
      let eqY = equipY;
      swmsData.plantEquipment.slice(0, 6).forEach((eq: any) => {
        doc.font('Helvetica-Bold').fontSize(6).fillColor(colors.text);
        doc.text(eq.name || eq.equipment || '', 40, eqY);
        doc.font('Helvetica').fontSize(5);
        doc.text(`Status: ${eq.status || eq.certification || 'Unknown'}`, 40, eqY + 8);
        eqY += 20;
      });
    }

    // Emergency Procedures (if exists)
    if (hasEmergencyProcedures) {
      const emergY = appCard(430, 80, 380, 160, 'EMERGENCY RESPONSE PROCEDURES', colors.danger);
      let emY = emergY;
      Object.entries(swmsData.emergencyProcedures).slice(0, 4).forEach(([type, procedure]) => {
        doc.font('Helvetica-Bold').fontSize(6).fillColor(colors.text);
        doc.text(type.toUpperCase(), 440, emY);
        doc.font('Helvetica').fontSize(5);
        doc.text(typeof procedure === 'string' ? procedure : '', 440, emY + 8, { width: 350, height: 20 });
        emY += 32;
      });
    }

    // Safety Signage (if exists)
    if (hasSignage) {
      const signY = appCard(30, 260, 780, 120, 'SAFETY SIGNAGE & COMMUNICATION', colors.success);
      let sgnY = signY;
      const signageData = swmsData.safetySignage || swmsData.signageRequirements || [];
      signageData.slice(0, 5).forEach((sign: any, idx: number) => {
        doc.font('Helvetica').fontSize(7).fillColor(colors.text);
        const signText = typeof sign === 'string' ? sign : (sign.description || sign.requirement || '');
        doc.text(`${idx + 1}. ${signText}`, 40, sgnY, { width: 720 });
        sgnY += 16;
      });
    }
  }

  // Watermark
  doc.fillColor('#00000008');
  doc.font('Helvetica-Bold');
  doc.fontSize(60);
  doc.text('RISKIFY', 350, 350, { align: 'center' });

  return doc;
}
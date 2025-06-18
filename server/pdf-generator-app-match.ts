import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

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

  // Color scheme matching the app
  const colors = {
    primary: '#2563eb',
    secondary: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    slate: '#64748b',
    gray: '#6b7280',
    background: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
    white: '#ffffff'
  };

  // Load Riskify logo
  const logoPath = path.join(process.cwd(), 'riskify-logo.png');
  let logoBuffer: Buffer | null = null;
  try {
    if (fs.existsSync(logoPath)) {
      logoBuffer = fs.readFileSync(logoPath);
    }
  } catch (error) {
    console.warn('Logo file not found:', logoPath);
  }

  // App card helper function
  function appCard(x: number, y: number, w: number, h: number, title: string, headerColor = colors.primary) {
    // Card background - solid white
    doc.fillColor(colors.white);
    doc.roundedRect(x, y - 25, w, h + 25, 8);
    doc.fill();
    
    // Card border
    doc.strokeColor(colors.border);
    doc.lineWidth(1);
    doc.roundedRect(x, y - 25, w, h + 25, 8);
    doc.stroke();
    
    // Header background
    doc.fillColor(headerColor);
    doc.roundedRect(x, y - 25, w, 20, 8);
    doc.fill();
    doc.rect(x, y - 15, w, 10);
    doc.fill();
    
    // Header text
    doc.fillColor(colors.white);
    doc.font('Helvetica-Bold');
    doc.fontSize(9);
    doc.text(title, x + 10, y - 20, { width: w - 20 });
    
    return y;
  }

  // Header section with logo
  if (logoBuffer) {
    doc.image(logoBuffer, 30, 20, { width: 120, height: 40 });
  }
  
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(16);
  doc.text('SAFE WORK METHOD STATEMENT', 200, 25);
  
  doc.font('Helvetica');
  doc.fontSize(10);
  doc.text(`Project: ${projectName}`, 200, 45);
  doc.text(`Location: ${projectAddress}`, 200, 60);
  doc.text(`Document ID: ${uniqueId}`, 600, 25);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 600, 40);

  // Project Information card - enhanced with company details
  const projectY = appCard(30, 120, 380, 120, 'PROJECT INFORMATION', colors.primary);
  
  const projectDetails = [
    ['Head Contractor:', swmsData.head_contractor || swmsData.company_name || 'Not specified'],
    ['Project Name:', projectName],
    ['Project Address:', projectAddress],
    ['Site Manager:', swmsData.site_manager || 'Not specified'],
    ['Document ID:', uniqueId],
    ['Date Generated:', new Date().toLocaleDateString()],
    ['Trade Type:', swmsData.trade_type || 'General Construction']
  ];
  
  let isLeft = true;
  let leftY = projectY;
  let rightY = projectY;
  
  projectDetails.forEach(([label, value]) => {
    const currentX = isLeft ? 50 : 250;
    const currentY = isLeft ? leftY : rightY;
    
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(label, currentX, currentY);
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(value, currentX, currentY + 10, { width: 180, height: 12 });
    
    if (isLeft) leftY += 16;
    else rightY += 16;
    
    isLeft = !isLeft;
  });

  // Emergency procedures card
  const emergencyY = appCard(450, 120, 360, 120, 'EMERGENCY PROCEDURES', colors.danger);
  
  const emergencyData = [
    ['Emergency Contact:', swmsData.emergency_contact || '000'],
    ['Site Supervisor:', swmsData.site_supervisor || 'Not specified'],
    ['Assembly Point:', swmsData.assembly_point || 'Main entrance'],
    ['Nearest Hospital:', swmsData.nearest_hospital || 'Local hospital']
  ];
  
  let isEmergencyLeft = true;
  let emergencyLeftY = emergencyY;
  let emergencyRightY = emergencyY;
  
  emergencyData.forEach(([label, value]) => {
    const currentX = isEmergencyLeft ? 470 : 650;
    const currentY = isEmergencyLeft ? emergencyLeftY : emergencyRightY;
    
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(label, currentX, currentY);
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(value, currentX, currentY + 10, { width: 140, height: 12 });
    
    if (isEmergencyLeft) emergencyLeftY += 22;
    else emergencyRightY += 22;
    
    isEmergencyLeft = !isEmergencyLeft;
  });

  // Construction Control Risk Matrix Section - 2x2 grid layout with proper spacing
  const sectionY = appCard(30, 280, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // A - Qualitative Scale Card (top left)
  const qualY = appCard(50, 320, 370, 80, 'A - QUALITATIVE SCALE', colors.secondary);
  
  const qualitativeData = [
    ['Extreme', 'Fatality, significant disability'],
    ['High', 'Minor amputation, permanent disability'],
    ['Medium', 'Minor injury, Lost Time Injury'],
    ['Low', 'First Aid Treatment only']
  ];
  
  let qualRowY = qualY;
  qualitativeData.forEach(([level, description]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(level, 60, qualRowY);
    
    doc.font('Helvetica');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(description, 110, qualRowY, { width: 290, height: 12 });
    qualRowY += 16;
  });

  // B - Quantitative Scale Card (top right) - with 20px spacing
  const quantY = appCard(440, 320, 370, 80, 'B - QUANTITATIVE SCALE', colors.success);
  
  const quantitativeData = [
    ['$50,000+', 'Likely - Monthly'],
    ['$15,000-$50,000', 'Possible - Yearly'],
    ['$1,000-$15,000', 'Unlikely - 10 years'],
    ['$0-$1,000', 'Very Rarely - Lifetime']
  ];
  
  let quantRowY = quantY;
  quantitativeData.forEach(([cost, probability]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(cost, 450, quantRowY);
    
    doc.font('Helvetica');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(probability, 540, quantRowY, { width: 250, height: 12 });
    quantRowY += 16;
  });

  // C - Likelihood vs Consequence Card (bottom left) - with 20px vertical spacing
  const likelihoodY = appCard(50, 420, 370, 80, 'C - LIKELIHOOD vs CONSEQUENCE', colors.warning);
  
  const riskMatrixGrid = [
    ['', 'Likely', 'Possible', 'Unlikely'],
    ['Extreme', '16', '14', '11'],
    ['High', '15', '12', '8'],
    ['Medium', '13', '9', '']
  ];
  
  let gridRowY = likelihoodY;
  riskMatrixGrid.forEach((row, rowIndex) => {
    let gridX = 60;
    row.forEach((cell, colIndex) => {
      if (cell) {
        // Color code risk scores
        if (rowIndex > 0 && colIndex > 0 && cell) {
          const score = parseInt(cell);
          const scoreColor = score >= 16 ? '#DC2626' : score >= 11 ? '#F59E0B' : score >= 7 ? '#10B981' : '#6B7280';
          doc.fillColor(scoreColor);
          doc.roundedRect(gridX - 2, gridRowY - 2, 30, 14, 2);
          doc.fill();
          doc.fillColor(colors.white);
        } else {
          doc.fillColor(colors.text);
        }
        
        doc.font(rowIndex === 0 || colIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(6);
        doc.text(cell, gridX, gridRowY, { width: 30 });
      }
      gridX += 35;
    });
    gridRowY += 16;
  });

  // D - Risk Scoring Card (bottom right) - with 20px spacing
  const scoringY = appCard(440, 420, 370, 80, 'D - RISK SCORING', colors.danger);
  
  const scoringData = [
    ['16-18', 'Severe (E)', 'Action now'],
    ['11-15', 'High (H)', 'Action 24hrs'],
    ['7-10', 'Medium (M)', 'Action 1 week'],
    ['1-6', 'Low (L)', 'Monitor']
  ];
  
  let scoringRowY = scoringY;
  scoringData.forEach(([score, ranking, action]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(`${score} ${ranking}`, 440, scoringRowY);
    
    doc.font('Helvetica');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(action, 540, scoringRowY, { width: 230, height: 12 });
    scoringRowY += 14;
  });

  // Plant & Equipment Register Card
  const equipY = appCard(30, 500, 780, 120, 'PLANT & EQUIPMENT REGISTER', colors.warning);

  const equipHeaders = ['Item', 'Description', 'Make/Model', 'Registration', 'Inspection Date', 'Risk Level'];
  const equipColWidths = [120, 180, 140, 120, 100, 80];
  
  // Equipment table header
  doc.fillColor(colors.background);
  doc.roundedRect(50, equipY, 720, 16, 4);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, equipY, 720, 16, 4);
  doc.stroke();
  
  let equipHeaderX = 50;
  equipHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, equipHeaderX + 3, equipY + 5, { width: equipColWidths[index] - 6 });
    equipHeaderX += equipColWidths[index];
  });

  // Equipment data
  const equipment = swmsData.plant_equipment || swmsData.equipment || [
    { item: 'Mobile Crane', description: '50T Mobile Crane', make: 'Liebherr LTM 1050', registration: 'CR002-2024', inspection: '10/06/2025', risk: 'High' },
    { item: 'Excavator', description: '20T Hydraulic Excavator', make: 'Caterpillar 320D', registration: 'EX001-2024', inspection: '15/06/2025', risk: 'Medium' },
    { item: 'Power Tools', description: 'Various hand tools', make: 'DeWalt/Makita', registration: 'N/A', inspection: '01/06/2025', risk: 'Low' }
  ];
  
  let equipRowY = equipY + 16;
  const equipRowHeight = 20;
  
  equipment.slice(0, 4).forEach((equip: any, index: number) => {
    let equipCellX = 50;
    
    // Row background
    if (index % 2 === 1) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, equipRowY, 720, equipRowHeight, 2);
      doc.fill();
    }
    
    const equipRowData = [
      equip.item || 'Equipment item',
      equip.description || 'Description not provided',
      equip.make || 'Make/Model not specified',
      equip.registration || 'N/A',
      equip.inspection || 'Not scheduled',
      equip.risk || 'Medium'
    ];
    
    equipRowData.forEach((data, colIndex) => {
      // Risk level badges
      if (colIndex === 5) {
        const riskLevel = data.toUpperCase();
        const badgeColor = riskLevel === 'HIGH' ? colors.danger : riskLevel === 'MEDIUM' ? colors.warning : colors.success;
        
        doc.fillColor(badgeColor);
        doc.roundedRect(equipCellX + 2, equipRowY + 2, equipColWidths[colIndex] - 4, 12, 2);
        doc.fill();
        
        doc.fillColor(colors.white);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(data, equipCellX + 4, equipRowY + 6, { width: equipColWidths[colIndex] - 8, align: 'center' });
      } else {
        doc.fillColor(colors.text);
        doc.font('Helvetica');
        doc.fontSize(6);
        doc.text(data, equipCellX + 3, equipRowY + 4, { 
          width: equipColWidths[colIndex] - 6, 
          height: equipRowHeight - 8,
          ellipsis: true 
        });
      }
      
      equipCellX += equipColWidths[colIndex];
    });
    
    equipRowY += equipRowHeight;
  });

  // Page 2 - SWMS Activities Table
  doc.addPage();
  
  // Work Activities & Risk Assessment Card - full page
  const riskY = appCard(30, 80, 780, 500, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

  const riskHeaders = ['Activity', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk'];
  const colWidths = [150, 180, 80, 250, 80];
  
  // Table header
  doc.fillColor(colors.background);
  doc.roundedRect(50, riskY, 740, 16, 4);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, riskY, 740, 16, 4);
  doc.stroke();
  
  let headerX = 50;
  riskHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, headerX + 3, riskY + 5, { width: colWidths[index] - 6 });
    headerX += colWidths[index];
  });

  // Risk assessment data - All activities
  const risks = swmsData.risk_assessments || [
    { activity: 'Cable tray installation on levels 15-20', hazards: 'Falls from height during work activities', initial_risk: 'H (16)', control_measures: 'Safety harness with dual lanyards required', residual_risk: 'L (4)' },
    { activity: 'Main switchboard upgrades', hazards: 'Manual handling injuries from heavy lifting', initial_risk: 'M (12)', control_measures: 'Mechanical lifting aids for manual handling', residual_risk: 'L (3)' },
    { activity: 'Lighting circuit installation', hazards: 'Falls from height during work activities', initial_risk: 'M (9)', control_measures: 'Exclusion zones around moving machinery', residual_risk: 'L (2)' },
    { activity: 'Emergency lighting system testing', hazards: 'Falls from height during work activities', initial_risk: 'M (8)', control_measures: 'Equipment operator competency verification', residual_risk: 'L (2)' },
    { activity: 'Power distribution panel installation', hazards: 'Electrical shock from live components', initial_risk: 'H (15)', control_measures: 'Lockout/tagout procedures and PPE', residual_risk: 'L (3)' },
    { activity: 'Fire alarm system wiring', hazards: 'Working at height in confined spaces', initial_risk: 'M (10)', control_measures: 'Scaffolding and fall protection systems', residual_risk: 'L (2)' }
  ];
  
  let rowY = riskY + 16;
  const rowHeight = 30;
  
  risks.forEach((risk: any, index: number) => {
    let cellX = 50;
    
    // Row background
    if (index % 2 === 1) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, rowY, 740, rowHeight, 2);
      doc.fill();
    }
    
    const rowData = [
      risk.activity || 'Activity not specified',
      risk.hazards || 'No hazards identified',
      risk.initial_risk || 'M (8)',
      risk.control_measures || 'Standard safety controls',
      risk.residual_risk || 'L (2)'
    ];
    
    rowData.forEach((data, colIndex) => {
      // Risk score badges
      if (colIndex === 2 || colIndex === 4) {
        const riskLevel = data.includes('H') ? 'HIGH' : data.includes('M') ? 'MEDIUM' : 'LOW';
        const badgeColor = riskLevel === 'HIGH' ? colors.danger : riskLevel === 'MEDIUM' ? colors.warning : colors.success;
        
        doc.fillColor(badgeColor);
        doc.roundedRect(cellX + 2, rowY + 2, colWidths[colIndex] - 4, 12, 2);
        doc.fill();
        
        doc.fillColor(colors.white);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(data, cellX + 4, rowY + 6, { width: colWidths[colIndex] - 8, align: 'center' });
      } else {
        doc.fillColor(colors.text);
        doc.font('Helvetica');
        doc.fontSize(6);
        doc.text(data, cellX + 3, rowY + 4, { 
          width: colWidths[colIndex] - 6, 
          height: rowHeight - 8,
          ellipsis: true 
        });
      }
      
      cellX += colWidths[colIndex];
    });
    
    rowY += rowHeight;
  });
    
    // Continue SWMS table on new page - full width card
    const continueY = appCard(30, 80, 780, 400, 'WORK ACTIVITIES & RISK ASSESSMENT (CONTINUED)', colors.secondary);
    
    // Table header for continuation
    doc.fillColor(colors.background);
    doc.roundedRect(50, continueY, 740, 16, 4);
    doc.fill();
    
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(50, continueY, 740, 16, 4);
    doc.stroke();
    
    let continueHeaderX = 50;
    riskHeaders.forEach((header, index) => {
      doc.fillColor(colors.text);
      doc.font('Helvetica-Bold');
      doc.fontSize(7);
      doc.text(header, continueHeaderX + 3, continueY + 5, { width: colWidths[index] - 6 });
      continueHeaderX += colWidths[index];
    });

    // Remaining activities
    let continueRowY = continueY + 16;
    risks.slice(3).forEach((risk: any, index: number) => {
      let cellX = 50;
      
      // Row background
      if (index % 2 === 1) {
        doc.fillColor('#f8fafc');
        doc.roundedRect(50, continueRowY, 740, rowHeight, 2);
        doc.fill();
      }
      
      const rowData = [
        risk.activity || 'Activity not specified',
        risk.hazards || 'No hazards identified',
        risk.initial_risk || 'M (8)',
        risk.control_measures || 'Standard safety controls',
        risk.residual_risk || 'L (2)'
      ];
      
      rowData.forEach((data, colIndex) => {
        // Risk score badges
        if (colIndex === 2 || colIndex === 4) {
          const riskLevel = data.includes('H') ? 'HIGH' : data.includes('M') ? 'MEDIUM' : 'LOW';
          const badgeColor = riskLevel === 'HIGH' ? colors.danger : riskLevel === 'MEDIUM' ? colors.warning : colors.success;
          
          doc.fillColor(badgeColor);
          doc.roundedRect(cellX + 2, continueRowY + 2, colWidths[colIndex] - 4, 12, 2);
          doc.fill();
          
          doc.fillColor(colors.white);
          doc.font('Helvetica-Bold');
          doc.fontSize(7);
          doc.text(data, cellX + 4, continueRowY + 6, { width: colWidths[colIndex] - 8, align: 'center' });
        } else {
          doc.fillColor(colors.text);
          doc.font('Helvetica');
          doc.fontSize(6);
          doc.text(data, cellX + 3, continueRowY + 4, { 
            width: colWidths[colIndex] - 6, 
            height: rowHeight - 8,
            ellipsis: true 
          });
        }
        
        cellX += colWidths[colIndex];
      });
      
      continueRowY += rowHeight;
    });
  }

  // Add signatory page
  doc.addPage();
  
  // Document Approval & Signatures Card
  const signatoryY = appCard(30, 80, 780, 450, 'DOCUMENT APPROVAL & SIGNATURES', colors.primary);
  
  // Manual Site Sign-on Table
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text('MANUAL SITE SIGN-ON TABLE', 50, signatoryY + 20);
  
  const signatoryHeaders = ['#', 'Name', 'Number', 'Signature', 'Date'];
  const signatoryColWidths = [40, 180, 120, 240, 140];
  
  // Table header
  doc.fillColor(colors.background);
  doc.roundedRect(50, signatoryY + 40, 720, 16, 4);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, signatoryY + 40, 720, 16, 4);
  doc.stroke();
  
  let sigHeaderX = 50;
  signatoryHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(header, sigHeaderX + 3, signatoryY + 47, { width: signatoryColWidths[index] - 6 });
    sigHeaderX += signatoryColWidths[index];
  });

  // Create 20 empty signature rows
  let sigRowY = signatoryY + 56;
  const sigRowHeight = 18;
  
  for (let i = 1; i <= 20; i++) {
    let sigCellX = 50;
    
    // Row background
    if (i % 2 === 0) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, sigRowY, 720, sigRowHeight, 2);
      doc.fill();
    }
    
    // Row number
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(i.toString(), sigCellX + 15, sigRowY + 6);
    
    // Draw cell borders
    signatoryColWidths.forEach((width, colIndex) => {
      if (colIndex > 0) {
        doc.strokeColor(colors.border);
        doc.lineWidth(0.5);
        doc.moveTo(sigCellX, sigRowY);
        doc.lineTo(sigCellX, sigRowY + sigRowHeight);
        doc.stroke();
      }
      sigCellX += width;
    });
    
    // Bottom border for row
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.moveTo(50, sigRowY + sigRowHeight);
    doc.lineTo(770, sigRowY + sigRowHeight);
    doc.stroke();
    
    sigRowY += sigRowHeight;
  }
  
  // Watermark
  doc.fillColor('#00000008');
  doc.font('Helvetica-Bold');
  doc.fontSize(60);
  doc.text('RISKIFY', 350, 350, { align: 'center' });

  return doc;
}
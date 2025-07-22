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

  // Header with logo
  if (logoBuffer) {
    doc.image(logoBuffer, 30, 20, { width: 60, height: 60 });
  }

  // Title
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  doc.text('SAFE WORK METHOD STATEMENT', 120, 30, { width: 500 });

  // Document metadata
  doc.font('Helvetica-Bold');
  doc.fontSize(8);
  doc.text(`Document ID: SWMS-${swmsData.id || 141}-${Date.now().toString().slice(-5)}`, 600, 25, { align: 'left' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-AU')}`, 600, 37, { align: 'left' });

  // Project and location details
  doc.font('Helvetica');
  doc.fontSize(10);
  const projectName = swmsData.title || swmsData.project_name || 'High-Rise Electrical Installation - Southbank Tower';
  const projectLocation = swmsData.project_address || swmsData.location || '456 Southbank Boulevard, Southbank VIC 3006';
  
  doc.text(`Project: ${projectName}`, 120, 50);
  doc.text(`Location: ${projectLocation}`, 120, 62);

  // Project Information and Emergency Procedures Cards
  const projectY = appCard(30, 120, 380, 120, 'PROJECT INFORMATION', colors.primary);
  const emergencyY = appCard(430, 120, 380, 120, 'EMERGENCY PROCEDURES', colors.danger);

  // Project information content
  const projectInfo = [
    ['Principal Contractor:', swmsData.principal_contractor || 'Elite Construction Management'],
    ['Project Name:', projectName],
    ['Project Address:', projectLocation],
    ['Trade Type:', swmsData.trade_type || 'Construction'],
    ['Document Version:', '1.0']
  ];

  let projectRowY = projectY;
  projectInfo.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(label, 40, projectRowY);
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(value, 150, projectRowY, { width: 240 });
    projectRowY += 14;
  });

  // Emergency procedures content
  const emergencyData = [
    ['Emergency Contact:', '000'],
    ['Assembly Point:', 'Main Gate Assembly Area'],
    ['Nearest Hospital:', 'Royal Melbourne Hospital'],
    ['Site Supervisor:', '0412 345 678'],
    ['First Aid Officer:', '0423 456 789']
  ];

  let emergencyRowY = emergencyY;
  emergencyData.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(label, 440, emergencyRowY);
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(value, 550, emergencyRowY, { width: 240 });
    emergencyRowY += 14;
  });

  // Construction Control Risk Matrix Section - FIXED SPACING  
  const matrixY = appCard(30, 280, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // CORRECTED card positioning calculations
  const containerPadding = 20;
  const cardGapH = 20; // Horizontal gap between cards
  const cardGapV = 15; // Vertical gap between cards
  const availableWidth = 780 - (containerPadding * 2);
  const availableHeight = 200 - 40; // Minus header space
  
  const cardWidth = (availableWidth - cardGapH) / 2;
  const cardHeight = (availableHeight - cardGapV) / 2;
  
  const leftX = 30 + containerPadding;
  const rightX = leftX + cardWidth + cardGapH;
  const topY = 300;
  const bottomY = topY + cardHeight + cardGapV;

  // A - Qualitative Scale Card (top left)
  const qualY = appCard(leftX, topY, cardWidth, cardHeight, 'A - QUALITATIVE SCALE', colors.secondary);
  
  const qualitativeData = [
    ['Extreme', 'Fatality, significant disability'],
    ['High', 'Minor amputation, permanent disability'],
    ['Medium', 'Minor injury, Lost Time Injury'],
    ['Low', 'First Aid Treatment only']
  ];
  
  let qualRowY = qualY;
  qualitativeData.forEach(([level, description]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(level, leftX + 8, qualRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(description, leftX + 55, qualRowY, { width: cardWidth - 65, height: 10 });
    qualRowY += 12;
  });

  // B - Quantitative Scale Card (top right)
  const quantY = appCard(rightX, topY, cardWidth, cardHeight, 'B - QUANTITATIVE SCALE', colors.success);
  
  const quantitativeData = [
    ['$50,000+', 'Likely - Monthly'],
    ['$15,000-$50,000', 'Possible - Yearly'],
    ['$1,000-$15,000', 'Unlikely - 10 years'],
    ['$0-$1,000', 'Very Rarely - Lifetime']
  ];
  
  let quantRowY = quantY;
  quantitativeData.forEach(([cost, probability]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(cost, rightX + 8, quantRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(probability, rightX + 85, quantRowY, { width: cardWidth - 95, height: 10 });
    quantRowY += 12;
  });

  // C - Likelihood vs Consequence Card (bottom left)
  const likelihoodY = appCard(leftX, bottomY, cardWidth, cardHeight, 'C - LIKELIHOOD vs CONSEQUENCE', colors.warning);
  
  const riskMatrixGrid = [
    ['', 'Likely', 'Possible', 'Unlikely', 'Very Rarely'],
    ['Extreme', '16', '14', '11', '7'],
    ['High', '15', '12', '8', ''],
    ['Medium', '13', '9', '', ''],
    ['Low', '10', '', '', '']
  ];
  
  let gridRowY = likelihoodY;
  riskMatrixGrid.forEach((row, rowIndex) => {
    let gridX = leftX + 8;
    row.forEach((cell, colIndex) => {
      if (cell) {
        // Color code risk scores
        if (rowIndex > 0 && colIndex > 0 && cell) {
          const score = parseInt(cell);
          const scoreColor = score >= 16 ? '#DC2626' : score >= 11 ? '#F59E0B' : score >= 7 ? '#10B981' : '#6B7280';
          doc.fillColor(scoreColor);
          doc.roundedRect(gridX - 1, gridRowY - 1, 24, 10, 1);
          doc.fill();
          doc.fillColor(colors.white);
        } else {
          doc.fillColor(colors.text);
        }
        
        doc.font(rowIndex === 0 || colIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(5);
        doc.text(cell, gridX, gridRowY, { width: 24 });
      }
      gridX += 26;
    });
    gridRowY += 10;
  });

  // D - Risk Scoring Card (bottom right)
  const scoringY = appCard(rightX, bottomY, cardWidth, cardHeight, 'D - RISK SCORING', colors.danger);
  
  const scoringData = [
    ['16-18', 'Severe (E)', 'Action now'],
    ['11-15', 'High (H)', 'Action 24hrs'],
    ['7-10', 'Medium (M)', 'Action 1 week'],
    ['1-6', 'Low (L)', 'Monitor']
  ];
  
  let scoringRowY = scoringY;
  scoringData.forEach(([score, ranking, action]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(`${score} ${ranking}`, rightX + 8, scoringRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(action, rightX + 95, scoringRowY, { width: cardWidth - 105, height: 10 });
    scoringRowY += 12;
  });

  // Page 2 - SWMS Activities Table
  doc.addPage();
  
  // Work Activities & Risk Assessment Card - full page
  const riskY = appCard(30, 80, 780, 500, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

  const riskHeaders = ['Activity', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Legislation'];
  const colWidths = [130, 140, 70, 150, 70, 120];
  
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
    // Draw header column separator
    if (index > 0) {
      doc.strokeColor(colors.border);
      doc.lineWidth(0.5);
      doc.moveTo(headerX, riskY);
      doc.lineTo(headerX, riskY + 16);
      doc.stroke();
    }
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, headerX + 3, riskY + 5, { width: colWidths[index] - 6 });
    headerX += colWidths[index];
  });

  // Comprehensive electrical activities with separate legislation column
  const risks = [
    { 
      activity: 'Cable tray installation on levels 15-20', 
      legislation: 'WHS Regulation 2017 Part 4.4 - Falls',
      hazards: '• Falls from height during work activities\n• Manual handling of heavy cable trays\n• Electrical hazards from live circuits', 
      initial_risk: 'H (16)', 
      control_measures: '• Safety harness with dual lanyards required\n• Use mechanical lifting aids\n• Lockout/tagout procedures before work', 
      residual_risk: 'L (4)' 
    },
    { 
      activity: 'Main switchboard upgrades', 
      legislation: 'AS/NZS 3000:2018 Wiring Rules',
      hazards: '• Electrical shock from live components\n• Manual handling injuries from heavy equipment\n• Arc flash potential', 
      initial_risk: 'H (15)', 
      control_measures: '• De-energize circuits before work\n• Use insulated tools and PPE\n• Mechanical lifting aids for panels', 
      residual_risk: 'L (3)' 
    },
    { 
      activity: 'Lighting circuit installation', 
      legislation: 'AS/NZS 3000:2018 Section 2',
      hazards: '• Falls from height using ladders\n• Electrical shock hazards\n• Eye strain from poor lighting', 
      initial_risk: 'M (12)', 
      control_measures: '• Scaffold access platforms\n• Test circuits before touching\n• Adequate temporary lighting', 
      residual_risk: 'L (2)' 
    },
    { 
      activity: 'Emergency lighting system testing', 
      legislation: 'AS 2293.1-2018 Emergency Lighting',
      hazards: '• Working in low light conditions\n• Electrical testing hazards\n• Falls during emergency testing', 
      initial_risk: 'M (9)', 
      control_measures: '• Portable lighting during tests\n• Qualified electrical testing personnel\n• Fall protection systems', 
      residual_risk: 'L (2)' 
    },
    { 
      activity: 'Final electrical testing and commissioning', 
      legislation: 'AS/NZS 3017:2022 Electrical Installations',
      hazards: '• Electrical shock during testing\n• Equipment malfunction\n• Documentation errors', 
      initial_risk: 'M (8)', 
      control_measures: '• Qualified electrical engineers\n• Proper testing equipment\n• Systematic testing procedures', 
      residual_risk: 'L (2)' 
    }
  ];
  
  let rowY = riskY + 16;
  const rowHeight = 50;
  
  risks.forEach((risk: any, index: number) => {
    // Alternating row colors
    if (index % 2 === 1) {
      doc.fillColor(colors.background);
      doc.roundedRect(50, rowY, 740, rowHeight, 2);
      doc.fill();
    }
    
    // Row border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(50, rowY, 740, rowHeight, 2);
    doc.stroke();
    
    let cellX = 50;
    const rowData = [
      risk.activity,
      risk.hazards,
      risk.initial_risk,
      risk.control_measures,
      risk.residual_risk,
      risk.legislation
    ];
    
    rowData.forEach((data, colIndex) => {
      // Draw column separator
      if (colIndex > 0) {
        doc.strokeColor(colors.border);
        doc.lineWidth(0.5);
        doc.moveTo(cellX, rowY);
        doc.lineTo(cellX, rowY + rowHeight);
        doc.stroke();
      }
      
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(data || '', cellX + 3, rowY + 4, { 
        width: colWidths[colIndex] - 6, 
        height: rowHeight - 8
      });
      cellX += colWidths[colIndex];
    });
    
    rowY += rowHeight;
  });

  // Watermark
  doc.fillColor('#00000008');
  doc.font('Helvetica-Bold');
  doc.fontSize(60);
  doc.text('RISKIFY', 350, 350, { align: 'center' });

  return doc;
}
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export function generateAppMatchPDF(swmsData: any): PDFDocument {
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

  // Header section with logo
  if (logoBuffer) {
    doc.image(logoBuffer, 30, 20, { width: 120, height: 40 });
  }

  // Document title and metadata
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  doc.text('SAFE WORK METHOD STATEMENT', 200, 25, { width: 400 });

  doc.font('Helvetica');
  doc.fontSize(10);
  doc.text(`Project: ${swmsData.project_name || 'High-Rise Electrical Installation - Southbank Tower'}`, 200, 50);
  doc.text(`Location: ${swmsData.location || '456 Southbank Boulevard, Southbank VIC 3006'}`, 200, 62);

  // Document metadata (top right)
  doc.font('Helvetica-Bold');
  doc.fontSize(8);
  doc.text(`Document ID: SWMS-${swmsData.id || '141'}-${Date.now()}`, 650, 25, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-AU')}`, 650, 37, { align: 'right' });

  // Project Information Card (left) and Emergency Procedures Card (right)
  const projectY = appCard(30, 120, 380, 120, 'PROJECT INFORMATION', colors.primary);
  const emergencyY = appCard(430, 120, 380, 120, 'EMERGENCY PROCEDURES', colors.danger);

  // Project information content
  const projectInfo = [
    ['Principal Contractor:', swmsData.principal_contractor || 'Elite Construction Management'],
    ['Project Name:', swmsData.project_name || 'High-Rise Electrical Installation - Southbank Tower'],
    ['Project Address:', swmsData.location || '456 Southbank Boulevard, Southbank VIC 3006'],
    ['Document Type:', 'Safe Work Method Statement'],
    ['Trade Type:', swmsData.trade_type || 'Electrical'],
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
  const emergencyInfo = [
    ['Emergency Contact:', 'Site Supervisor'],
    ['Mobile Number:', 'Not Specified'],
    ['Hospital:', 'Nearest Hospital'],
    ['Assembly Point:', 'Main Entrance'],
    ['Fire Wardens:', 'As Designated'],
    ['Spill Kits:', 'Located at Site Office']
  ];

  let emergencyRowY = emergencyY;
  let isEmergencyLeft = true;
  emergencyInfo.forEach(([label, value]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(label, 440, emergencyRowY);
    
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(value, 550, emergencyRowY, { width: 240 });
    emergencyRowY += 14;
    
    isEmergencyLeft = !isEmergencyLeft;
  });

  // Construction Control Risk Matrix Section - 2x2 grid with proper spacing
  const matrixY = appCard(30, 280, 780, 240, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // Calculate positioning to fit all cards within main container with gaps
  const totalWidth = 780 - 40; // Main card width minus padding
  const totalHeight = 240 - 50; // Main card height minus header/padding
  const horizontalGap = 30; // Space between A/B and C/D
  const verticalGap = 20;   // Space between top and bottom rows
  
  const cardWidth = (totalWidth - horizontalGap) / 2; // 355px each
  const cardHeight = (totalHeight - verticalGap) / 2; // 85px each
  
  const leftX = 50;
  const rightX = leftX + cardWidth + horizontalGap;
  const topY = matrixY + 20;
  const bottomY = topY + cardHeight + verticalGap;
  
  // A - Qualitative Scale Card (top left)
  const qualY = appCard(leftX, topY, cardWidth, cardHeight, 'A - QUALITATIVE SCALE', colors.secondary);
  
  const qualitativeData = [
    ['Extreme', 'Fatality, significant disability, catastrophic property damage'],
    ['High', 'Minor amputation, minor permanent disability, moderate property damage'],
    ['Medium', 'Minor injury resulting in an Loss Time Injury or Medically Treated Injury'],
    ['Low', 'First Aid Treatment with no lost time']
  ];
  
  let qualRowY = qualY;
  qualitativeData.forEach(([level, description]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(level, leftX + 10, qualRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(description, leftX + 50, qualRowY, { width: cardWidth - 60, height: 10 });
    qualRowY += 14;
  });

  // B - Quantitative Scale Card (top right)
  const quantY = appCard(rightX, topY, cardWidth, cardHeight, 'B - QUANTITATIVE SCALE', colors.success);
  
  const quantitativeData = [
    ['$50,000+', 'Likely - Monthly in the industry, Good chance'],
    ['$15,000-$50,000', 'Possible - Yearly in the industry, Even chance'],
    ['$1,000-$15,000', 'Unlikely - Every 10 years in the industry, Low chance'],
    ['$0-$1,000', 'Very Rarely - Once in a lifetime in the industry, Practically no chance']
  ];
  
  let quantRowY = quantY;
  quantitativeData.forEach(([cost, probability]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(cost, rightX + 10, quantRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(probability, rightX + 80, quantRowY, { width: cardWidth - 90, height: 10 });
    quantRowY += 14;
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
    let gridX = leftX + 10;
    row.forEach((cell, colIndex) => {
      if (cell) {
        // Color code risk scores
        if (rowIndex > 0 && colIndex > 0 && cell) {
          const score = parseInt(cell);
          const scoreColor = score >= 16 ? '#DC2626' : score >= 11 ? '#F59E0B' : score >= 7 ? '#10B981' : '#6B7280';
          doc.fillColor(scoreColor);
          doc.roundedRect(gridX - 2, gridRowY - 2, 28, 12, 2);
          doc.fill();
          doc.fillColor(colors.white);
        } else {
          doc.fillColor(colors.text);
        }
        
        doc.font(rowIndex === 0 || colIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(5);
        doc.text(cell, gridX, gridRowY, { width: 28 });
      }
      gridX += 30;
    });
    gridRowY += 12;
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
    doc.text(`${score} ${ranking}`, rightX + 10, scoringRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(action, rightX + 90, scoringRowY, { width: cardWidth - 100, height: 10 });
    scoringRowY += 14;
  });

  // Remove Plant & Equipment Register from page 1 - will be moved to page 3

  // Page 2 - SWMS Activities Table
  doc.addPage();
  
  // Work Activities & Risk Assessment Card - full page
  const riskY = appCard(30, 80, 780, 500, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

  const riskHeaders = ['Activity', 'Legislation', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk'];
  const colWidths = [120, 100, 120, 70, 120, 70];
  
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
      hazards: 'Falls from height during work activities\nManual handling of heavy cable trays\nElectrical hazards from live circuits', 
      initial_risk: 'H (16)', 
      control_measures: 'Safety harness with dual lanyards required\nUse mechanical lifting aids\nLockout/tagout procedures before work', 
      residual_risk: 'L (4)' 
    },
    { 
      activity: 'Main switchboard upgrades and electrical panel work', 
      legislation: 'AS/NZS 3000:2018 Wiring Rules',
      hazards: 'Electrical shock from live components\nManual handling injuries from heavy equipment\nArc flash potential', 
      initial_risk: 'H (15)', 
      control_measures: 'De-energize circuits before work\nUse insulated tools and PPE\nMechanical lifting aids for panels', 
      residual_risk: 'L (3)' 
    },
    { 
      activity: 'Lighting circuit installation throughout building', 
      legislation: 'AS/NZS 3000:2018 Section 2',
      hazards: 'Falls from height using ladders\nElectrical shock hazards\nEye strain from poor lighting', 
      initial_risk: 'M (12)', 
      control_measures: 'Scaffold access platforms\nTest circuits before touching\nAdequate temporary lighting', 
      residual_risk: 'L (2)' 
    },
    { 
      activity: 'Emergency lighting system testing and commissioning', 
      legislation: 'AS 2293.1-2018 Emergency Lighting',
      hazards: 'Working in low light conditions\nElectrical testing hazards\nFalls during emergency testing', 
      initial_risk: 'M (9)', 
      control_measures: 'Portable lighting during tests\nQualified electrical testing personnel\nFall protection systems', 
      residual_risk: 'L (2)' 
    },
    { 
      activity: 'Power distribution panel installation in plant rooms', 
      legislation: 'AS/NZS 3000:2018 Section 6',
      hazards: 'Heavy lifting of electrical panels\nElectrical shock from terminations\nConfined space work', 
      initial_risk: 'H (15)', 
      control_measures: 'Crane assistance for heavy panels\nLockout/tagout procedures\nConfined space permits and monitoring', 
      residual_risk: 'L (3)' 
    },
    { 
      activity: 'Fire alarm system wiring and device installation', 
      legislation: 'AS 1670.1-2018 Fire Detection',
      hazards: 'Working at height in ceiling voids\nElectrical connections\nAsbestos exposure in old buildings', 
      initial_risk: 'M (10)', 
      control_measures: 'Mobile scaffolding for ceiling work\nQualified fire system technicians\nAsbestos assessment before work', 
      residual_risk: 'L (2)' 
    },
    {
      activity: 'Underground cable installation and trenching work',
      legislation: 'WHS Regulation 2017 Part 4.3 - Excavation',
      hazards: 'Cave-in from trenching\nUnderground utilities strike\nManual handling of cables',
      initial_risk: 'H (14)',
      control_measures: 'Dial before you dig\nTrench shoring systems\nCable pulling equipment and proper lifting techniques',
      residual_risk: 'M (6)'
    },
    {
      activity: 'High voltage switchgear installation and testing',
      legislation: 'AS/NZS 4871.1-2015 Electrical Apparatus',
      hazards: 'High voltage electrical hazards\nArc flash incidents\nHeavy equipment handling',
      initial_risk: 'E (18)',
      control_measures: 'Qualified HV electricians only\nArc flash PPE and face shields\nCrane lifting for switchgear',
      residual_risk: 'M (8)'
    }
  ];
  
  let rowY = riskY + 16;
  const rowHeight = 40; // Increased height for longer text
  
  // Show first 6 activities per page
  const activitiesPerPage = 6;
  let currentPageActivities = 0;
  
  risks.forEach((risk: any, index: number) => {
    // Check if we need a new page
    if (currentPageActivities >= activitiesPerPage && index < risks.length) {
      doc.addPage();
      
      // Continue activities table on new page
      const continueY = appCard(30, 80, 780, 500, 'WORK ACTIVITIES & RISK ASSESSMENT (CONTINUED)', colors.secondary);
      
      // Table header for continuation
      doc.fillColor(colors.background);
      doc.roundedRect(50, continueY, 740, 16, 4);
      doc.fill();
      
      doc.strokeColor(colors.border);
      doc.lineWidth(0.5);
      doc.roundedRect(50, continueY, 740, 16, 4);
      doc.stroke();
      
      let continueHeaderX = 50;
      riskHeaders.forEach((header, headerIndex) => {
        doc.fillColor(colors.text);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(header, continueHeaderX + 3, continueY + 5, { width: colWidths[headerIndex] - 6 });
        continueHeaderX += colWidths[headerIndex];
      });
      
      rowY = continueY + 16;
      currentPageActivities = 0;
    }
    
    let cellX = 50;
    
    // Row background
    if (index % 2 === 1) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, rowY, 740, rowHeight, 2);
      doc.fill();
    }
    
    const rowData = [
      risk.activity || 'Activity not specified',
      risk.legislation || 'WHS Regulation 2017',
      risk.hazards || 'No hazards identified',
      risk.initial_risk || 'M (8)',
      risk.control_measures || 'Standard safety controls',
      risk.residual_risk || 'L (2)'
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
      
      // Risk score badges (Initial Risk and Residual Risk columns)
      if (colIndex === 3 || colIndex === 5) {
        const riskLevel = data.includes('E') ? 'EXTREME' : data.includes('H') ? 'HIGH' : data.includes('M') ? 'MEDIUM' : 'LOW';
        const badgeColor = riskLevel === 'EXTREME' ? '#7C2D12' : riskLevel === 'HIGH' ? colors.danger : riskLevel === 'MEDIUM' ? colors.warning : colors.success;
        
        doc.fillColor(badgeColor);
        doc.roundedRect(cellX + 2, rowY + 2, colWidths[colIndex] - 4, 14, 2);
        doc.fill();
        
        doc.fillColor(colors.white);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(data, cellX + 4, rowY + 7, { width: colWidths[colIndex] - 8, align: 'center' });
      } else {
        // Handle multi-line text with consistent font sizing
        doc.fillColor(colors.text);
        doc.font('Helvetica');
        doc.fontSize(7); // Consistent font size throughout
        
        // Split by newlines and render each line separately
        const lines = data.split('\n');
        let lineY = rowY + 3;
        const lineHeight = 8;
        
        lines.forEach((line, lineIndex) => {
          if (lineIndex < 4 && lineY + lineHeight <= rowY + rowHeight - 4) {
            doc.font('Helvetica');
            doc.fontSize(7); // Same size for all text
            doc.fillColor(colors.text);
            
            doc.text(line.trim(), cellX + 3, lineY, { 
              width: colWidths[colIndex] - 6,
              height: lineHeight,
              ellipsis: true
            });
            lineY += lineHeight;
          }
        });
      }
      
      cellX += colWidths[colIndex];
    });
    
    rowY += rowHeight;
    currentPageActivities++;
  });

  // Add Plant & Equipment Register page
  doc.addPage();
  
  // Plant & Equipment Register Card
  const equipY = appCard(30, 80, 780, 400, 'PLANT & EQUIPMENT REGISTER', colors.warning);

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

  // Equipment data - comprehensive electrical equipment list
  const equipment = swmsData.plant_equipment || swmsData.equipment || [
    { item: 'Mobile Crane', description: '50T Mobile Crane', make: 'Liebherr LTM 1050', registration: 'CR002-2024', inspection: '10/06/2025', risk: 'High' },
    { item: 'Excavator', description: '20T Hydraulic Excavator', make: 'Caterpillar 320D', registration: 'EX001-2024', inspection: '15/06/2025', risk: 'Medium' },
    { item: 'Power Tools', description: 'Various hand tools', make: 'DeWalt/Makita', registration: 'N/A', inspection: '01/06/2025', risk: 'Low' },
    { item: 'Cable Pulling Winch', description: 'Electric cable pulling winch 5000kg', make: 'Greenlee 6500', registration: 'CPW001-2024', inspection: '20/06/2025', risk: 'Medium' },
    { item: 'Scissor Lift', description: '10m Electric Scissor Lift', make: 'Genie GS-2032', registration: 'SL003-2024', inspection: '25/06/2025', risk: 'High' },
    { item: 'Generator', description: '100kVA Diesel Generator', make: 'Caterpillar C4.4', registration: 'GEN002-2024', inspection: '12/06/2025', risk: 'Medium' },
    { item: 'Electrical Test Equipment', description: 'Insulation and continuity tester', make: 'Fluke 1587', registration: 'ETE001-2024', inspection: '05/06/2025', risk: 'Low' },
    { item: 'Cable Trenching Machine', description: 'Walk-behind trenching machine', make: 'Ditch Witch RT12', registration: 'CTM001-2024', inspection: '18/06/2025', risk: 'High' },
    { item: 'Conduit Bending Machine', description: 'Hydraulic conduit bender up to 100mm', make: 'Greenlee 881', registration: 'CBM001-2024', inspection: '22/06/2025', risk: 'Low' },
    { item: 'Core Drilling Rig', description: 'Diamond core drilling rig', make: 'Hilti DD 350', registration: 'CDR001-2024', inspection: '28/06/2025', risk: 'Medium' }
  ];
  
  let equipRowY = equipY + 16;
  const equipRowHeight = 25;
  
  equipment.forEach((equip: any, index: number) => {
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
        doc.roundedRect(equipCellX + 2, equipRowY + 2, equipColWidths[colIndex] - 4, 14, 2);
        doc.fill();
        
        doc.fillColor(colors.white);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(data, equipCellX + 4, equipRowY + 7, { width: equipColWidths[colIndex] - 8, align: 'center' });
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
    doc.fontSize(7);
    doc.text(header, sigHeaderX + 3, signatoryY + 45, { width: signatoryColWidths[index] - 6 });
    sigHeaderX += signatoryColWidths[index];
  });

  // Manual sign-on rows - fit within card boundaries (reduce to fit properly)
  let sigRowY = signatoryY + 56;
  const sigRowHeight = 16;
  const tableWidth = 720;
  const availableHeight = 450 - 80; // Card height minus header space
  const maxRows = Math.floor(availableHeight / sigRowHeight);
  
  for (let i = 1; i <= Math.min(18, maxRows); i++) {
    let sigCellX = 50;
    
    // Row background
    if (i % 2 === 0) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, sigRowY, tableWidth, sigRowHeight, 2);
      doc.fill();
    }
    
    // Row number
    doc.fillColor(colors.text);
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.text(i.toString(), sigCellX + 15, sigRowY + 4);
    
    // Draw cell borders
    signatoryColWidths.forEach((width, colIndex) => {
      doc.strokeColor(colors.border);
      doc.lineWidth(0.5);
      doc.rect(sigCellX, sigRowY, width, sigRowHeight);
      doc.stroke();
      sigCellX += width;
    });
    
    sigRowY += sigRowHeight;
  }

  return doc;
}
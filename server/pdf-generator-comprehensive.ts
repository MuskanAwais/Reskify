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

  // Load Riskify logo with proper aspect ratio
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

  // Header with logo - maintain aspect ratio
  if (logoBuffer) {
    doc.image(logoBuffer, 30, 20, { width: 80, height: 40, fit: [80, 40] });
  }

  // Title
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  doc.text('SAFE WORK METHOD STATEMENT', 130, 30, { width: 500 });

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
  
  doc.text(`Project: ${projectName}`, 130, 50);
  doc.text(`Location: ${projectLocation}`, 130, 62);

  // Project Information and Emergency Procedures Cards
  const projectY = appCard(30, 120, 380, 120, 'PROJECT INFORMATION', colors.primary);
  const emergencyY = appCard(430, 120, 380, 120, 'EMERGENCY PROCEDURES', colors.danger);

  // Project information content
  const projectInfo = [
    ['Principal Contractor:', swmsData.principal_contractor || swmsData.principalContractor || 'Elite Construction Management'],
    ['Project Name:', projectName],
    ['Project Address:', projectLocation],
    ['Trade Type:', swmsData.trade_type || swmsData.tradeType || 'Construction'],
    ['Document Version:', swmsData.document_version || swmsData.documentVersion || '1.0']
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

  // Emergency procedures content from SWMS data
  const emergencyContacts = swmsData.emergency_contacts || swmsData.emergencyContacts || [];
  const emergencyData = [
    ['Emergency Contact:', '000'],
    ['Assembly Point:', swmsData.assembly_point || 'Main Gate Assembly Area'],
    ['Nearest Hospital:', swmsData.nearest_hospital || swmsData.nearestHospital || 'Royal Melbourne Hospital'],
    ['Site Supervisor:', emergencyContacts.find((c: any) => c.role === 'Site Supervisor')?.phone || '0412 345 678'],
    ['First Aid Officer:', emergencyContacts.find((c: any) => c.role === 'First Aid Officer')?.phone || '0423 456 789']
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

  // Construction Control Risk Matrix Section - PROPERLY SPACED CARDS
  const matrixY = appCard(30, 280, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // FIXED: Calculate proper spacing with gaps between cards
  const matrixContainer = {
    x: 30,
    y: 300,
    width: 780,
    height: 160,
    padding: 20
  };
  
  const cardSpacing = {
    horizontal: 30, // Gap between left/right cards
    vertical: 20    // Gap between top/bottom cards
  };
  
  const cardDimensions = {
    width: (matrixContainer.width - matrixContainer.padding * 2 - cardSpacing.horizontal) / 2,
    height: (matrixContainer.height - cardSpacing.vertical) / 2
  };
  
  // Card positions with proper spacing
  const cardPositions = {
    topLeft: { 
      x: matrixContainer.x + matrixContainer.padding,
      y: matrixContainer.y
    },
    topRight: { 
      x: matrixContainer.x + matrixContainer.padding + cardDimensions.width + cardSpacing.horizontal,
      y: matrixContainer.y
    },
    bottomLeft: { 
      x: matrixContainer.x + matrixContainer.padding,
      y: matrixContainer.y + cardDimensions.height + cardSpacing.vertical
    },
    bottomRight: { 
      x: matrixContainer.x + matrixContainer.padding + cardDimensions.width + cardSpacing.horizontal,
      y: matrixContainer.y + cardDimensions.height + cardSpacing.vertical
    }
  };

  // A - Qualitative Scale Card (top left)
  const qualY = appCard(cardPositions.topLeft.x, cardPositions.topLeft.y, cardDimensions.width, cardDimensions.height, 'A - QUALITATIVE SCALE', colors.secondary);
  
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
    doc.text(level, cardPositions.topLeft.x + 8, qualRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(description, cardPositions.topLeft.x + 55, qualRowY, { width: cardDimensions.width - 65, height: 10 });
    qualRowY += 12;
  });

  // B - Quantitative Scale Card (top right)
  const quantY = appCard(cardPositions.topRight.x, cardPositions.topRight.y, cardDimensions.width, cardDimensions.height, 'B - QUANTITATIVE SCALE', colors.success);
  
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
    doc.text(cost, cardPositions.topRight.x + 8, quantRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(probability, cardPositions.topRight.x + 85, quantRowY, { width: cardDimensions.width - 95, height: 10 });
    quantRowY += 12;
  });

  // C - Likelihood vs Consequence Card (bottom left)
  const likelihoodY = appCard(cardPositions.bottomLeft.x, cardPositions.bottomLeft.y, cardDimensions.width, cardDimensions.height, 'C - LIKELIHOOD vs CONSEQUENCE', colors.warning);
  
  const riskMatrixGrid = [
    ['', 'Likely', 'Possible', 'Unlikely', 'Very Rarely'],
    ['Extreme', '16', '14', '11', '7'],
    ['High', '15', '12', '8', ''],
    ['Medium', '13', '9', '', ''],
    ['Low', '10', '', '', '']
  ];
  
  let gridRowY = likelihoodY;
  riskMatrixGrid.forEach((row, rowIndex) => {
    let gridX = cardPositions.bottomLeft.x + 8;
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
  const scoringY = appCard(cardPositions.bottomRight.x, cardPositions.bottomRight.y, cardDimensions.width, cardDimensions.height, 'D - RISK SCORING', colors.danger);
  
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
    doc.text(`${score} ${ranking}`, cardPositions.bottomRight.x + 8, scoringRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(action, cardPositions.bottomRight.x + 95, scoringRowY, { width: cardDimensions.width - 105, height: 10 });
    scoringRowY += 12;
  });

  // Page 2 - Work Activities & Risk Assessment
  doc.addPage();
  
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

  // Use comprehensive data from SWMS builder
  const workActivities = swmsData.work_activities || swmsData.workActivities || [];
  const riskAssessments = swmsData.risk_assessments || swmsData.riskAssessments || [];
  const complianceCodes = swmsData.compliance_codes || swmsData.complianceCodes || [];
  
  // Create comprehensive activities from actual SWMS data
  const activities = workActivities.length > 0 ? workActivities.map((activity: any, index: number) => {
    const risk = riskAssessments[index] || {};
    const legislation = complianceCodes.filter((code: string) => 
      code.includes('WHS') || code.includes('AS/NZS') || code.includes('AS ')
    ).slice(0, 2).join(', ') || 'WHS Regulation 2017';
    
    return {
      activity: activity.activity || activity.description || `Work activity ${index + 1}`,
      hazards: (activity.hazards || risk.hazards || []).join('\n• '),
      initial_risk: risk.initial_risk || 'M (8)',
      control_measures: (activity.control_measures || risk.control_measures || []).join('\n• '),
      residual_risk: risk.residual_risk || 'L (2)',
      legislation: legislation
    };
  }) : [
    { 
      activity: 'Cable tray installation on levels 15-20', 
      legislation: 'WHS Regulation 2017 Part 4.4 - Falls, AS/NZS 3000:2018',
      hazards: '• Falls from height during work activities\n• Manual handling of heavy cable trays\n• Electrical hazards from live circuits', 
      initial_risk: 'H (16)', 
      control_measures: '• Safety harness with dual lanyards required\n• Use mechanical lifting aids\n• Lockout/tagout procedures before work', 
      residual_risk: 'L (4)' 
    },
    { 
      activity: 'Main switchboard upgrades', 
      legislation: 'AS/NZS 3000:2018 Wiring Rules, AS/NZS 4871.1-2015',
      hazards: '• Electrical shock from live components\n• Manual handling injuries from heavy equipment\n• Arc flash potential', 
      initial_risk: 'H (15)', 
      control_measures: '• De-energize circuits before work\n• Use insulated tools and PPE\n• Mechanical lifting aids for panels', 
      residual_risk: 'L (3)' 
    },
    { 
      activity: 'Lighting circuit installation', 
      legislation: 'AS/NZS 3000:2018 Section 2, AS 2293.1-2018',
      hazards: '• Falls from height using ladders\n• Electrical shock hazards\n• Eye strain from poor lighting', 
      initial_risk: 'M (12)', 
      control_measures: '• Scaffold access platforms\n• Test circuits before touching\n• Adequate temporary lighting', 
      residual_risk: 'L (2)' 
    },
    { 
      activity: 'Emergency lighting system testing', 
      legislation: 'AS 2293.1-2018 Emergency Lighting, WHS Regulation 2017',
      hazards: '• Working in low light conditions\n• Electrical testing hazards\n• Falls during emergency testing', 
      initial_risk: 'M (9)', 
      control_measures: '• Portable lighting during tests\n• Qualified electrical testing personnel\n• Fall protection systems', 
      residual_risk: 'L (2)' 
    },
    { 
      activity: 'Final electrical testing and commissioning', 
      legislation: 'AS/NZS 3017:2022 Electrical Installations, AS/NZS 3760:2022',
      hazards: '• Electrical shock during testing\n• Equipment malfunction\n• Documentation errors', 
      initial_risk: 'M (8)', 
      control_measures: '• Qualified electrical engineers\n• Proper testing equipment\n• Systematic testing procedures', 
      residual_risk: 'L (2)' 
    }
  ];
  
  let rowY = riskY + 16;
  const rowHeight = 50;
  
  activities.slice(0, 6).forEach((activity: any, index: number) => {
    if (index % 2 === 1) {
      doc.fillColor(colors.background);
      doc.roundedRect(50, rowY, 740, rowHeight, 2);
      doc.fill();
    }
    
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(50, rowY, 740, rowHeight, 2);
    doc.stroke();
    
    let cellX = 50;
    const rowData = [
      activity.activity,
      activity.hazards,
      activity.initial_risk,
      activity.control_measures,
      activity.residual_risk,
      activity.legislation
    ];
    
    rowData.forEach((data, colIndex) => {
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

  // Page 3 - Plant & Equipment, Emergency Procedures, and Safety Signage
  doc.addPage();
  
  // Plant & Equipment Section
  const equipmentY = appCard(30, 80, 380, 160, 'PLANT & EQUIPMENT REGISTER', colors.warning);
  
  const plantEquipment = swmsData.plant_equipment || swmsData.plantEquipment || [
    { name: 'Mobile Scaffold', inspection: 'Daily visual check', certification: 'Current' },
    { name: 'Power Tools', inspection: 'Pre-use inspection', certification: 'Tagged & Tested' },
    { name: 'Electrical Testing Equipment', inspection: 'Calibration check', certification: 'Certified' },
    { name: 'Lifting Equipment', inspection: 'Weekly inspection', certification: 'Load tested' }
  ];
  
  let equipRowY = equipmentY;
  plantEquipment.slice(0, 6).forEach((equipment: any) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(equipment.name || equipment.equipment, 40, equipRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.text(`Inspection: ${equipment.inspection || 'As required'}`, 40, equipRowY + 8);
    doc.text(`Status: ${equipment.certification || equipment.status || 'Current'}`, 40, equipRowY + 16);
    equipRowY += 24;
  });

  // Emergency Response Section
  const emergencyResponseY = appCard(430, 80, 380, 160, 'EMERGENCY RESPONSE PROCEDURES', colors.danger);
  
  const emergencyProcedures = swmsData.emergency_procedures || swmsData.emergencyProcedures || {
    fire: 'Evacuate immediately, call 000, assemble at designated point',
    injury: 'Provide first aid, call 000 if serious, notify supervisor',
    evacuation: 'Follow evacuation routes, proceed to assembly point',
    spill: 'Contain spill, notify environmental officer, clean up'
  };
  
  let emergProcY = emergencyResponseY;
  Object.entries(emergencyProcedures).forEach(([type, procedure]) => {
    doc.font('Helvetica-Bold');
    doc.fontSize(6);
    doc.fillColor(colors.text);
    doc.text(type.toUpperCase(), 440, emergProcY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.text(typeof procedure === 'string' ? procedure : 'Follow site procedures', 440, emergProcY + 8, { width: 350, height: 20 });
    emergProcY += 32;
  });

  // Safety Signage & Communication Section
  const signageY = appCard(30, 260, 780, 120, 'SAFETY SIGNAGE & COMMUNICATION', colors.success);
  
  const safetySignage = [
    'Danger - High Voltage signs at all electrical work areas',
    'PPE Required signs at site entrances and work zones',
    'First Aid and Emergency Assembly Point signage clearly visible',
    'Hazard identification signs for specific work area risks',
    'Tool box talk records and safety briefing documentation',
    'Site safety rules and emergency contact information displayed'
  ];
  
  let signageRowY = signageY;
  safetySignage.forEach((sign, index) => {
    doc.font('Helvetica');
    doc.fontSize(7);
    doc.fillColor(colors.text);
    doc.text(`${index + 1}. ${sign}`, 40, signageRowY, { width: 720 });
    signageRowY += 16;
  });

  // Watermark
  doc.fillColor('#00000008');
  doc.font('Helvetica-Bold');
  doc.fontSize(60);
  doc.text('RISKIFY', 350, 350, { align: 'center' });

  return doc;
}
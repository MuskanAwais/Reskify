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
    // Separate colored header bar - standalone
    doc.fillColor(headerColor);
    doc.roundedRect(x, y, w, 32, 12);
    doc.fill();
    
    // Header text in white
    doc.fillColor(colors.white);
    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text(title, x + 15, y + 10);
    
    // White content card below header (separate)
    doc.fillColor(colors.white);
    doc.roundedRect(x, y + 38, w, h - 38, 12);
    doc.fill();
    
    // Content card border
    doc.strokeColor(colors.border);
    doc.lineWidth(0.5);
    doc.roundedRect(x, y + 38, w, h - 38, 12);
    doc.stroke();
    
    return y + 45; // Return content start position
  }

  // Header section - simple clean design
  doc.fillColor(colors.white);
  doc.rect(0, 0, 842, 60);
  doc.fill();
  
  // Riskify logo (left) - actual branded logo
  try {
    doc.image('./riskify-logo.png', 30, 10, { 
      width: 180, 
      height: 45
    });
  } catch (error) {
    // Fallback with green gradient text
    doc.font('Helvetica-Bold');
    doc.fontSize(20);
    doc.fillColor('#4ade80');
    doc.text('Riskify', 30, 16);
    doc.font('Helvetica');
    doc.fontSize(10);
    doc.fillColor('#6b7280');
    doc.text('AI SWMS Generator', 30, 40);
  }
  
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
  const riskY = appCard(30, 240, 780, 200, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

  // Table headers with adjusted column widths to prevent overflow
  const headers = ['#', 'Activity/Item', 'Hazards/Risks', 'Initial Risk Score', 'Control Measures', 'Residual Risk Score'];
  const colWidths = [30, 130, 170, 80, 190, 100];
  
  // Header background - neutral white
  doc.fillColor(colors.white);
  doc.roundedRect(50, riskY, 740, 18, 4);
  doc.fill();
  
  // Header border
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, riskY, 740, 18, 4);
  doc.stroke();

  let riskHeaderX = 50;
  headers.forEach((header, index) => {
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    if (index > 0) {
      doc.moveTo(riskHeaderX, riskY);
      doc.lineTo(riskHeaderX, riskY + 18);
      doc.stroke();
    }
    
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(header, riskHeaderX + 3, riskY + 6, { width: colWidths[index] - 6 });
    riskHeaderX += colWidths[index];
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
    
    // Ensure minimum 8 hazards and controls per activity protocol
    if (hazards.length < 8) {
      const activityType = activity.activity || activity.description || '';
      let defaultHazards = [];
      
      if (activityType.toLowerCase().includes('asbestos')) {
        defaultHazards = [
          'Asbestos fiber inhalation causing mesothelioma',
          'Cross-contamination to clean areas',
          'Improper disposal creating environmental hazard',
          'Equipment contamination spreading fibers',
          'Skin and eye contact with asbestos',
          'Environmental fiber release to atmosphere',
          'Worker exposure during material handling',
          'Public health risk from airborne particles'
        ];
      } else if (activityType.toLowerCase().includes('demolition')) {
        defaultHazards = [
          'Structural collapse during demolition work',
          'Flying debris striking workers or public',
          'Dust inhalation causing respiratory issues',
          'Excessive noise exposure causing hearing damage',
          'Vibration damage to adjacent structures',
          'Underground utility strikes causing electrocution',
          'Heavy machinery equipment failure',
          'Fall hazards from elevated work platforms'
        ];
      } else if (activityType.toLowerCase().includes('electrical')) {
        defaultHazards = [
          'Electrical shock and electrocution hazards',
          'Arc flash and electrical burns',
          'Equipment failure causing injury',
          'Working at height installation risks',
          'Manual handling of heavy equipment',
          'Exposure to live electrical systems',
          'Fire risk from electrical faults',
          'Tool and equipment malfunction hazards'
        ];
      } else {
        defaultHazards = [
          'Falls from height during work activities',
          'Manual handling injuries from heavy lifting',
          'Crushing injuries from equipment operation',
          'Struck by moving machinery or materials',
          'Weather exposure affecting work safety',
          'Slip, trip and fall hazards on surfaces',
          'Noise exposure from construction activities',
          'Chemical exposure from construction materials'
        ];
      }
      
      hazards = [...hazards, ...defaultHazards.slice(hazards.length)].slice(0, 8);
    }
    
    if (controlMeasures.length < 8) {
      const activityType = activity.activity || activity.description || '';
      let defaultControls = [];
      
      if (activityType.toLowerCase().includes('asbestos')) {
        defaultControls = [
          'P2 respirator masks mandatory for all workers',
          'Negative pressure enclosure system installed',
          'Licensed asbestos disposal contractor engaged',
          'Comprehensive decontamination procedures',
          'Full body disposable protective suits',
          'Continuous air monitoring throughout work',
          'Competent person supervision at all times',
          'Emergency response plan activated'
        ];
      } else if (activityType.toLowerCase().includes('demolition')) {
        defaultControls = [
          'Structural engineer assessment completed',
          'Exclusion zone establishment and barriers',
          'Water suppression dust control systems',
          'Mandatory hearing protection for all workers',
          'Continuous vibration monitoring systems',
          'Utility isolation and location verification',
          'Daily pre-start equipment inspections',
          'Fall protection harness systems installed'
        ];
      } else if (activityType.toLowerCase().includes('electrical')) {
        defaultControls = [
          'Isolation and lockout/tagout procedures',
          'Electrical testing before work commences',
          'Arc flash personal protective equipment',
          'Safety harness systems for elevated work',
          'Mechanical lifting aids for heavy equipment',
          'Voltage detection equipment mandatory',
          'Fire suppression systems operational',
          'Daily tool and equipment inspections'
        ];
      } else {
        defaultControls = [
          'Safety harness with dual lanyards required',
          'Mechanical lifting aids for manual handling',
          'Equipment operator competency verification',
          'Exclusion zones around moving machinery',
          'Weather monitoring and work cessation protocols',
          'Non-slip footwear and housekeeping standards',
          'Hearing protection in designated areas',
          'Material safety data sheets readily available'
        ];
      }
      
      controlMeasures = [...controlMeasures, ...defaultControls.slice(controlMeasures.length)].slice(0, 8);
    }
    
    // Extract additional SWMS builder data
    const legislation = activity.legislation || risk.legislation || control.legislation || [];
    const additionalInfo = activity.additional_info || risk.additional_info || '';
    const workMethod = activity.work_method || activity.method || '';
    const ppe = activity.ppe || control.ppe || [];
    const qualifications = activity.qualifications || risk.qualifications || [];
    
    // Calculate dynamic row height based on tallest cell content
    const hazardHeight = (hazards.length * 8) + (legislation.length > 0 ? legislation.length * 6 + 12 : 0);
    const controlHeight = (controlMeasures.length * 8) + 
                         (ppe.length > 0 ? ppe.length * 6 + 12 : 0) + 
                         (qualifications.length > 0 ? qualifications.length * 6 + 12 : 0) + 
                         (workMethod ? 24 : 0);
    const activityHeight = 10 + (workMethod ? 18 : 0) + (additionalInfo ? 18 : 0);
    
    const tallestContent = Math.max(hazardHeight, controlHeight, activityHeight, 35);
    const rowHeight = tallestContent + 10; // Add padding
    
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
      // Hazards column - comprehensive hazard information
      else if (colIndex === 2) {
        let hazardY = rowY + 3;
        
        // All hazards
        hazards.forEach((hazard: any) => {
          doc.fillColor(colors.text);
          doc.font('Helvetica');
          doc.fontSize(6);
          doc.text(`• ${hazard}`, cellX + 3, hazardY, { 
            width: colWidths[colIndex] - 6,
            height: 8
          });
          hazardY += 8;
        });
        
        // Add legislation if available
        if (legislation && legislation.length > 0) {
          hazardY += 2;
          doc.font('Helvetica-Bold');
          doc.fontSize(5);
          doc.fillColor(colors.textMuted);
          doc.text('Legislation:', cellX + 3, hazardY);
          hazardY += 6;
          
          const legArray = Array.isArray(legislation) ? legislation : [legislation];
          legArray.forEach((leg: any) => {
            if (leg) {
              doc.font('Helvetica');
              doc.fontSize(5);
              doc.fillColor(colors.text);
              doc.text(`• ${leg}`, cellX + 3, hazardY, { 
                width: colWidths[colIndex] - 6,
                height: 6
              });
              hazardY += 6;
            }
          });
        }
      }
      // Controls column - comprehensive control information
      else if (colIndex === 4) {
        let controlY = rowY + 3;
        
        // All control measures
        controlMeasures.forEach((controlMeasure: any) => {
          doc.fillColor(colors.text);
          doc.font('Helvetica');
          doc.fontSize(6);
          doc.text(`• ${controlMeasure}`, cellX + 3, controlY, { 
            width: colWidths[colIndex] - 6,
            height: 8
          });
          controlY += 8;
        });
        
        // Add PPE requirements
        if (ppe && ppe.length > 0) {
          controlY += 2;
          doc.font('Helvetica-Bold');
          doc.fontSize(5);
          doc.fillColor(colors.textMuted);
          doc.text('PPE Required:', cellX + 3, controlY);
          controlY += 6;
          
          const ppeArray = Array.isArray(ppe) ? ppe : [ppe];
          ppeArray.forEach((item: any) => {
            if (item) {
              doc.font('Helvetica');
              doc.fontSize(5);
              doc.fillColor(colors.text);
              doc.text(`• ${item}`, cellX + 3, controlY, { 
                width: colWidths[colIndex] - 6,
                height: 6
              });
              controlY += 6;
            }
          });
        }
        
        // Add qualifications
        if (qualifications && qualifications.length > 0) {
          controlY += 2;
          doc.font('Helvetica-Bold');
          doc.fontSize(5);
          doc.fillColor(colors.textMuted);
          doc.text('Qualifications:', cellX + 3, controlY);
          controlY += 6;
          
          const qualArray = Array.isArray(qualifications) ? qualifications : [qualifications];
          qualArray.forEach((qual: any) => {
            if (qual) {
              doc.font('Helvetica');
              doc.fontSize(5);
              doc.fillColor(colors.text);
              doc.text(`• ${qual}`, cellX + 3, controlY, { 
                width: colWidths[colIndex] - 6,
                height: 6
              });
              controlY += 6;
            }
          });
        }
        
        // Add work method if available
        if (workMethod) {
          controlY += 2;
          doc.font('Helvetica-Bold');
          doc.fontSize(5);
          doc.fillColor(colors.textMuted);
          doc.text('Work Method:', cellX + 3, controlY);
          controlY += 6;
          
          doc.font('Helvetica');
          doc.fontSize(5);
          doc.fillColor(colors.text);
          doc.text(workMethod, cellX + 3, controlY, { 
            width: colWidths[colIndex] - 6,
            height: 12
          });
        }
      }
      // Activity/Item column - comprehensive activity information  
      else if (colIndex === 1) {
        let activityY = rowY + 3;
        
        // Main activity name
        doc.fillColor(colors.text);
        doc.font('Helvetica-Bold');
        doc.fontSize(7);
        doc.text(data, cellX + 3, activityY, { 
          width: colWidths[colIndex] - 6,
          height: 8
        });
        activityY += 10;
        
        // Add work method if available
        if (workMethod) {
          doc.font('Helvetica');
          doc.fontSize(5);
          doc.fillColor(colors.textMuted);
          doc.text('Method:', cellX + 3, activityY);
          activityY += 6;
          
          doc.fillColor(colors.text);
          doc.text(workMethod, cellX + 3, activityY, { 
            width: colWidths[colIndex] - 6,
            height: 10
          });
          activityY += 12;
        }
        
        // Add additional info if available
        if (additionalInfo) {
          doc.font('Helvetica');
          doc.fontSize(5);
          doc.fillColor(colors.textMuted);
          doc.text('Notes:', cellX + 3, activityY);
          activityY += 6;
          
          doc.fillColor(colors.text);
          doc.text(additionalInfo, cellX + 3, activityY, { 
            width: colWidths[colIndex] - 6,
            height: 10
          });
        }
      }
      // Regular text columns (risk scores, row numbers)
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
  
  doc.fillColor(colors.white);
  doc.roundedRect(50, matrixY, 620, 16, 4);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, matrixY, 620, 16, 4);
  doc.stroke();
  
  let matrixHeaderX = 50;
  riskHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, matrixHeaderX + 3, matrixY + 5, { width: riskColWidths[index] - 6 });
    matrixHeaderX += riskColWidths[index];
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
  
  doc.fillColor(colors.white);
  doc.roundedRect(50, equipY, 740, 16, 4);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, equipY, 740, 16, 4);
  doc.stroke();
  
  let equipHeaderX = 50;
  equipHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
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

  // Emergency Procedures Card - matching SWMS builder format
  const emergY = appCard(30, 470, 780, 100, 'EMERGENCY PROCEDURES & CONTACTS', colors.danger);
  
  // Emergency contact fields in proper layout
  const emergencyFields = [
    ['Emergency Contact:', 'Site Supervisor: 0412 345 678'],
    ['Site Supervisor:', 'On-site supervisor'],
    ['Assembly Point:', 'Southbank Boulevard - North End'],
    ['Nearest Hospital:', 'Alfred Hospital']
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
    doc.fontSize(9);
    doc.text(field[1], x, y + 12, { width: 340 });
    
    if (isLeft) emergLeftY += 28;
    else emergRightY += 28;
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
  
  // Manual Site Sign-On Table
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text('MANUAL SITE SIGN-ON TABLE', 50, appSigY);
  
  let tableY = appSigY + 25;
  const signOnColWidths = [50, 200, 250, 240]; // #, Name, Number, Signature, Date
  const signOnHeaders = ['#', 'Name', 'Number', 'Signature', 'Date'];
  
  // Table header with neutral background
  doc.fillColor(colors.white);
  doc.roundedRect(50, tableY, 740, 20, 4);
  doc.fill();
  
  doc.strokeColor(colors.border);
  doc.lineWidth(0.5);
  doc.roundedRect(50, tableY, 740, 20, 4);
  doc.stroke();
  
  let signOnHeaderX = 50;
  signOnHeaders.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(8);
    doc.text(header, signOnHeaderX + 5, tableY + 6);
    signOnHeaderX += signOnColWidths[index];
  });
  
  // 20 blank rows for manual sign-on
  tableY += 20;
  for (let row = 1; row <= 20; row++) {
    // Alternating row colors
    if (row % 2 === 0) {
      doc.fillColor('#f8fafc');
      doc.rect(50, tableY, 740, 18);
      doc.fill();
    }
    
    // Row borders
    doc.strokeColor(colors.border);
    doc.lineWidth(0.3);
    doc.rect(50, tableY, 740, 18);
    doc.stroke();
    
    // Column dividers and row number
    let cellX = 50;
    signOnColWidths.forEach((width, colIndex) => {
      if (colIndex > 0) {
        doc.strokeColor(colors.border);
        doc.moveTo(cellX, tableY);
        doc.lineTo(cellX, tableY + 18);
        doc.stroke();
      }
      
      // Add row number in first column
      if (colIndex === 0) {
        doc.fillColor(colors.textMuted);
        doc.font('Helvetica');
        doc.fontSize(7);
        doc.text(row.toString(), cellX + 5, tableY + 5);
      }
      
      cellX += width;
    });
    
    tableY += 18;
  }

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
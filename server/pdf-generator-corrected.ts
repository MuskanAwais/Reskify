import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

interface PDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateAppMatchPDF(options: PDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  // Color scheme
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

  // App card helper function
  function appCard(x: number, y: number, w: number, h: number, title: string, headerColor = colors.primary) {
    // Card background
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

  // Header section
  doc.fillColor(colors.text);
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  doc.text('SAFE WORK METHOD STATEMENT', 200, 25, { width: 400 });

  doc.font('Helvetica');
  doc.fontSize(10);
  doc.text(`Project: ${projectName}`, 200, 50);
  doc.text(`Location: ${projectAddress}`, 200, 62);

  // Document metadata
  doc.font('Helvetica-Bold');
  doc.fontSize(8);
  doc.text(`Document ID: ${uniqueId}`, 650, 25, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-AU')}`, 650, 37, { align: 'right' });

  // Project Information and Emergency Procedures Cards
  const projectY = appCard(30, 120, 380, 120, 'PROJECT INFORMATION', colors.primary);
  const emergencyY = appCard(430, 120, 380, 120, 'EMERGENCY PROCEDURES', colors.danger);

  // Project information content
  const projectInfo = [
    ['Principal Contractor:', swmsData.principal_contractor || 'Elite Construction Management'],
    ['Project Name:', projectName],
    ['Project Address:', projectAddress],
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

  // Construction Control Risk Matrix Section - CORRECTED SPACING
  const matrixY = appCard(30, 280, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // Calculate positioning for equal spacing within container
  const containerPadding = 20;
  const cardGapH = 20; // Horizontal gap between cards
  const cardGapV = 15; // Vertical gap between cards
  const availableWidth = 780 - (containerPadding * 2);
  const availableHeight = 200 - 40; // Minus header space
  
  const cardW = (availableWidth - cardGapH) / 2;
  const cardH = (availableHeight - cardGapV) / 2;
  
  const leftCardX = 30 + containerPadding;
  const rightCardX = leftCardX + cardW + cardGapH;
  const topCardY = 300;
  const bottomCardY = topCardY + cardH + cardGapV;
  
  // A - Qualitative Scale Card (top left)
  const qualY = appCard(leftCardX, topCardY, cardW, cardH, 'A - QUALITATIVE SCALE', colors.secondary);
  
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
    doc.text(level, leftCardX + 8, qualRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(description, leftCardX + 55, qualRowY, { width: cardW - 65, height: 10 });
    qualRowY += 12;
  });

  // B - Quantitative Scale Card (top right)
  const quantY = appCard(rightCardX, topCardY, cardW, cardH, 'B - QUANTITATIVE SCALE', colors.success);
  
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
    doc.text(cost, rightCardX + 8, quantRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(probability, rightCardX + 85, quantRowY, { width: cardW - 95, height: 10 });
    quantRowY += 12;
  });

  // C - Likelihood vs Consequence Card (bottom left)
  const likelihoodY = appCard(leftCardX, bottomCardY, cardW, cardH, 'C - LIKELIHOOD vs CONSEQUENCE', colors.warning);
  
  const riskMatrixGrid = [
    ['', 'Likely', 'Possible', 'Unlikely'],
    ['Extreme', '16', '14', '11'],
    ['High', '15', '12', '8'],
    ['Medium', '13', '9', '']
  ];
  
  let gridRowY = likelihoodY;
  riskMatrixGrid.forEach((row, rowIndex) => {
    let gridX = leftCardX + 8;
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
  const scoringY = appCard(rightCardX, bottomCardY, cardW, cardH, 'D - RISK SCORING', colors.danger);
  
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
    doc.text(`${score} ${ranking}`, rightCardX + 8, scoringRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.fillColor(colors.text);
    doc.text(action, rightCardX + 95, scoringRowY, { width: cardW - 105, height: 10 });
    scoringRowY += 12;
  });

  // Activities table on second page
  doc.addPage();
  
  const activitiesY = appCard(30, 80, 780, 500, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

  const activities = swmsData.work_activities || [
    { 
      activity: 'Site establishment and safety briefing',
      hazards: 'Manual handling, Site hazards',
      initial_risk: 'M (8)',
      control_measures: 'Safety induction, Site inspection',
      residual_risk: 'L (2)',
      legislation: 'WHS Regulation 2017'
    }
  ];

  // Table headers
  const headers = ['Activity', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Legislation'];
  const colWidths = [130, 140, 70, 150, 70, 120];
  
  doc.fillColor(colors.background);
  doc.roundedRect(50, activitiesY, 740, 16, 4);
  doc.fill();
  
  let headerX = 50;
  headers.forEach((header, index) => {
    doc.fillColor(colors.text);
    doc.font('Helvetica-Bold');
    doc.fontSize(7);
    doc.text(header, headerX + 3, activitiesY + 5, { width: colWidths[index] - 6 });
    headerX += colWidths[index];
  });

  // Activity rows
  let rowY = activitiesY + 20;
  activities.slice(0, 6).forEach((activity: any, index: number) => {
    const rowHeight = 50;
    
    if (index % 2 === 1) {
      doc.fillColor('#f8fafc');
      doc.roundedRect(50, rowY, 740, rowHeight, 2);
      doc.fill();
    }
    
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
      doc.fillColor(colors.text);
      doc.font('Helvetica');
      doc.fontSize(7);
      doc.text(data || '', cellX + 3, rowY + 4, { 
        width: colWidths[colIndex] - 6, 
        height: rowHeight - 8,
        ellipsis: true
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
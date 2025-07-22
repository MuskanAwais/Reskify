import * as PDFDocument from 'pdfkit';
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
    // Card background
    doc.fillColor(colors.white);
    doc.roundedRect(x, y - 25, w, h + 25, 8);
    doc.fill();
    
    // Card shadow
    doc.fillColor('#00000010');
    doc.roundedRect(x + 2, y - 23, w, h + 25, 8);
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

  // Project details cards - side by side
  const projectY = appCard(30, 120, 380, 80, 'PROJECT DETAILS', colors.primary);
  
  const projectDetails = [
    ['Project Name:', projectName],
    ['Project Address:', projectAddress],
    ['Principal Contractor:', swmsData.principal_contractor || 'Not specified'],
    ['Start Date:', swmsData.start_date || new Date().toLocaleDateString()]
  ];
  
  let detailY = projectY;
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
    
    if (isLeft) leftY += 22;
    else rightY += 22;
    
    isLeft = !isLeft;
  });

  // Construction Control Risk Matrix Section - Main header with 2x2 grid
  const sectionY = appCard(30, 240, 780, 200, 'CONSTRUCTION CONTROL RISK MATRIX', colors.slate);
  
  // A - Qualitative Scale Card (top left)
  const qualY = appCard(50, 280, 185, 80, 'A - QUALITATIVE SCALE', colors.secondary);
  
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
    doc.text(level, 60, qualRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.text(description, 60, qualRowY + 8, { width: 150, height: 10 });
    qualRowY += 16;
  });

  // B - Quantitative Scale Card (top right)
  const quantY = appCard(245, 280, 185, 80, 'B - QUANTITATIVE SCALE', colors.success);
  
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
    doc.text(cost, 255, quantRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.text(probability, 255, quantRowY + 8, { width: 150, height: 10 });
    quantRowY += 16;
  });

  // C - Likelihood vs Consequence Card (bottom left)
  const likelihoodY = appCard(440, 280, 185, 80, 'C - LIKELIHOOD vs CONSEQUENCE', colors.warning);
  
  const riskMatrixGrid = [
    ['', 'Likely', 'Possible', 'Unlikely'],
    ['Extreme', '16', '14', '11'],
    ['High', '15', '12', '8'],
    ['Medium', '13', '9', '']
  ];
  
  let gridRowY = likelihoodY;
  riskMatrixGrid.forEach((row, rowIndex) => {
    let gridX = 450;
    row.forEach((cell, colIndex) => {
      if (cell) {
        // Color code risk scores
        if (rowIndex > 0 && colIndex > 0 && cell) {
          const score = parseInt(cell);
          const scoreColor = score >= 16 ? '#DC2626' : score >= 11 ? '#F59E0B' : score >= 7 ? '#10B981' : '#6B7280';
          doc.fillColor(scoreColor);
          doc.roundedRect(gridX - 1, gridRowY - 1, 20, 12, 2);
          doc.fill();
          doc.fillColor(colors.white);
        }
        
        doc.font(rowIndex === 0 || colIndex === 0 ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(5);
        doc.text(cell, gridX, gridRowY, { width: 20 });
        doc.fillColor(colors.text);
      }
      gridX += 25;
    });
    gridRowY += 16;
  });

  // D - Risk Scoring Card (bottom right)
  const scoringY = appCard(635, 280, 185, 80, 'D - RISK SCORING', colors.danger);
  
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
    doc.text(`${score} ${ranking}`, 645, scoringRowY);
    
    doc.font('Helvetica');
    doc.fontSize(5);
    doc.text(action, 645, scoringRowY + 8, { width: 150, height: 10 });
    scoringRowY += 16;
  });

  // Work Activities & Risk Assessment Card
  const riskY = appCard(30, 460, 780, 200, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.secondary);

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

  // Risk assessment data
  const risks = swmsData.risk_assessments || [];
  let rowY = riskY + 16;
  const rowHeight = 30;
  
  risks.slice(0, 5).forEach((risk: any, index: number) => {
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

  // Emergency procedures card
  const emergencyY = appCard(450, 120, 360, 80, 'EMERGENCY PROCEDURES', colors.danger);
  
  const emergencyData = [
    ['Emergency Contact:', swmsData.emergency_contact || '000'],
    ['Site Supervisor:', swmsData.site_supervisor || 'Not specified'],
    ['Assembly Point:', swmsData.assembly_point || 'Main entrance'],
    ['Nearest Hospital:', swmsData.nearest_hospital || 'Local hospital']
  ];
  
  let emergencyRowY = emergencyY;
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

  // Watermark
  doc.fillColor('#00000008');
  doc.font('Helvetica-Bold');
  doc.fontSize(60);
  doc.text('RISKIFY', 350, 350, { align: 'center' });

  return doc;
}
}
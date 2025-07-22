import PDFDocument from 'pdfkit';
import { createReadStream } from 'fs';
import path from 'path';

interface ModernPDFOptions {
  swmsData: any;
  projectName: string;
  projectAddress: string;
  uniqueId: string;
}

export function generateModernPDF(options: ModernPDFOptions) {
  const { swmsData, projectName, projectAddress, uniqueId } = options;
  
  // Create PDF in landscape orientation for modern layout
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 40, right: 40 }
  });

  // Modern color palette
  const colors = {
    primary: '#2563eb',      // Blue-600
    secondary: '#64748b',    // Slate-500
    accent: '#0ea5e9',       // Sky-500
    success: '#059669',      // Emerald-600
    warning: '#d97706',      // Amber-600
    danger: '#dc2626',       // Red-600
    light: '#f8fafc',        // Slate-50
    gray: '#f1f5f9',         // Slate-100
    border: '#e2e8f0',       // Slate-200
    text: '#1e293b',         // Slate-800
    textLight: '#64748b'     // Slate-500
  };

  // Modern typography settings
  const fonts = {
    heading: 'Helvetica-Bold',
    subheading: 'Helvetica-Bold',
    body: 'Helvetica',
    caption: 'Helvetica'
  };

  // Add watermark background
  function addWatermark() {
    doc.save();
    doc.opacity(0.03);
    doc.fontSize(120);
    doc.font('Helvetica-Bold');
    doc.fillColor('#000000');
    
    // Create diagonal watermark pattern
    const watermarkText = 'RISKIFY';
    for (let x = -100; x < 900; x += 200) {
      for (let y = -50; y < 650; y += 150) {
        doc.save();
        doc.translate(x, y);
        doc.rotate(-45);
        doc.text(watermarkText, 0, 0);
        doc.restore();
      }
    }
    
    // Add project-specific watermark
    doc.fontSize(24);
    doc.text(`${projectName} - ${uniqueId}`, 50, 550, {
      width: 700,
      align: 'center'
    });
    
    doc.restore();
  }

  // Draw modern card with shadow effect
  function drawCard(x: number, y: number, width: number, height: number, title?: string) {
    // Shadow effect
    doc.save();
    doc.fillColor('#000000');
    doc.opacity(0.08);
    doc.roundedRect(x + 3, y + 3, width, height, 8);
    doc.fill();
    doc.restore();

    // Main card
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, width, height, 8);
    doc.fill();
    
    // Card border
    doc.strokeColor(colors.border);
    doc.lineWidth(1);
    doc.roundedRect(x, y, width, height, 8);
    doc.stroke();

    // Card header if title provided
    if (title) {
      doc.fillColor(colors.primary);
      doc.roundedRect(x, y, width, 35, 8);
      doc.fill();
      
      // Reset rounded corners for bottom of header
      doc.fillColor(colors.primary);
      doc.rect(x, y + 27, width, 8);
      doc.fill();
      
      // Title text
      doc.fillColor('#ffffff');
      doc.font(fonts.heading);
      doc.fontSize(12);
      doc.text(title, x + 15, y + 12, { width: width - 30 });
    }
  }

  // Start document generation
  addWatermark();

  let yPosition = 60;
  const cardWidth = 340;
  const cardHeight = 180;
  const cardMargin = 20;

  // Header Card - Project Information
  drawCard(50, yPosition, 740, 80, 'PROJECT INFORMATION');
  
  doc.fillColor(colors.text);
  doc.font(fonts.body);
  doc.fontSize(10);
  
  // Project details in two columns
  const projectInfo = [
    { label: 'Project Name:', value: swmsData.project_name || projectName },
    { label: 'Project Address:', value: swmsData.project_address || projectAddress },
    { label: 'Principal Contractor:', value: swmsData.principal_contractor || 'Not specified' },
    { label: 'Document ID:', value: uniqueId },
    { label: 'Date Generated:', value: new Date().toLocaleDateString('en-AU') },
    { label: 'Status:', value: swmsData.status || 'Draft' }
  ];

  let col1Y = yPosition + 45;
  let col2Y = yPosition + 45;
  
  projectInfo.forEach((info, index) => {
    const x = index % 2 === 0 ? 70 : 420;
    const y = index % 2 === 0 ? col1Y : col2Y;
    
    doc.font(fonts.subheading);
    doc.text(info.label, x, y, { width: 100 });
    doc.font(fonts.body);
    doc.text(info.value, x + 110, y, { width: 200 });
    
    if (index % 2 === 0) {
      col1Y += 15;
    } else {
      col2Y += 15;
    }
  });

  yPosition += 100;

  // Work Activities Card
  if (swmsData.work_activities && swmsData.work_activities.length > 0) {
    drawCard(50, yPosition, 360, 200, 'WORK ACTIVITIES & TASKS');
    
    let activityY = yPosition + 45;
    doc.fillColor(colors.text);
    doc.font(fonts.body);
    doc.fontSize(9);
    
    swmsData.work_activities.slice(0, 8).forEach((activity: any, index: number) => {
      // Activity number badge
      doc.fillColor(colors.accent);
      doc.circle(70, activityY + 5, 8);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font(fonts.subheading);
      doc.fontSize(8);
      doc.text((index + 1).toString(), 67, activityY + 2);
      
      // Activity text
      doc.fillColor(colors.text);
      doc.font(fonts.body);
      doc.fontSize(9);
      doc.text(activity.activity || activity.description || 'Activity not specified', 85, activityY, {
        width: 310,
        height: 18,
        ellipsis: true
      });
      
      activityY += 20;
    });
  }

  // Risk Assessment Card
  if (swmsData.risk_assessments && swmsData.risk_assessments.length > 0) {
    drawCard(430, yPosition, 360, 200, 'RISK ASSESSMENT MATRIX');
    
    // Risk matrix table
    let riskY = yPosition + 45;
    const riskTableWidth = 320;
    const colWidths = [80, 60, 60, 120];
    
    // Table headers
    doc.fillColor(colors.gray);
    doc.rect(450, riskY, riskTableWidth, 25);
    doc.fill();
    
    doc.fillColor(colors.text);
    doc.font(fonts.subheading);
    doc.fontSize(8);
    
    const headers = ['Hazard', 'Likelihood', 'Severity', 'Risk Level'];
    let headerX = 450;
    headers.forEach((header, index) => {
      doc.text(header, headerX + 5, riskY + 8, { width: colWidths[index] - 10 });
      headerX += colWidths[index];
    });
    
    riskY += 25;
    
    // Risk data rows
    swmsData.risk_assessments.slice(0, 6).forEach((risk: any, index: number) => {
      // Alternating row colors
      if (index % 2 === 0) {
        doc.fillColor('#ffffff');
      } else {
        doc.fillColor(colors.light);
      }
      doc.rect(450, riskY, riskTableWidth, 20);
      doc.fill();
      
      // Risk level color coding
      const riskLevel = risk.risk_level || 'Medium';
      let riskColor = colors.warning;
      if (riskLevel.toLowerCase().includes('high')) riskColor = colors.danger;
      if (riskLevel.toLowerCase().includes('low')) riskColor = colors.success;
      
      // Risk level badge
      doc.fillColor(riskColor);
      doc.rect(450 + colWidths[0] + colWidths[1] + colWidths[2], riskY + 3, colWidths[3] - 6, 14);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font(fonts.subheading);
      doc.fontSize(7);
      doc.text(riskLevel, 450 + colWidths[0] + colWidths[1] + colWidths[2] + 5, riskY + 7, { 
        width: colWidths[3] - 10, 
        align: 'center' 
      });
      
      // Other risk data
      doc.fillColor(colors.text);
      doc.font(fonts.body);
      doc.fontSize(8);
      
      let dataX = 450;
      const riskData = [
        risk.hazard || 'Not specified',
        risk.likelihood || 'Medium',
        risk.severity || 'Medium'
      ];
      
      riskData.forEach((data, colIndex) => {
        if (colIndex < 3) { // Skip risk level column as it's already drawn
          doc.text(data, dataX + 5, riskY + 7, { 
            width: colWidths[colIndex] - 10,
            height: 14,
            ellipsis: true
          });
          dataX += colWidths[colIndex];
        }
      });
      
      riskY += 20;
    });
  }

  yPosition += 220;

  // Control Measures Card
  if (swmsData.control_measures && swmsData.control_measures.length > 0) {
    drawCard(50, yPosition, 360, 150, 'CONTROL MEASURES');
    
    let controlY = yPosition + 45;
    doc.fillColor(colors.text);
    doc.font(fonts.body);
    doc.fontSize(9);
    
    swmsData.control_measures.slice(0, 6).forEach((control: any, index: number) => {
      // Control type badge
      const controlType = control.control_type || 'Administrative';
      let badgeColor = colors.secondary;
      if (controlType.toLowerCase().includes('engineering')) badgeColor = colors.primary;
      if (controlType.toLowerCase().includes('ppe')) badgeColor = colors.accent;
      
      doc.fillColor(badgeColor);
      doc.roundedRect(70, controlY, 60, 12, 3);
      doc.fill();
      
      doc.fillColor('#ffffff');
      doc.font(fonts.subheading);
      doc.fontSize(7);
      doc.text(controlType.toUpperCase(), 72, controlY + 3, { width: 56, align: 'center' });
      
      // Control description
      doc.fillColor(colors.text);
      doc.font(fonts.body);
      doc.fontSize(9);
      doc.text(control.control_measure || control.description || 'Control not specified', 140, controlY + 2, {
        width: 250,
        height: 15,
        ellipsis: true
      });
      
      controlY += 20;
    });
  }

  // Emergency Procedures Card
  if (swmsData.emergency_procedures) {
    drawCard(430, yPosition, 360, 150, 'EMERGENCY PROCEDURES');
    
    let emergencyY = yPosition + 45;
    doc.fillColor(colors.text);
    doc.font(fonts.body);
    doc.fontSize(9);
    
    const emergencyItems = [
      { icon: '🚨', label: 'Emergency Contact:', value: swmsData.emergency_procedures.emergency_contact || 'Site Supervisor' },
      { icon: '📞', label: 'Phone Number:', value: swmsData.emergency_procedures.phone_number || '000' },
      { icon: '🏥', label: 'Nearest Hospital:', value: swmsData.emergency_procedures.nearest_hospital || 'Local Hospital' },
      { icon: '🔥', label: 'Fire Assembly Point:', value: swmsData.emergency_procedures.assembly_point || 'Site Entry' },
      { icon: '⚠️', label: 'Evacuation Route:', value: swmsData.emergency_procedures.evacuation_route || 'Main Exit' }
    ];
    
    emergencyItems.forEach((item, index) => {
      doc.font(fonts.subheading);
      doc.fontSize(8);
      doc.text(item.label, 450, emergencyY, { width: 100 });
      
      doc.font(fonts.body);
      doc.text(item.value, 560, emergencyY, { width: 200 });
      
      emergencyY += 18;
    });
  }

  // Footer
  const footerY = 550;
  doc.fillColor(colors.primary);
  doc.rect(50, footerY, 740, 30);
  doc.fill();
  
  doc.fillColor('#ffffff');
  doc.font(fonts.body);
  doc.fontSize(8);
  doc.text('Generated by RISKIFY - Professional SWMS Builder', 60, footerY + 8);
  doc.text(`Document ID: ${uniqueId} | Generated: ${new Date().toLocaleString('en-AU')}`, 60, footerY + 18);
  
  doc.text('This document is project-specific and should not be reused without regeneration', 450, footerY + 13, {
    width: 330,
    align: 'right'
  });

  return doc;
}
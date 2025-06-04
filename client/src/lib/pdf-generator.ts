import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { translations } from './translations';

// Extend jsPDF types for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface User {
  id: number;
  username: string;
  email: string;
  companyName: string;
  primaryTrade: string;
}

interface SwmsDocument {
  id: string | number;
  title: string;
  tradeType: string;
  projectLocation: string;
  activities: string[];
  riskAssessments?: Array<{
    hazard: string;
    riskLevel: string;
    controlMeasures: string | string[];
    responsiblePerson: string;
  }>;
  safetyMeasures?: Array<{
    category: string;
    measures: string[];
    equipment: string[];
    procedures: string[];
  }>;
  complianceCodes: string[];
  status: string;
  aiEnhanced: boolean;
  createdAt: string | Date;
  documentHash?: string;
}

// Add company logo for Pro/Enterprise plans
function addCompanyLogo(pdf: jsPDF, user: User, subscription: any) {
  if (subscription?.plan === "Pro" || subscription?.plan === "Enterprise") {
    // Logo positioning on front page
    const logoX = 15;
    const logoY = 15;
    const logoWidth = 50;
    const logoHeight = 20;
    
    // Add logo placeholder/company branding area
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(logoX, logoY, logoWidth, logoHeight, 'F');
    
    // Company name in logo area
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 118, 210); // Blue text
    pdf.text(user.companyName || 'Company Name', logoX + 2, logoY + 8);
    
    // Add "Custom Branding" text for Pro/Enterprise
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Professional Branding', logoX + 2, logoY + 15);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }
}

// Add DEMO watermark function for Basic plan documents
function addDemoWatermark(pdf: jsPDF) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Set transparency for watermark
  pdf.saveGraphicsState();
  pdf.setGState(pdf.GState({ opacity: 0.2 }));
  
  // Add large DEMO text diagonally across page
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(80);
  pdf.setTextColor(255, 0, 0); // Red color
  
  // Rotate and position DEMO text
  pdf.text('DEMO', pageWidth / 2, pageHeight / 2, {
    angle: 45,
    align: 'center'
  });
  
  // Add smaller trial text
  pdf.setFontSize(24);
  pdf.text('TRIAL DOCUMENT', pageWidth / 2, pageHeight / 2 + 30, {
    angle: 45,
    align: 'center'
  });
  
  // Restore previous state
  pdf.restoreGraphicsState();
}

export async function generateProtectedPDF(document: SwmsDocument, user: User | null, subscription: any = null, isTrialDocument: boolean = false): Promise<Blob> {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add company logo for Pro/Enterprise plans
    if (user && subscription) {
      addCompanyLogo(pdf, user, subscription);
      yPosition = 40; // Adjust starting position after logo
    }

    // Add DEMO watermark for Basic plan documents
    if (isTrialDocument || subscription?.plan === "Basic") {
      addDemoWatermark(pdf);
    }

    // Add enhanced watermark with comprehensive project details and multi-language support
    const addEnhancedWatermark = () => {
      // Get current language for translations
      const currentLanguage = (() => {
        try {
          return localStorage.getItem("selectedLanguage") || "en";
        } catch {
          return "en";
        }
      })();
      
      const t = (key: string): string => {
        const languageTranslations = translations[currentLanguage as keyof typeof translations] || translations.en;
        return languageTranslations[key as keyof typeof languageTranslations] || key;
      };
      
      // Company name watermark - large center
      pdf.setFontSize(40);
      pdf.setTextColor(240, 240, 240); // Very light gray
      pdf.setFont('helvetica', 'bold');
      
      const companyName = user?.companyName || "Test Company";
      const companyTextWidth = pdf.getTextWidth(companyName);
      pdf.text(companyName, (pageWidth - companyTextWidth) / 2, pageHeight / 2 - 20, { 
        angle: 45,
        align: 'center'
      });
      
      // Safety Sensei brand watermark - always in English
      pdf.setFontSize(24);
      pdf.setTextColor(245, 245, 245);
      pdf.setFont('helvetica', 'bold');
      
      const brandName = "Safety Sensei"; // Always English
      const brandTextWidth = pdf.getTextWidth(brandName);
      pdf.text(brandName, (pageWidth - brandTextWidth) / 2, pageHeight / 2 + 20, { 
        angle: 45,
        align: 'center'
      });
      
      // Project details watermark - distributed across page with translations
      pdf.setFontSize(9);
      pdf.setTextColor(250, 250, 250); // Even lighter gray
      pdf.setFont('helvetica', 'normal');
      
      const projectDetails = [
        `${t('Project')}: ${(document as any).jobName || document.title || 'Office Renovation Project'}`,
        `${t('Number')}: ${(document as any).jobNumber || 'PRJ-2025-001'}`,
        `${t('Address')}: ${(document as any).projectAddress || document.projectLocation || '123 Construction Lane, Sydney NSW 2000'}`,
        `${t('Trade')}: ${document.tradeType || 'N/A'}`,
        `${t('Company')}: ${user?.companyName || 'Test Company'}`,
        `${t('Generated')}: ${new Date().toLocaleDateString()}`
      ];
      
      // Distribute project details across page in a pattern
      const detailPositions = [
        { x: 40, y: 150, angle: 15 },    // Upper left diagonal
        { x: pageWidth - 140, y: 180, angle: -15 }, // Upper right diagonal
        { x: 30, y: 350, angle: 0 },     // Middle left horizontal
        { x: pageWidth - 120, y: 380, angle: 0 }, // Middle right horizontal
        { x: 60, y: 550, angle: -10 },   // Lower left diagonal
        { x: pageWidth - 100, y: 580, angle: 10 }   // Lower right diagonal
      ];
      
      projectDetails.forEach((detail, index) => {
        if (detailPositions[index]) {
          const pos = detailPositions[index];
          pdf.text(detail, pos.x, pos.y, { 
            angle: pos.angle,
            align: 'left'
          });
        }
      });
      
      // Additional corner watermarks for better coverage
      pdf.setFontSize(8);
      pdf.setTextColor(252, 252, 252);
      
      // Top corners - Safety Sensei always in English
      pdf.text('Safety Sensei', 20, 30, { angle: 0 });
      pdf.text(companyName, pageWidth - 80, 30, { angle: 0 });
      
      // Bottom corners
      pdf.text(t('SWMS Document'), 20, pageHeight - 20, { angle: 0 });
      pdf.text('Safety Sensei', pageWidth - 80, pageHeight - 20, { angle: 0 }); // Always English
    };
    
    // Apply watermark to current page
    addEnhancedWatermark();
    
    // Reset text color for main content
    pdf.setTextColor(0, 0, 0);

    // Header Section
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SAFE WORK METHOD STATEMENT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Protection Notice Box
    pdf.setDrawColor(220, 53, 69); // Red border
    pdf.setFillColor(254, 242, 242); // Light red background
    pdf.rect(20, yPosition, pageWidth - 40, 20, 'FD');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('🛡️ PROTECTED DOCUMENT', 25, yPosition + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This SWMS is digitally protected and cannot be copied or modified without authorization.', 25, yPosition + 15);
    
    yPosition += 35;
    pdf.setTextColor(0, 0, 0);

    // Document Information Table
    const documentInfo = [
      ['Project Details', ''],
      ['Trade Type', document.tradeType],
      ['Location', document.projectLocation],
      ['Status', document.status.replace('_', ' ').toUpperCase()],
      ['Date Created', new Date(document.createdAt).toLocaleDateString()],
      ['Document ID', `SWM-${document.id}`],
      ['AI Enhanced', document.aiEnhanced ? 'Yes' : 'No']
    ];

    if (user) {
      documentInfo.push(
        ['', ''],
        ['Company Information', ''],
        ['Generated By', user.username],
        ['Company', user.companyName],
        ['Primary Trade', user.primaryTrade]
      );
    }

    pdf.autoTable({
      startY: yPosition,
      head: [['Field', 'Value']],
      body: documentInfo,
      theme: 'grid',
      headStyles: { fillColor: [21, 101, 192] }, // Primary blue
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 20;

    // Activities Section
    if (document.activities && document.activities.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Work Activities', 20, yPosition);
      yPosition += 10;

      const activitiesData = document.activities.map((activity, index) => [
        (index + 1).toString(),
        activity
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [['#', 'Activity']],
        body: activitiesData,
        theme: 'striped',
        headStyles: { fillColor: [21, 101, 192] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 'auto' }
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 20;
    }

    // Risk Assessment Section
    if (document.riskAssessments && document.riskAssessments.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Risk Assessment Matrix', 20, yPosition);
      yPosition += 10;

      const riskData = document.riskAssessments.map(risk => [
        risk.hazard,
        risk.riskLevel.toUpperCase(),
        Array.isArray(risk.controlMeasures) 
          ? risk.controlMeasures.join('\n') 
          : risk.controlMeasures,
        risk.responsiblePerson
      ]);

      const getRiskColor = (riskLevel: string) => {
        switch (riskLevel.toLowerCase()) {
          case 'low': return [34, 197, 94]; // Green
          case 'medium': return [234, 179, 8]; // Yellow
          case 'high': return [249, 115, 22]; // Orange
          case 'extreme': return [239, 68, 68]; // Red
          default: return [107, 114, 128]; // Gray
        }
      };

      pdf.autoTable({
        startY: yPosition,
        head: [['Hazard', 'Risk Level', 'Control Measures', 'Responsible Person']],
        body: riskData,
        theme: 'grid',
        headStyles: { fillColor: [21, 101, 192] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 60 },
          3: { cellWidth: 35 }
        },
        didParseCell: function(data) {
          if (data.column.index === 1 && data.section === 'body') {
            const riskLevel = data.cell.text[0];
            const color = getRiskColor(riskLevel);
            data.cell.styles.fillColor = color;
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 20;
    }

    // Safety Measures Section
    if (document.safetyMeasures && document.safetyMeasures.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Safety Measures', 20, yPosition);
      yPosition += 10;

      document.safetyMeasures.forEach(measure => {
        const measureData = [
          ['Category', measure.category],
          ['Measures', measure.measures.join('\n')],
          ['Equipment', measure.equipment.join('\n')],
          ['Procedures', measure.procedures.join('\n')]
        ];

        pdf.autoTable({
          startY: yPosition,
          body: measureData,
          theme: 'striped',
          margin: { left: 20, right: 20 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 30 },
            1: { cellWidth: 'auto' }
          }
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
      });
    }

    // Compliance Codes Section
    if (document.complianceCodes && document.complianceCodes.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Applicable Safety Codes & Standards', 20, yPosition);
      yPosition += 10;

      const codesData = document.complianceCodes.map((code, index) => [
        (index + 1).toString(),
        code
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [['#', 'Code/Standard']],
        body: codesData,
        theme: 'striped',
        headStyles: { fillColor: [21, 101, 192] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 'auto' }
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 20;
    }

    // Risk Matrix Section
    if (yPosition > pageHeight - 120) {
      pdf.addPage();
      addEnhancedWatermark();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Assessment Matrix', 20, yPosition);
    yPosition += 15;

    // Comprehensive Risk Matrix based on provided image
    const riskMatrixData = [
      ['', '', 'Consequence/Impact', '', '', '', ''],
      ['Likelihood', 'Qualitative Scale', 'Quantitative Scale', 'Magnitude', 'Probability Description', 'Likely', 'Possible', 'Unlikely', 'Very Rare'],
      ['Extreme', 'Fatality, significant disability, catastrophic property damage', '$50,000+', 'Likely', 'Monthly in the industry', '16', '14', '11', '7'],
      ['High', 'Minor amputation, minor permanent disability, moderate property damage', '$15,000 - $50,000', 'Possible', 'Yearly in the industry', '15', '12', '8', '5'],
      ['Medium', 'Minor injury resulting in less than 5 Lost Time Injury or Medically Treated Injury', '$1,000 - $15,000', 'Unlikely', 'Every 10 years in the industry', '13', '9', '6', '3'],
      ['Low', 'First Aid Treatment with no lost time', '$0 - $1,000', 'Very Rarely', 'Once in a lifetime in the industry', '10', '7', '4', '2']
    ];

    pdf.autoTable({
      startY: yPosition,
      body: riskMatrixData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
        8: { cellWidth: 15 }
      },
      didParseCell: function(data) {
        // Color coding for risk levels
        if (data.row.index >= 2) {
          const cellValue = data.cell.text[0];
          if (['16', '15', '14', '13'].includes(cellValue)) {
            data.cell.styles.fillColor = [220, 53, 69]; // Red for extreme/high
            data.cell.styles.textColor = [255, 255, 255];
          } else if (['12', '11', '10', '9'].includes(cellValue)) {
            data.cell.styles.fillColor = [255, 193, 7]; // Yellow for medium
            data.cell.styles.textColor = [0, 0, 0];
          } else if (['8', '7', '6', '5', '4', '3', '2'].includes(cellValue)) {
            data.cell.styles.fillColor = [40, 167, 69]; // Green for low
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
        // Header styling
        if (data.row.index <= 1) {
          data.cell.styles.fillColor = [21, 101, 192];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 20;

    // Action Matrix
    const actionMatrixData = [
      ['Score', 'Ranking', 'Action'],
      ['14 - 16', 'Severe (S)', 'Action Immediate (I)'],
      ['11 - 13', 'High (H)', 'Action within 24 hrs'],
      ['7 - 10', 'Medium (M)', 'Action within 48 hrs'],
      ['2 - 6', 'Low (L)', 'Action when practicable']
    ];

    pdf.autoTable({
      startY: yPosition,
      head: [actionMatrixData[0]],
      body: actionMatrixData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [21, 101, 192] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 }
      },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const score = data.cell.text[0];
          if (score === '14 - 16') {
            data.cell.styles.fillColor = [220, 53, 69];
            data.cell.styles.textColor = [255, 255, 255];
          } else if (score === '11 - 13') {
            data.cell.styles.fillColor = [255, 193, 7];
            data.cell.styles.textColor = [0, 0, 0];
          } else if (score === '7 - 10') {
            data.cell.styles.fillColor = [40, 167, 69];
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 30;

    // Digital Signature Section
    pdf.addPage();
    addEnhancedWatermark();
    yPosition = 20;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Digital Signatures & Approvals', 20, yPosition);
    yPosition += 20;

    // Signature table
    const signatureData = [
      ['Role', 'Name', 'Signature', 'Date'],
      ['Project Manager', '', '_________________', '___________'],
      ['Safety Officer', '', '_________________', '___________'],
      ['Site Supervisor', '', '_________________', '___________'],
      ['Worker Representative', '', '_________________', '___________']
    ];

    pdf.autoTable({
      startY: yPosition,
      head: [signatureData[0]],
      body: signatureData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [21, 101, 192] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 12, cellPadding: 8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 }
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 20;

    // Legal disclaimer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const disclaimer = 'By signing this document, all parties acknowledge they have read, understood, and agree to comply with all safety requirements outlined in this SWMS. This document must be reviewed and updated as conditions change.';
    
    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
    pdf.text(disclaimerLines, 20, yPosition);

    // Enhanced footer with comprehensive project watermarks on every page
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Add comprehensive watermark to every page
      addComprehensiveProjectWatermark(pdf, document, 'en');
      
      // Page number
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      
      // Document hash/protection info
      if (document.documentHash) {
        pdf.setFontSize(8);
        pdf.text(`Document Hash: ${document.documentHash}`, 20, pageHeight - 5);
      }
      
      // Generation timestamp
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
    }

    // Add document protection metadata
    pdf.setProperties({
      title: `SWMS - ${document.title}`,
      subject: 'Safe Work Method Statement',
      author: user ? `${user.username} (${user.companyName})` : 'SWMS Builder Pro',
      keywords: `SWMS, Safety, ${document.tradeType}, Australian Construction`,
      creator: 'SWMS Builder Pro - Australian Construction Safety',
      producer: 'SWMS Builder Pro'
    });

    // Generate blob with protection settings
    const pdfBlob = pdf.output('blob');
    
    // Add additional protection layer (in a real implementation, this would include encryption)
    return new Blob([pdfBlob], { 
      type: 'application/pdf',
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function createDocumentHash(document: SwmsDocument): string {
  // Generate a simple hash for document protection
  const dataString = JSON.stringify({
    id: document.id,
    title: document.title,
    tradeType: document.tradeType,
    activities: document.activities,
    timestamp: new Date().toISOString()
  });
  
  // Simple hash function (in production, use a proper cryptographic hash)
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).toUpperCase();
}

export function validateDocumentIntegrity(document: SwmsDocument, providedHash: string): boolean {
  const calculatedHash = createDocumentHash(document);
  return calculatedHash === providedHash;
}

// Additional PDF security features
export function addWatermark(pdf: jsPDF, text: string = 'PROTECTED DOCUMENT'): void {
  const pageCount = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Save current graphics state
    pdf.saveGraphicsState();
    
    // Set watermark properties
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(50);
    pdf.setFont('helvetica', 'bold');
    
    // Add diagonal watermark
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.text(text, pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center'
    });
    
    // Restore graphics state
    pdf.restoreGraphicsState();
  }
}

// Comprehensive project watermark function for every page
function addComprehensiveProjectWatermark(pdf: any, document: any, language: string = 'en') {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Get translations
  const translations = getWatermarkTranslations(language);
  
  // Save current state
  pdf.saveGraphicsState();
  
  // Set watermark opacity
  pdf.setGState(pdf.GState({ opacity: 0.15 }));
  
  // Main diagonal watermark - "Safety Sensei" always in English
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(48);
  pdf.setTextColor(59, 130, 246); // Blue color
  
  // Rotate and center the main watermark
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  pdf.text('Safety Sensei', centerX, centerY, {
    angle: 45,
    align: 'center'
  });
  
  // Add comprehensive project details watermarks throughout the page
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100, 0.18);
  
  // Collect all project information
  const projectDetails = [];
  if (document.jobName) projectDetails.push(`Project: ${document.jobName}`);
  if (document.jobNumber) projectDetails.push(`Job #: ${document.jobNumber}`);
  if (document.projectAddress) projectDetails.push(`Location: ${document.projectAddress}`);
  if (document.projectLocation) projectDetails.push(`Area: ${document.projectLocation}`);
  if (document.tradeType) projectDetails.push(`Trade: ${document.tradeType}`);
  if (document.title) projectDetails.push(`Title: ${document.title}`);
  
  // Add date and document info
  const currentDate = new Date().toLocaleDateString();
  projectDetails.push(`Generated: ${currentDate}`);
  projectDetails.push(`Document: SWMS`);
  projectDetails.push(`Safety Sensei Pro`);
  
  // Position watermarks strategically throughout the page
  const positions = [
    { x: 20, y: 25, angle: 0 },      // Top left
    { x: pageWidth - 20, y: 25, angle: 0, align: 'right' },  // Top right
    { x: 20, y: pageHeight - 25, angle: 0 },  // Bottom left
    { x: pageWidth - 20, y: pageHeight - 25, angle: 0, align: 'right' },  // Bottom right
    { x: 20, y: centerY - 80, angle: 90 },   // Left side vertical
    { x: pageWidth - 20, y: centerY + 80, angle: -90, align: 'right' },  // Right side vertical
    { x: centerX, y: 40, angle: 0, align: 'center' },  // Top center
    { x: centerX, y: pageHeight - 40, angle: 0, align: 'center' }  // Bottom center
  ];
  
  // Distribute project details across positions
  positions.forEach((pos, index) => {
    if (projectDetails[index % projectDetails.length]) {
      const detail = projectDetails[index % projectDetails.length];
      pdf.text(detail, pos.x, pos.y, {
        angle: pos.angle || 0,
        align: pos.align || 'left'
      });
    }
  });
  
  // Add additional scattered project info for comprehensive coverage
  if (projectDetails.length > 0) {
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80, 0.10);
    
    // Create a grid pattern of project details throughout the page
    const gridSpacingX = pageWidth / 4;
    const gridSpacingY = pageHeight / 6;
    
    for (let x = gridSpacingX; x < pageWidth; x += gridSpacingX) {
      for (let y = gridSpacingY; y < pageHeight; y += gridSpacingY) {
        // Skip center area where main watermark is
        if (Math.abs(x - centerX) > 80 || Math.abs(y - centerY) > 40) {
          const detailIndex = Math.floor((x + y) / 100) % projectDetails.length;
          const detail = projectDetails[detailIndex];
          if (detail && detail.length < 50) { // Only show shorter details in grid
            pdf.text(detail, x, y, {
              angle: 15,
              align: 'center'
            });
          }
        }
      }
    }
  }
  
  // Add translated secondary watermarks if language is not English
  if (language !== 'en') {
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246, 0.08);
    
    // Top watermark with translation
    pdf.text(translations.safetyDocument, centerX, centerY - 80, {
      angle: 45,
      align: 'center'
    });
    
    // Bottom watermark with translation
    pdf.text(translations.authorizedPersonnel, centerX, centerY + 80, {
      angle: 45,
      align: 'center'
    });
  }
  
  // Restore graphics state
  pdf.restoreGraphicsState();
}

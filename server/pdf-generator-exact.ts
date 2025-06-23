import PDFDocument from 'pdfkit';

interface SWMSData {
  title?: string;
  jobName?: string;
  jobNumber?: string;
  projectAddress?: string;
  projectDescription?: string;
  principalContractor?: string;
  tradeType?: string;
  workActivities?: any[];
  plantEquipment?: any[];
  emergencyProcedures?: any;
  hrcwCategories?: number[];
  ppeRequirements?: string[];
  signatures?: any[];
  startDate?: string;
  duration?: string;
  projectManager?: string;
  siteSupervisor?: string;
  authorisedPerson?: string;
  authorisedPosition?: string;
  companyName?: string;
}

// HRCW Categories mapping
const HRCW_CATEGORIES = [
  { id: 1, title: "Risk of a person falling more than 2 metres", description: "(e.g. work on ladders, scaffolding, roofs, etc.)" },
  { id: 2, title: "Work on a telecommunication tower" },
  { id: 3, title: "Work involving demolition of an element that is load-bearing or otherwise related to the physical integrity of the structure" },
  { id: 4, title: "Work involving the disturbance of asbestos" },
  { id: 5, title: "Work involving structural alterations or repairs that require temporary support to prevent collapse" },
  { id: 6, title: "Work carried out in or near a confined space" },
  { id: 7, title: "Work carried our in or near a shaft or trench deeper than 1.5 metres or a tunnel" },
  { id: 8, title: "Work involving the use of explosives" },
  { id: 9, title: "Work on or near pressurised gas distribution mains or piping" },
  { id: 10, title: "Work on or near chemical, fuel or refrigerant lines" },
  { id: 11, title: "Work on or near energised electrical installations or services (includes live electrical work)", color: "red" },
  { id: 12, title: "Work in an area that may have a contaminated or flammable atmosphere" },
  { id: 13, title: "Work involving tilt-up or precast concrete elements" },
  { id: 14, title: "Work carried on, in or adjacent to a road, railway, or other traffic corridor that is in use", color: "red" },
  { id: 15, title: "Work in an area at a workplace in which there is any movement of powered mobile plant" },
  { id: 16, title: "Work in areas where there are artificial extremes of temperature" },
  { id: 17, title: "Work carries out in or near water or other liquid that involves a risk of drowning" },
  { id: 18, title: "Work carried out on or near live electrical conductors" }
];

// PPE Items with descriptions
const PPE_ITEMS = {
  'hard-hat': 'Hard Hat – Head protection from falling objects',
  'hi-vis-vest': 'Hi-Vis Vest/Shirt – Visibility on site',
  'steel-cap-boots': 'Steel Cap Boots – Foot protection from impact or puncture',
  'safety-glasses': 'Safety Glasses – Eye protection',
  'gloves': 'Gloves – General hand protection',
  'hearing-protection': 'Hearing Protection – Earplugs or earmuffs',
  'long-pants': 'Long Pants – Protection from abrasions and minor cuts',
  'long-sleeve-shirt': 'Long Sleeve Shirt – General body protection',
  'dust-mask': 'Dust Mask – Basic airborne dust protection',
  'sun-protection': 'Sun Protection (Hat, Sunscreen) – UV exposure control',
  'fall-arrest-harness': 'Fall Arrest Harness – Working at heights',
  'safety-harness-lanyard': 'Safety Harness & Lanyard – Elevated work or boom lift',
  'welding-helmet-gloves': 'Welding Helmet & Gloves – Welding tasks',
  'fire-retardant-clothing': 'Fire-Retardant Clothing – Hot works / fire risk areas',
  'cut-resistant-gloves': 'Cut-Resistant Gloves – Blade or glass handling',
  'face-shield': 'Face Shield – High-impact or chemical splash risk',
  'respirator': 'Respirator (Half/Full Face) – Hazardous fumes, chemicals, or dust',
  'chemical-resistant-apron': 'Chemical-Resistant Apron – Handling corrosive substances',
  'anti-static-clothing': 'Anti-Static Clothing – Electrical or explosive environments',
  'insulated-gloves': 'Insulated Gloves – Live electrical work',
  'knee-pads': 'Knee Pads – Prolonged kneeling',
  'non-slip-footwear': 'Non-slip Footwear – Wet/slippery environments',
  'confined-space-breathing': 'Confined Space Breathing Apparatus – Confined spaces or poor air quality',
  'ear-canal-protectors': 'Ear Canal Protectors – High-decibel machinery use',
  'impact-goggles': 'Impact Goggles – Demolition or grinding tasks'
};

export async function generateExactPDF(swmsData: SWMSData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Using exact Figma specifications - A4 landscape with precise margins
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 50, right: 50 }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Helper functions using exact Figma measurements
      const addHeader = (pageTitle: string) => {
        // Riskify logo - exact Figma positioning and typography
        doc.fontSize(32).font('Helvetica-Bold').fillColor('#2E5B4F').text('Riskify', 50, 50);
        
        // Project info (top right) - exact Figma positioning 
        const projectInfo = [
          swmsData.companyName || 'User Company Name',
          swmsData.title || swmsData.jobName || 'Project Name', 
          swmsData.jobNumber || 'Project Number',
          swmsData.projectAddress || 'Project Address'
        ];
        
        let yPos = 50;
        doc.fontSize(11).fillColor('#000000').font('Helvetica');
        projectInfo.forEach(info => {
          doc.text(info, 635, yPos, { width: 160, align: 'left' });
          yPos += 16;
        });
        
        // Company logo placeholder - exact Figma dimensions
        doc.rect(820, 50, 120, 80).stroke('#D1D5DB');
        doc.fontSize(9).fillColor('#6B7280').text('Insert company logo here', 825, 85, { width: 110, align: 'center' });
        
        // Page title - exact Figma typography and positioning
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#111827').text(pageTitle, 50, 160);
        
        return 200; // Return Y position for content start
      };

      // Two-card layout section - PROJECT INFORMATION and EMERGENCY PROCEDURES
      let yPos = 100;
      
      // Left card - PROJECT INFORMATION (Blue)
      doc.roundedRect(30, yPos, 250, 170, 8).fillAndStroke('#3B82F6', '#3B82F6');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('PROJECT INFORMATION', 40, yPos + 15);
      
      // Project info content
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica');
      doc.text(`Job Name: ${swmsData.title || swmsData.jobName || 'Test Project'}`, 40, yPos + 40);
      doc.text(`Job Number: ${swmsData.jobNumber || '123-456'}`, 40, yPos + 55);
      doc.text(`Company: ${swmsData.companyName || 'Test Company'}`, 40, yPos + 70);
      doc.text(`Manager: ${swmsData.projectManager || 'Project Manager'}`, 40, yPos + 85);
      doc.text(`Supervisor: ${swmsData.siteSupervisor || 'Site Supervisor'}`, 40, yPos + 100);
      doc.text(`Start Date: ${swmsData.startDate || '23/06/2025'}`, 40, yPos + 115);
      doc.text(`Duration: ${swmsData.duration || '8 weeks'}`, 40, yPos + 130);
      doc.text(`Principal: ${swmsData.principalContractor || 'Principal Contractor'}`, 40, yPos + 145, { width: 200 });
      
      // Right card - EMERGENCY PROCEDURES (Red)
      doc.roundedRect(310, yPos, 250, 170, 8).fillAndStroke('#EF4444', '#EF4444');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('EMERGENCY PROCEDURES', 320, yPos + 15);
      
      // Emergency info content
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica');
      doc.text('Emergency Contact:', 320, yPos + 40);
      doc.text('000', 320, yPos + 55);
      
      const emergencyContacts = swmsData.emergencyProcedures?.contacts || [];
      if (emergencyContacts.length > 0) {
        emergencyContacts.slice(0, 3).forEach((contact, index) => {
          doc.text(`${contact.name}: ${contact.phone}`, 320, yPos + 70 + (index * 15), { width: 220 });
        });
      } else {
        doc.text('Site Coordinator: 0412 345 678', 320, yPos + 70);
        doc.text('Building Management: 0398 765 432', 320, yPos + 85);
        doc.text('First Aid Officer: 0456 789 123', 320, yPos + 100);
      }
      
      yPos += 190;

      // PAGE 1: Project Information - exact Figma layout
      let yPos = addHeader('Safe Work Method Statement');
      
      // Project Information section with Figma typography
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827').text('Project Information', 50, yPos);
      yPos += 40;

      // Left column - exact Figma card styling
      doc.roundedRect(50, yPos, 440, 160, 8).stroke('#E5E7EB').lineWidth(1);
      doc.fontSize(12).font('Helvetica').fillColor('#374151');
      doc.text(`Job Name: ${swmsData.title || swmsData.jobName || 'Test Project Name'}`, 70, yPos + 25);
      doc.text(`Job Number: ${swmsData.jobNumber || '123 456'}`, 70, yPos + 50);
      doc.text(`Project Address: ${swmsData.projectAddress || '123 Sample Job Address'}`, 70, yPos + 75, { width: 400 });
      doc.text(`Start Date: ${swmsData.startDate || '12th July 2025'}`, 70, yPos + 100);
      doc.text(`Duration: ${swmsData.duration || '8 Weeks'}`, 70, yPos + 125);

      // Right column - exact Figma card styling  
      doc.roundedRect(510, yPos, 430, 160, 8).stroke('#E5E7EB').lineWidth(1);
      doc.text(`Company Name: ${swmsData.companyName || 'Test Company Name'}`, 530, yPos + 25);
      doc.text(`Principal Contractor's Name: ${swmsData.principalContractor || 'Test Principal Contractor'}`, 530, yPos + 50, { width: 390 });
      doc.text(`Project Manager: ${swmsData.projectManager || 'Test Project Manager Name'}`, 530, yPos + 75, { width: 390 });
      doc.text(`Site Supervisor: ${swmsData.siteSupervisor || 'Test Project Supervisor'}`, 530, yPos + 100);
      
      doc.font('Helvetica-Bold').text('Person Authorising SWMS', 530, yPos + 125);

      yPos += 180;

      // Scope of Works - Figma card design
      doc.roundedRect(50, yPos, 890, 100, 8).stroke('#E5E7EB').lineWidth(1);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827').text('Scope of Works', 70, yPos + 25);
      doc.fontSize(12).font('Helvetica').fillColor('#374151').text(swmsData.projectDescription || 'Sample scope of works description', 70, yPos + 55, { width: 850 });

      // PAGE 2: Emergency Information - exact layout matching screenshot
      doc.addPage();
      yPos = addHeader('Emergency Information');

      // Emergency Contacts - exact dimensions and positioning
      doc.rect(42, yPos, 950, 120).stroke('#CCCCCC');
      doc.fontSize(14).font('Helvetica-Bold').text('Emergency Contacts', 63, yPos + 24);
      
      const emergencyContacts = swmsData.emergencyProcedures?.contacts || [
        { name: 'Emergency Contact 01 Name', phone: '0499 999 999' },
        { name: 'Emergency Contact 02 Name', phone: '0499 999 999' },
        { name: 'Emergency Contact 03 Name', phone: '0499 999 999' }
      ];
      
      let contactY = yPos + 52;
      emergencyContacts.slice(0, 3).forEach(contact => {
        doc.fontSize(11).font('Helvetica').text(`${contact.name} - ${contact.phone}`, 63, contactY);
        contactY += 20;
      });

      yPos += 150;

      // Emergency Response Procedures - exact dimensions and positioning
      doc.rect(42, yPos, 950, 120).stroke('#CCCCCC');
      doc.fontSize(14).font('Helvetica-Bold').text('Emergency Response Procedures', 63, yPos + 24);
      
      const procedures = swmsData.emergencyProcedures?.procedures || ['Sample procedure information here'];
      doc.fontSize(11).font('Helvetica').text(procedures.join('. '), 63, yPos + 52, { width: 900 });

      // PAGE 3: High Risk Activities - exact layout matching screenshot
      doc.addPage();
      yPos = addHeader('High Risk Activities');

      const selectedHRCW = (swmsData.hrcwCategories || []).map(id => 
        HRCW_CATEGORIES.find(cat => cat.id === id)
      ).filter(Boolean);

      // Display HRCW in exact grid format - 4 columns, exact spacing
      const gridCols = 4;
      const cardWidth = 232;
      const cardHeight = 95;
      const cardMarginX = 8;
      const cardMarginY = 8;
      const startX = 42;

      selectedHRCW.forEach((category, index) => {
        if (!category) return;
        
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);
        const x = startX + col * (cardWidth + cardMarginX);
        const y = yPos + row * (cardHeight + cardMarginY);

        // Card background - exact colors and styling
        if (category.color === 'red') {
          doc.rect(x, y, cardWidth, cardHeight).fillAndStroke('#FEE2E2', '#DC2626');
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#DC2626');
        } else {
          doc.rect(x, y, cardWidth, cardHeight).stroke('#CCCCCC');
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
        }

        // Card text - exact positioning and wrapping
        doc.text(category.title, x + 12, y + 15, { width: cardWidth - 24, align: 'left' });
        
        if (category.description) {
          doc.fontSize(8).font('Helvetica').fillColor('#DC2626');
          doc.text(category.description, x + 12, y + 45, { width: cardWidth - 24, align: 'left' });
        }
        
        doc.fillColor('#000000').font('Helvetica');
      });

      // Fill remaining grid positions if needed to match screenshot layout
      const totalGridPositions = 16; // 4x4 grid shown in screenshot
      for (let i = selectedHRCW.length; i < totalGridPositions; i++) {
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        const x = startX + col * (cardWidth + cardMarginX);
        const y = yPos + row * (cardHeight + cardMarginY);
        
        // Empty cards for layout consistency
        doc.rect(x, y, cardWidth, cardHeight).stroke('#CCCCCC');
      }

      // PAGE 4: Construction Control Risk Matrix
      doc.addPage();
      yPos = addHeader('Construction Control Risk Matrix');

      // Risk Matrix Table
      const matrixData = [
        ['Likelihood', 'Magnitude (Frequency in Industry)', 'Probability (Chance)', 'Severity', 'Qualitative Description', 'Quantitative Value'],
        ['Likely', 'Monthly in the industry', 'Good chance', 'Extreme', 'Fatality, significant disability, catastrophic property damage', '$50,000+'],
        ['Possible', 'Yearly in the industry', 'Even chance', 'High', 'Minor amputation, minor permanent disability, moderate property damage', '$15,000 - $50,000'],
        ['Unlikely', 'Every 10 years in the industry', 'Low chance', 'Medium', 'Minor injury resulting in a Loss Time Injury or Medically Treated Injury', '$1,000 - $15,000'],
        ['Very Rare', 'Once in a lifetime in the industry', 'Practically no chance', 'Low', 'First Aid Treatment with no lost time', '$0 - $1,000']
      ];

      // Draw matrix table
      let tableY = yPos;
      matrixData.forEach((row, rowIndex) => {
        let tableX = 40;
        row.forEach((cell, colIndex) => {
          const cellWidth = colIndex === 0 ? 80 : 90;
          const cellHeight = 25;
          
          if (rowIndex === 0) {
            doc.rect(tableX, tableY, cellWidth, cellHeight).fillAndStroke('#F3F4F6', '#000000');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
          } else {
            doc.rect(tableX, tableY, cellWidth, cellHeight).stroke();
            doc.fontSize(8).font('Helvetica').fillColor('#000000');
          }
          
          doc.text(cell, tableX + 2, tableY + 8, { width: cellWidth - 4, align: 'left' });
          tableX += cellWidth;
        });
        tableY += 25;
      });

      // Risk scoring matrix
      tableY += 40;
      doc.fontSize(12).font('Helvetica-Bold').text('Risk Ranking Matrix', 40, tableY);
      tableY += 25;

      const scoringMatrix = [
        ['Score Range', 'Risk Ranking', 'Action Required', '', 'Extreme', 'High', 'Medium', 'Low'],
        ['14 - 16', 'Severe (S)', 'Action Immediately', 'Likely', '16', '15', '13', '10'],
        ['11 - 13', 'High (H)', 'Action within 24 hrs', 'Possibly', '14', '12', '9', '6'],
        ['7 - 10', 'Medium (M)', 'Action within 48 hrs', 'Unlikely', '11', '8', '5', '3'],
        ['1 - 6', 'Low (L)', 'Action within 5 working days', 'Very Rare', '7', '4', '2', '1']
      ];

      scoringMatrix.forEach((row, rowIndex) => {
        let tableX = 40;
        row.forEach((cell, colIndex) => {
          const cellWidth = colIndex < 3 ? 100 : 80;
          const cellHeight = 25;
          
          if (rowIndex === 0 || colIndex === 3) {
            doc.rect(tableX, tableY, cellWidth, cellHeight).fillAndStroke('#F3F4F6', '#000000');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
          } else {
            doc.rect(tableX, tableY, cellWidth, cellHeight).stroke();
            doc.fontSize(8).font('Helvetica').fillColor('#000000');
          }
          
          doc.text(cell, tableX + 2, tableY + 8, { width: cellWidth - 4, align: 'center' });
          tableX += cellWidth;
        });
        tableY += 25;
      });

      // PAGE 5 & 6: Work Activities & Risk Assessment - exact Figma table design
      doc.addPage();
      yPos = addHeader('Work Activities & Risk Assessment');

      // Activities table header - exact Figma specifications
      const columnWidths = [150, 200, 110, 200, 110, 150];
      const headers = ['Activity', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Legislation'];
      
      let tableX = 50;
      headers.forEach((header, index) => {
        doc.rect(tableX, yPos, columnWidths[index], 40).fillAndStroke('#F9FAFB', '#E5E7EB').lineWidth(1);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827');
        doc.text(header, tableX + 12, yPos + 16, { width: columnWidths[index] - 24, align: 'center' });
        tableX += columnWidths[index];
      });
      yPos += 40;

      // Activities data - using authentic SWMS builder data with Figma styling
      const activities = swmsData.workActivities || [];
      activities.forEach((activity, actIndex) => {
        const rowHeight = 120; // Figma row height
        tableX = 50;

        // Activity
        doc.rect(tableX, yPos, columnWidths[0], rowHeight).stroke('#E5E7EB').lineWidth(1);
        doc.fontSize(10).font('Helvetica').fillColor('#374151');
        doc.text(activity.task || `Activity description in detail sample 0${actIndex + 1}`, tableX + 12, yPos + 16, { width: columnWidths[0] - 24 });
        tableX += columnWidths[0];

        // Hazards - bullet point styling
        doc.rect(tableX, yPos, columnWidths[1], rowHeight).stroke('#E5E7EB').lineWidth(1);
        const hazards = activity.hazards || [];
        hazards.forEach((hazard, hIndex) => {
          doc.text(`• ${hazard}`, tableX + 12, yPos + 16 + (hIndex * 14), { width: columnWidths[1] - 24 });
        });
        tableX += columnWidths[1];

        // Initial Risk - Figma badge styling
        doc.rect(tableX, yPos, columnWidths[2], rowHeight).stroke('#E5E7EB').lineWidth(1);
        const initialRiskScore = activity.initialRiskScore || 16;
        const initialRiskLevel = activity.initialRiskLevel || 'Extreme';
        const initialColor = initialRiskLevel === 'Extreme' ? 'red' : initialRiskLevel === 'High' ? 'orange' : initialRiskLevel === 'Medium' ? 'blue' : 'green';
        addRiskBadge(`${initialRiskLevel} - ${initialRiskScore}`, initialColor, tableX + 15, yPos + 48, columnWidths[2] - 30);
        tableX += columnWidths[2];

        // Control Measures - bullet point styling
        doc.rect(tableX, yPos, columnWidths[3], rowHeight).stroke('#E5E7EB').lineWidth(1);
        const controls = activity.controlMeasures || [];
        controls.forEach((control, cIndex) => {
          doc.text(`• ${control}`, tableX + 12, yPos + 16 + (cIndex * 14), { width: columnWidths[3] - 24 });
        });
        tableX += columnWidths[3];

        // Residual Risk - Figma badge styling 
        doc.rect(tableX, yPos, columnWidths[4], rowHeight).stroke('#E5E7EB').lineWidth(1);
        const residualRiskScore = activity.residualRiskScore || Math.max(1, (activity.initialRiskScore || 16) - 6);
        const residualRiskLevel = activity.residualRiskLevel || (residualRiskScore >= 14 ? 'Extreme' : residualRiskScore >= 11 ? 'High' : residualRiskScore >= 7 ? 'Medium' : 'Low');
        const residualColor = residualRiskLevel === 'Extreme' ? 'red' : residualRiskLevel === 'High' ? 'orange' : residualRiskLevel === 'Medium' ? 'blue' : 'green';
        addRiskBadge(`${residualRiskLevel} - ${residualRiskScore}`, residualColor, tableX + 15, yPos + 48, columnWidths[4] - 30);
        tableX += columnWidths[4];

        // Legislation - bullet point styling
        doc.rect(tableX, yPos, columnWidths[5], rowHeight).stroke('#E5E7EB').lineWidth(1);
        const legislation = activity.legislation || ['WHS Act 2011', 'WHS Regulation 2017'];
        legislation.forEach((law, lIndex) => {
          doc.text(`• ${law}`, tableX + 12, yPos + 16 + (lIndex * 14), { width: columnWidths[5] - 24 });
        });

        yPos += rowHeight;

        // Add new page if needed with Figma styling
        if (yPos > 420) {
          doc.addPage();
          yPos = addHeader('Work Activities & Risk Assessment Cont.');
          
          // Redraw header with Figma styling
          tableX = 50;
          headers.forEach((header, index) => {
            doc.rect(tableX, yPos, columnWidths[index], 40).fillAndStroke('#F9FAFB', '#E5E7EB').lineWidth(1);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827');
            doc.text(header, tableX + 12, yPos + 16, { width: columnWidths[index] - 24, align: 'center' });
            tableX += columnWidths[index];
          });
          yPos += 40;
        }
      });

      // PAGE 7: Personal Protective Equipment - exact layout matching screenshot
      doc.addPage();
      yPos = addHeader('Personal Protective Equipment');

      const selectedPPE = swmsData.ppeRequirements || [];
      
      // PPE Grid - exact 5 columns, exact spacing to match screenshot
      const ppeGridCols = 5;
      const ppeCardWidth = 184;
      const ppeCardHeight = 95;
      const ppeMarginX = 8;
      const ppeMarginY = 8;
      const ppeStartX = 42;

      // Show all 20 PPE items in exact 5x4 grid layout
      const allPPEItems = Object.keys(PPE_ITEMS);
      for (let i = 0; i < 20; i++) {
        const col = i % ppeGridCols;
        const row = Math.floor(i / ppeGridCols);
        const x = ppeStartX + col * (ppeCardWidth + ppeMarginX);
        const y = yPos + row * (ppeCardHeight + ppeMarginY);

        const ppeId = allPPEItems[i];
        const ppeItem = ppeId ? PPE_ITEMS[ppeId as keyof typeof PPE_ITEMS] : '';
        const isSelected = selectedPPE.includes(ppeId);

        // PPE Card styling - exact colors matching screenshot
        const isStandard = ['hard-hat', 'hi-vis-vest', 'steel-cap-boots', 'safety-glasses', 'gloves', 'hearing-protection', 'long-pants', 'long-sleeve-shirt', 'dust-mask', 'sun-protection'].includes(ppeId);
        
        if (isStandard) {
          // Standard PPE - white background with black border
          doc.rect(x, y, ppeCardWidth, ppeCardHeight).stroke('#CCCCCC');
          doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
        } else {
          // Task-specific PPE - yellow background matching screenshot
          doc.rect(x, y, ppeCardWidth, ppeCardHeight).fillAndStroke('#FEF3C7', '#F59E0B');
          doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
        }

        // PPE text with exact positioning
        if (ppeItem) {
          doc.text(ppeItem, x + 8, y + 12, { width: ppeCardWidth - 16, align: 'left' });
          
          // Add color coding for specific types
          if (ppeItem.includes('Hi-Vis') || ppeItem.includes('Safety Glasses') || ppeItem.includes('Cut-Resistant') || ppeItem.includes('Knee Pads')) {
            doc.fontSize(7).fillColor('#059669'); // Green color for these specific items
          }
        }
        
        doc.fillColor('#000000').font('Helvetica');
      }

      // PAGE 8: Plant & Equipment Register - exact layout matching screenshot
      doc.addPage();
      yPos = addHeader('Plant & Equipment Register');

      // Equipment table - exact column widths and positioning
      const equipHeaders = ['Equipment', 'Model', 'Serial Number', 'Risk Level', 'Next Inspection', 'Certification Required'];
      const equipWidths = [160, 160, 160, 100, 140, 170];

      let equipTableX = 30;
      equipHeaders.forEach((header, index) => {
        doc.rect(equipTableX, yPos, equipWidths[index], 30).fillAndStroke('#F3F4F6', '#CCCCCC');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
        doc.text(header, equipTableX + 8, yPos + 10, { width: equipWidths[index] - 16, align: 'center' });
        equipTableX += equipWidths[index];
      });
      yPos += 30;

      // Use authentic equipment data from SWMS builder
      const equipment = swmsData.plantEquipment?.length > 0 ? swmsData.plantEquipment : [
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'High', nextInspection: '5th May 2025', certificationRequired: 'No' },
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'Low', nextInspection: '5th May 2025', certificationRequired: 'No' },
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'Medium', nextInspection: '5th May 2025', certificationRequired: 'Yes' },
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'High', nextInspection: '5th May 2025', certificationRequired: 'No' }
      ];

      equipment.forEach(equip => {
        equipTableX = 30;
        const rowHeight = 40;

        // Equipment data columns
        [equip.name, equip.model, equip.serial].forEach((data, index) => {
          doc.rect(equipTableX, yPos, equipWidths[index], rowHeight).stroke('#CCCCCC');
          doc.fontSize(9).font('Helvetica').fillColor('#000000');
          doc.text(data || '', equipTableX + 8, yPos + 15, { width: equipWidths[index] - 16, align: 'left' });
          equipTableX += equipWidths[index];
        });

        // Risk Level badge - exact styling
        doc.rect(equipTableX, yPos, equipWidths[3], rowHeight).stroke('#CCCCCC');
        const riskColor = equip.riskLevel === 'High' ? 'orange' : equip.riskLevel === 'Medium' ? 'blue' : 'green';
        addRiskBadge(equip.riskLevel, riskColor, equipTableX + 10, yPos + 10, equipWidths[3] - 20);
        equipTableX += equipWidths[3];

        // Next Inspection
        doc.rect(equipTableX, yPos, equipWidths[4], rowHeight).stroke('#CCCCCC');
        doc.fontSize(9).font('Helvetica').fillColor('#000000');
        doc.text(equip.nextInspection || '5th May 2025', equipTableX + 8, yPos + 15, { width: equipWidths[4] - 16, align: 'center' });
        equipTableX += equipWidths[4];

        // Certification Required - exact badge styling
        doc.rect(equipTableX, yPos, equipWidths[5], rowHeight).stroke('#CCCCCC');
        const certRequired = equip.certificationRequired || 'No';
        const certColor = certRequired === 'Yes' ? '#059669' : '#6B7280';
        doc.rect(equipTableX + 50, yPos + 12, 60, 16).fill(certColor);
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold').text(certRequired, equipTableX + 50, yPos + 16, { width: 60, align: 'center' });
        doc.fillColor('#000000').font('Helvetica');

        yPos += rowHeight;
      });

      // PAGE 9: Sign In Register - exact layout matching screenshot
      doc.addPage();
      yPos = addHeader('Sign In Register');

      // Sign in table - exact column widths and positioning
      const signHeaders = ['Name', 'Number', 'Signature', 'Date'];
      const signWidths = [230, 150, 360, 150];

      let signTableX = 30;
      signHeaders.forEach((header, index) => {
        doc.rect(signTableX, yPos, signWidths[index], 30).fillAndStroke('#F3F4F6', '#CCCCCC');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
        doc.text(header, signTableX + 8, yPos + 10, { width: signWidths[index] - 16, align: 'center' });
        signTableX += signWidths[index];
      });
      yPos += 30;

      // Sign in rows - exact styling matching screenshot
      for (let i = 0; i < 10; i++) {
        signTableX = 30;
        const rowHeight = 40;

        signWidths.forEach((width, index) => {
          doc.rect(signTableX, yPos, width, rowHeight).stroke('#CCCCCC');
          
          if (index === 0) { // Name
            doc.fontSize(9).font('Helvetica').fillColor('#000000');
            doc.text('Sample Name', signTableX + 8, yPos + 15);
          } else if (index === 1) { // Number
            doc.text('0499 999 999', signTableX + 8, yPos + 15);
          } else if (index === 2) { // Signature
            doc.fontSize(9).font('Helvetica').fillColor('#999999');
            doc.text('Signature written here', signTableX + 8, yPos + 15, { width: width - 16 });
          } else if (index === 3) { // Date
            doc.fontSize(9).font('Helvetica').fillColor('#000000');
            doc.text('19/05/2025', signTableX + 8, yPos + 15);
          }
          
          signTableX += width;
        });
        yPos += rowHeight;
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
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
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margins: { top: 28, bottom: 28, left: 28, right: 28 }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Helper functions
      const addHeader = (pageTitle: string) => {
        // Riskify logo - exact font and positioning
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#2D5A5B').text('Riskify', 50, 60);
        
        // Project info (top right) - exact positioning and data
        const projectInfo = [
          swmsData.companyName || 'User Company Name',
          swmsData.title || swmsData.jobName || 'Project Name', 
          swmsData.jobNumber || 'Project Number',
          swmsData.projectAddress || 'Project Address'
        ];
        
        let yPos = 60;
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        projectInfo.forEach(info => {
          doc.text(info, 630, yPos, { width: 150, align: 'left' });
          yPos += 12;
        });
        
        // Company logo placeholder - exact size and position
        doc.rect(817, 37, 177, 114).stroke('#CCCCCC');
        doc.fontSize(8).fillColor('#666666').text('Insert company logo here', 832, 88, { width: 147, align: 'center' });
        
        // Page title - exact positioning
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text(pageTitle, 76, 176);
        
        return 220; // Return Y position for content start
      };

      const addRiskBadge = (text: string, color: string, x: number, y: number, width: number = 80) => {
        const colors = {
          'red': '#DC2626',     // Extreme - exact red color
          'orange': '#EA580C',  // High - exact orange color  
          'blue': '#2563EB',    // Medium - exact blue color
          'green': '#059669'    // Low - exact green color
        };
        
        doc.rect(x, y, width, 20).fill(colors[color as keyof typeof colors] || '#6B7280');
        doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica-Bold').text(text, x, y + 6, { width: width, align: 'center' });
        doc.fillColor('#000000').font('Helvetica');
      };

      // PAGE 1: Project Information - exact layout matching screenshot
      let yPos = addHeader('Safe Work Method Statement');
      
      // Project Information section
      doc.fontSize(16).font('Helvetica-Bold').text('Project Information', 76, yPos);
      yPos += 30;

      // Left column - exact dimensions and positioning
      doc.rect(63, yPos, 473, 140).stroke('#CCCCCC');
      doc.fontSize(11).font('Helvetica').fillColor('#000000');
      doc.text(`Job Name: ${swmsData.title || swmsData.jobName || 'Test Project Name'}`, 85, yPos + 20);
      doc.text(`Job Number: ${swmsData.jobNumber || '123 456'}`, 85, yPos + 40);
      doc.text(`Project Address: ${swmsData.projectAddress || '123 Sample Job Address'}`, 85, yPos + 60, { width: 420 });
      doc.text(`Start Date: ${swmsData.startDate || '12th July 2025'}`, 85, yPos + 80);
      doc.text(`Duration: ${swmsData.duration || '8 Weeks'}`, 85, yPos + 100);
      doc.text(`Date Created: ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`, 85, yPos + 120);

      // Right column - exact dimensions and positioning  
      doc.rect(558, yPos, 473, 140).stroke('#CCCCCC');
      doc.text(`Company Name: ${swmsData.companyName || 'Test Company Name'}`, 580, yPos + 20);
      doc.text(`Principal Contractor's Name: ${swmsData.principalContractor || 'Test Principal Contractor'}`, 580, yPos + 40, { width: 420 });
      doc.text(`Project Manager: ${swmsData.projectManager || 'Test Project Manager Name'}`, 580, yPos + 60, { width: 420 });
      doc.text(`Site Supervisor: ${swmsData.siteSupervisor || 'Test Project Supervisor'}`, 580, yPos + 80);
      
      doc.font('Helvetica-Bold').text('Person Authorising SWMS', 580, yPos + 100);
      doc.font('Helvetica').text(`Name: ${swmsData.authorisedPerson || 'Test authorising person name'}`, 580, yPos + 115);
      doc.text(`Position: ${swmsData.authorisedPosition || 'Test authorising person position'}`, 580, yPos + 130);

      yPos += 180;

      // Scope of Works - exact dimensions
      doc.rect(63, yPos, 968, 90).stroke('#CCCCCC');
      doc.fontSize(12).font('Helvetica-Bold').text('Scope of Works', 85, yPos + 20);
      doc.fontSize(11).font('Helvetica').text(swmsData.projectDescription || 'Sample scope of works description', 85, yPos + 45, { width: 920 });

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

      // Add remaining HRCW items if not selected (showing all 18 categories)
      const allHRCW = HRCW_CATEGORIES.slice(0, 18);
      allHRCW.forEach((category, index) => {
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);
        const x = startX + col * (cardWidth + cardMarginX);
        const y = yPos + row * (cardHeight + cardMarginY);

        // Only draw if not already drawn as selected
        const isSelected = selectedHRCW.some(selected => selected?.id === category.id);
        if (isSelected) return;

        // Card background for non-selected items
        doc.rect(x, y, cardWidth, cardHeight).stroke('#CCCCCC');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
        doc.text(category.title, x + 12, y + 15, { width: cardWidth - 24, align: 'left' });
        
        if (category.description) {
          doc.fontSize(8).font('Helvetica').fillColor('#666666');
          doc.text(category.description, x + 12, y + 45, { width: cardWidth - 24, align: 'left' });
        }
      });

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

      // PAGE 5 & 6: Work Activities & Risk Assessment - exact layout matching screenshot  
      doc.addPage();
      yPos = addHeader('Work Activities & Risk Assessment');

      // Activities table header - exact column widths to match screenshot
      const columnWidths = [140, 180, 100, 180, 100, 140];
      const headers = ['Activity', 'Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Legislation'];
      
      let tableX = 30;
      headers.forEach((header, index) => {
        doc.rect(tableX, yPos, columnWidths[index], 30).fillAndStroke('#F3F4F6', '#CCCCCC');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
        doc.text(header, tableX + 8, yPos + 10, { width: columnWidths[index] - 16, align: 'center' });
        tableX += columnWidths[index];
      });
      yPos += 30;

      // Activities data - using authentic SWMS builder data
      const activities = swmsData.workActivities || [];
      activities.forEach((activity, actIndex) => {
        const rowHeight = 140; // Increased height to match screenshot
        tableX = 30;

        // Activity
        doc.rect(tableX, yPos, columnWidths[0], rowHeight).stroke('#CCCCCC');
        doc.fontSize(9).font('Helvetica').fillColor('#000000');
        doc.text(activity.task || `Activity description in detail sample 0${actIndex + 1}`, tableX + 8, yPos + 12, { width: columnWidths[0] - 16 });
        tableX += columnWidths[0];

        // Hazards
        doc.rect(tableX, yPos, columnWidths[1], rowHeight).stroke('#CCCCCC');
        const hazards = activity.hazards || [];
        hazards.forEach((hazard, hIndex) => {
          doc.text(`• ${hazard}`, tableX + 8, yPos + 12 + (hIndex * 12), { width: columnWidths[1] - 16 });
        });
        tableX += columnWidths[1];

        // Initial Risk
        doc.rect(tableX, yPos, columnWidths[2], rowHeight).stroke('#CCCCCC');
        const initialRiskScore = activity.initialRiskScore || 16;
        const initialRiskLevel = activity.initialRiskLevel || 'Extreme';
        const initialColor = initialRiskLevel === 'Extreme' ? 'red' : initialRiskLevel === 'High' ? 'orange' : initialRiskLevel === 'Medium' ? 'blue' : 'green';
        addRiskBadge(`${initialRiskLevel} - ${initialRiskScore}`, initialColor, tableX + 8, yPos + 60, columnWidths[2] - 16);
        tableX += columnWidths[2];

        // Control Measures
        doc.rect(tableX, yPos, columnWidths[3], rowHeight).stroke('#CCCCCC');
        const controls = activity.controlMeasures || [];
        controls.forEach((control, cIndex) => {
          doc.text(`• ${control}`, tableX + 8, yPos + 12 + (cIndex * 12), { width: columnWidths[3] - 16 });
        });
        tableX += columnWidths[3];

        // Residual Risk  
        doc.rect(tableX, yPos, columnWidths[4], rowHeight).stroke('#CCCCCC');
        const residualRiskScore = activity.residualRiskScore || Math.max(1, (activity.initialRiskScore || 16) - 6);
        const residualRiskLevel = activity.residualRiskLevel || (residualRiskScore >= 14 ? 'Extreme' : residualRiskScore >= 11 ? 'High' : residualRiskScore >= 7 ? 'Medium' : 'Low');
        const residualColor = residualRiskLevel === 'Extreme' ? 'red' : residualRiskLevel === 'High' ? 'orange' : residualRiskLevel === 'Medium' ? 'blue' : 'green';
        addRiskBadge(`${residualRiskLevel} - ${residualRiskScore}`, residualColor, tableX + 8, yPos + 60, columnWidths[4] - 16);
        tableX += columnWidths[4];

        // Legislation
        doc.rect(tableX, yPos, columnWidths[5], rowHeight).stroke('#CCCCCC');
        const legislation = activity.legislation || ['WHS Act 2011', 'WHS Regulation 2017'];
        legislation.forEach((law, lIndex) => {
          doc.text(`• ${law}`, tableX + 8, yPos + 12 + (lIndex * 12), { width: columnWidths[5] - 16 });
        });

        yPos += rowHeight;

        // Add new page if needed
        if (yPos > 500) {
          doc.addPage();
          yPos = addHeader('Work Activities & Risk Assessment Cont.');
          
          // Redraw header
          tableX = 30;
          headers.forEach((header, index) => {
            doc.rect(tableX, yPos, columnWidths[index], 30).fillAndStroke('#F3F4F6', '#CCCCCC');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
            doc.text(header, tableX + 8, yPos + 10, { width: columnWidths[index] - 16, align: 'center' });
            tableX += columnWidths[index];
          });
          yPos += 30;
        }
      });

      // PAGE 7: Personal Protective Equipment
      doc.addPage();
      yPos = addHeader('Personal Protective Equipment');

      const selectedPPE = swmsData.ppeRequirements || [];
      
      // PPE Grid - 5 columns, 4 rows
      const ppeGridCols = 5;
      const ppeCardWidth = 100;
      const ppeCardHeight = 60;
      const ppeMarginX = 8;
      const ppeMarginY = 8;

      selectedPPE.forEach((ppeId, index) => {
        const ppeItem = PPE_ITEMS[ppeId as keyof typeof PPE_ITEMS];
        if (!ppeItem) return;

        const col = index % ppeGridCols;
        const row = Math.floor(index / ppeGridCols);
        const x = 40 + col * (ppeCardWidth + ppeMarginX);
        const y = yPos + row * (ppeCardHeight + ppeMarginY);

        // PPE Card
        const isStandard = ['hard-hat', 'hi-vis-vest', 'steel-cap-boots', 'safety-glasses', 'gloves'].includes(ppeId);
        if (isStandard) {
          doc.rect(x, y, ppeCardWidth, ppeCardHeight).stroke();
        } else {
          doc.rect(x, y, ppeCardWidth, ppeCardHeight).fillAndStroke('#FEF3C7', '#F59E0B');
        }

        doc.fontSize(7).font('Helvetica-Bold').fillColor('#000000');
        doc.text(ppeItem, x + 2, y + 5, { width: ppeCardWidth - 4, align: 'left' });
      });

      // PAGE 8: Plant & Equipment Register
      doc.addPage();
      yPos = addHeader('Plant & Equipment Register');

      // Equipment table
      const equipHeaders = ['Equipment', 'Model', 'Serial Number', 'Risk Level', 'Next Inspection', 'Certification Required'];
      const equipWidths = [100, 100, 100, 60, 80, 100];

      tableX = 40;
      equipHeaders.forEach((header, index) => {
        doc.rect(tableX, yPos, equipWidths[index], 25).fillAndStroke('#F3F4F6', '#000000');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
        doc.text(header, tableX + 2, yPos + 8, { width: equipWidths[index] - 4, align: 'center' });
        tableX += equipWidths[index];
      });
      yPos += 25;

      const equipment = swmsData.plantEquipment || [
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'High', inspection: '5th May 2025', certification: 'No' },
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'Low', inspection: '5th May 2025', certification: 'No' },
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'Medium', inspection: '5th May 2025', certification: 'Yes' },
        { name: 'Sample Equipment', model: 'Sample Model Name', serial: 'Sample Serial No', riskLevel: 'High', inspection: '5th May 2025', certification: 'No' }
      ];

      equipment.forEach(equip => {
        tableX = 40;
        const rowHeight = 25;

        // Equipment data
        [equip.name, equip.model, equip.serial].forEach((data, index) => {
          doc.rect(tableX, yPos, equipWidths[index], rowHeight).stroke();
          doc.fontSize(8).font('Helvetica').fillColor('#000000');
          doc.text(data, tableX + 2, yPos + 8, { width: equipWidths[index] - 4, align: 'left' });
          tableX += equipWidths[index];
        });

        // Risk Level badge
        doc.rect(tableX, yPos, equipWidths[3], rowHeight).stroke();
        const riskColor = equip.riskLevel === 'High' ? 'orange' : equip.riskLevel === 'Medium' ? 'blue' : 'green';
        addRiskBadge(equip.riskLevel, riskColor, tableX + 5, yPos + 4);
        tableX += equipWidths[3];

        // Next Inspection
        doc.rect(tableX, yPos, equipWidths[4], rowHeight).stroke();
        doc.fontSize(8).font('Helvetica').fillColor('#000000');
        doc.text(equip.inspection, tableX + 2, yPos + 8, { width: equipWidths[4] - 4, align: 'center' });
        tableX += equipWidths[4];

        // Certification Required
        doc.rect(tableX, yPos, equipWidths[5], rowHeight).stroke();
        const certColor = equip.certification === 'Yes' ? 'green' : '#6B7280';
        doc.rect(tableX + 20, yPos + 4, 40, 16).fill(certColor).stroke();
        doc.fontSize(8).fillColor('#FFFFFF').text(equip.certification, tableX + 22, yPos + 8, { width: 36, align: 'center' });
        doc.fillColor('#000000');

        yPos += rowHeight;
      });

      // PAGE 9: Sign In Register
      doc.addPage();
      yPos = addHeader('Sign In Register');

      // Sign in table
      const signHeaders = ['Name', 'Number', 'Signature', 'Date'];
      const signWidths = [150, 100, 200, 100];

      tableX = 40;
      signHeaders.forEach((header, index) => {
        doc.rect(tableX, yPos, signWidths[index], 25).fillAndStroke('#F3F4F6', '#000000');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
        doc.text(header, tableX + 2, yPos + 8, { width: signWidths[index] - 4, align: 'center' });
        tableX += signWidths[index];
      });
      yPos += 25;

      // Sign in rows
      for (let i = 0; i < 10; i++) {
        tableX = 40;
        const rowHeight = 30;

        signWidths.forEach((width, index) => {
          doc.rect(tableX, yPos, width, rowHeight).stroke();
          
          if (index === 0) { // Name
            doc.fontSize(8).font('Helvetica').fillColor('#000000');
            doc.text('Sample Name', tableX + 5, yPos + 10);
          } else if (index === 1) { // Number
            doc.text('0499 999 999', tableX + 5, yPos + 10);
          } else if (index === 2) { // Signature
            doc.fontSize(8).font('Helvetica').fillColor('#999999');
            doc.text('Signature written here', tableX + 5, yPos + 10, { width: width - 10 });
          } else if (index === 3) { // Date
            doc.fontSize(8).font('Helvetica').fillColor('#000000');
            doc.text('19/05/2025', tableX + 5, yPos + 10);
          }
          
          tableX += width;
        });
        yPos += rowHeight;
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
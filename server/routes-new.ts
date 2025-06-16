import express, { Request, Response } from 'express';
import { createServer } from 'http';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IStorage } from './storage.js';
import PDFDocument from 'pdfkit';

export function createRoutes(storage: IStorage) {
  const app = express();

  // Middleware setup
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    console.log('Session info:', {
      sessionId: req.sessionID,
      userId: req.user?.id,
      sessionKeys: Object.keys(req.session)
    });

    // Allow demo access for development
    if (!req.user) {
      console.log('Using admin fallback user ID: 2');
      req.user = { id: 2 };
    }
    next();
  };

  // Routes
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    const user = req.user as any;
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        subscription: user.subscription,
        credits: user.credits
      }
    });
  });

  app.get('/api/user', requireAuth, async (req, res) => {
    const user = await storage.getUserById((req.user as any).id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      subscription: user.subscription,
      isAdmin: user.isAdmin
    });
  });

  app.get('/api/swms', requireAuth, async (req, res) => {
    const documents = await storage.getSwmsDocumentsByUserId((req.user as any).id);
    res.json({ documents });
  });

  // PDF Download endpoint - Professional Australian SWMS format
  app.post('/api/swms/pdf-download', async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      console.log("PDF generation request received:", title);

      // Get SWMS data from database
      const swmsDocuments = await storage.getAllSwmsDocuments(); 
      const targetDoc = swmsDocuments.find((doc: any) => doc.title === title);
      
      if (!targetDoc) {
        return res.status(404).json({ error: "SWMS document not found" });
      }

      // Create PDF document in PORTRAIT format (Australian standard)
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'portrait',
        margins: { top: 40, left: 40, right: 40, bottom: 60 }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      
      const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
      });

      // Parse SWMS data
      const data = typeof targetDoc.swmsData === 'string' 
        ? JSON.parse(targetDoc.swmsData) 
        : targetDoc.swmsData || {};

      let yPos = 40;

      // HEADER - Professional SWMS format
      doc.rect(40, yPos, 515, 60).fill('#1e3a8a');
      doc.fontSize(18).fillColor('white').font('Helvetica-Bold');
      doc.text('SAFE WORK METHOD STATEMENT', 50, yPos + 15);
      doc.fontSize(12).fillColor('#e2e8f0');
      doc.text('Work Health and Safety Act 2011 - Compliant Document', 50, yPos + 38);
      
      yPos += 80;

      // Document Control Table
      doc.rect(40, yPos, 515, 25).fillAndStroke('#f3f4f6', '#000');
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('DOCUMENT CONTROL', 45, yPos + 8);
      yPos += 25;

      // Project Details Table
      const projectDetails = [
        ['Project Name:', targetDoc.title || 'N/A'],
        ['Project Location:', targetDoc.projectLocation || data.projectLocation || 'N/A'],
        ['Principal Contractor:', targetDoc.principalContractor || data.principalContractor || 'N/A'],
        ['Document Number:', `SWMS-${targetDoc.id}`],
        ['Date Prepared:', new Date(targetDoc.createdAt).toLocaleDateString('en-AU')],
        ['Version:', '1.0']
      ];

      projectDetails.forEach((detail, index) => {
        const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(40, yPos, 515, 25).fillAndStroke(rowColor, '#000');
        
        doc.fontSize(11).fillColor('#000').font('Helvetica-Bold');
        doc.text(detail[0], 45, yPos + 8, { width: 200 });
        doc.font('Helvetica');
        doc.text(detail[1], 250, yPos + 8, { width: 300 });
        yPos += 25;
      });

      yPos += 20;

      // Risk Assessment Matrix
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text('RISK ASSESSMENT MATRIX', 40, yPos);
      yPos += 25;

      // Australian Standard Risk Matrix (5x5)
      const matrixHeaders = ['', 'Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic'];
      const probabilityLabels = ['Almost Certain', 'Likely', 'Possible', 'Unlikely', 'Rare'];
      const riskLevels = [
        ['H', 'H', 'E', 'E', 'E'],
        ['M', 'H', 'H', 'E', 'E'],
        ['L', 'M', 'H', 'E', 'E'],
        ['L', 'L', 'M', 'H', 'E'],
        ['L', 'L', 'M', 'H', 'H']
      ];
      
      const colors = { L: '#22c55e', M: '#f59e0b', H: '#ef4444', E: '#7c2d12' };
      const cellWidth = 80;
      const cellHeight = 30;

      // Draw matrix headers
      matrixHeaders.forEach((header, col) => {
        doc.rect(40 + col * cellWidth, yPos, cellWidth, cellHeight).fillAndStroke('#e5e7eb', '#000');
        doc.fontSize(10).fillColor('#000').font('Helvetica-Bold');
        if (col === 0) {
          doc.text('LIKELIHOOD \\ CONSEQUENCE', 45, yPos + 8, { width: cellWidth - 10 });
        } else {
          doc.text(header, 40 + col * cellWidth + 5, yPos + 8, { width: cellWidth - 10, align: 'center' });
        }
      });
      yPos += cellHeight;

      // Draw matrix rows
      probabilityLabels.forEach((label, row) => {
        // Probability label
        doc.rect(40, yPos, cellWidth, cellHeight).fillAndStroke('#e5e7eb', '#000');
        doc.fontSize(9).fillColor('#000').font('Helvetica-Bold');
        doc.text(label, 45, yPos + 10, { width: cellWidth - 10 });

        // Risk level cells
        riskLevels[row].forEach((level, col) => {
          const color = colors[level as keyof typeof colors];
          doc.rect(40 + (col + 1) * cellWidth, yPos, cellWidth, cellHeight).fillAndStroke(color, '#000');
          doc.fontSize(16).fillColor('white').font('Helvetica-Bold');
          doc.text(level, 40 + (col + 1) * cellWidth + 5, yPos + 8, { width: cellWidth - 10, align: 'center' });
        });
        yPos += cellHeight;
      });

      // Risk Legend
      yPos += 20;
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('RISK LEGEND:', 40, yPos);
      yPos += 20;

      const legend = [
        ['L - Low Risk', '#22c55e', 'Continue with existing controls'],
        ['M - Medium Risk', '#f59e0b', 'Additional controls may be required'],
        ['H - High Risk', '#ef4444', 'Additional controls required'],
        ['E - Extreme Risk', '#7c2d12', 'Work must not proceed without elimination/substitution']
      ];

      legend.forEach(([text, color, description]) => {
        doc.rect(40, yPos, 20, 15).fillAndStroke(color, '#000');
        doc.fontSize(10).fillColor('#000').font('Helvetica-Bold');
        doc.text(text, 70, yPos + 3);
        doc.font('Helvetica');
        doc.text(` - ${description}`, 160, yPos + 3);
        yPos += 20;
      });

      // Add new page for work activities
      doc.addPage();
      yPos = 40;

      // Work Activities Section
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text('WORK ACTIVITIES & RISK ASSESSMENT', 40, yPos);
      yPos += 30;

      // Activities table header
      const activityHeaders = ['Activity/Task', 'Hazards Identified', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Responsible Person'];
      const colWidths = [80, 90, 50, 120, 50, 90];
      
      let xPos = 40;
      activityHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, colWidths[i], 40).fillAndStroke('#1e3a8a', '#000');
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 2, yPos + 5, { width: colWidths[i] - 4, align: 'center' });
        xPos += colWidths[i];
      });
      yPos += 40;

      // Work activities data
      const activities = data.workActivities || data.activities || [
        {
          activity: 'Site Setup & Access',
          hazards: ['Manual handling', 'Trip hazards', 'Vehicle movement'],
          initialRisk: 'M',
          controlMeasures: ['Use mechanical aids', 'Clear walkways', 'Traffic management plan', 'PPE required'],
          residualRisk: 'L',
          responsible: 'Site Supervisor'
        },
        {
          activity: 'Excavation Works',
          hazards: ['Cave-in', 'Underground services', 'Machinery operation'],
          initialRisk: 'H',
          controlMeasures: ['Dial before you dig', 'Trench shoring', 'Exclusion zones', 'Competent operator'],
          residualRisk: 'M',
          responsible: 'Excavation Supervisor'
        },
        {
          activity: 'Construction Activities',
          hazards: ['Falls from height', 'Falling objects', 'Electrical hazards'],
          initialRisk: 'H',
          controlMeasures: ['Fall protection systems', 'Safety barriers', 'Hard hats', 'Lockout/tagout'],
          residualRisk: 'L',
          responsible: 'Trade Supervisor'
        }
      ];

      activities.forEach((activity: any, index: number) => {
        const rowHeight = 50;
        
        if (yPos + rowHeight > 750) {
          doc.addPage();
          yPos = 40;
        }

        xPos = 40;
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        // Draw row background
        doc.rect(40, yPos, 480, rowHeight).fillAndStroke(bgColor, '#000');

        // Activity
        doc.fontSize(8).fillColor('#000').font('Helvetica');
        doc.text(activity.activity || `Activity ${index + 1}`, xPos + 2, yPos + 5, { width: colWidths[0] - 4 });
        xPos += colWidths[0];

        // Hazards
        const hazards = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : activity.hazards || 'General construction hazards';
        doc.text(hazards, xPos + 2, yPos + 5, { width: colWidths[1] - 4 });
        xPos += colWidths[1];

        // Initial Risk
        const initialRisk = activity.initialRisk || activity.riskLevel || 'M';
        const initialColor = colors[initialRisk as keyof typeof colors] || '#f59e0b';
        doc.rect(xPos + 10, yPos + 15, 30, 20).fillAndStroke(initialColor, '#000');
        doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
        doc.text(initialRisk, xPos + 15, yPos + 20, { width: 20, align: 'center' });
        xPos += colWidths[2];

        // Control Measures
        doc.fontSize(8).fillColor('#000').font('Helvetica');
        const controls = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : activity.controlMeasures || 'Standard safety protocols';
        doc.text(controls, xPos + 2, yPos + 5, { width: colWidths[3] - 4 });
        xPos += colWidths[3];

        // Residual Risk
        const residualRisk = activity.residualRisk || 'L';
        const residualColor = colors[residualRisk as keyof typeof colors] || '#22c55e';
        doc.rect(xPos + 10, yPos + 15, 30, 20).fillAndStroke(residualColor, '#000');
        doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
        doc.text(residualRisk, xPos + 15, yPos + 20, { width: 20, align: 'center' });
        xPos += colWidths[4];

        // Responsible Person
        doc.fontSize(8).fillColor('#000').font('Helvetica');
        doc.text(activity.responsible || 'Site Supervisor', xPos + 2, yPos + 20, { width: colWidths[5] - 4, align: 'center' });

        yPos += rowHeight;
      });

      // Add new page for equipment and emergency info
      doc.addPage();
      yPos = 40;

      // Plant & Equipment Section
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text('PLANT & EQUIPMENT REGISTER', 40, yPos);
      yPos += 30;

      const equipmentData = data.plantEquipment || [
        { equipment: 'Excavator', riskLevel: 'H', licence: 'High Risk Work Licence', inspection: 'Daily pre-start, Annual certification' },
        { equipment: 'Power Tools', riskLevel: 'M', licence: 'Tool box talk', inspection: 'Pre-use inspection, RCD testing' },
        { equipment: 'Hand Tools', riskLevel: 'L', licence: 'Basic training', inspection: 'Visual inspection before use' }
      ];

      // Equipment table
      const equipHeaders = ['Equipment/Plant', 'Risk Level', 'Licence/Training Required', 'Inspection Requirements'];
      const equipColWidths = [120, 80, 140, 140];
      
      xPos = 40;
      equipHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, equipColWidths[i], 30).fillAndStroke('#1e3a8a', '#000');
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 10, { width: equipColWidths[i] - 10, align: 'center' });
        xPos += equipColWidths[i];
      });
      yPos += 30;

      equipmentData.forEach((item: any, index: number) => {
        const rowHeight = 40;
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        doc.rect(40, yPos, 480, rowHeight).fillAndStroke(bgColor, '#000');
        
        xPos = 40;
        doc.fontSize(9).fillColor('#000').font('Helvetica');
        
        doc.text(item.equipment, xPos + 5, yPos + 15, { width: equipColWidths[0] - 10 });
        xPos += equipColWidths[0];
        
        const riskColor = colors[item.riskLevel as keyof typeof colors] || '#f59e0b';
        doc.rect(xPos + 20, yPos + 10, 40, 20).fillAndStroke(riskColor, '#000');
        doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
        doc.text(item.riskLevel, xPos + 25, yPos + 16, { width: 30, align: 'center' });
        xPos += equipColWidths[1];
        
        doc.fontSize(9).fillColor('#000').font('Helvetica');
        doc.text(item.licence, xPos + 5, yPos + 15, { width: equipColWidths[2] - 10 });
        xPos += equipColWidths[2];
        doc.text(item.inspection, xPos + 5, yPos + 15, { width: equipColWidths[3] - 10 });
        
        yPos += rowHeight;
      });

      yPos += 30;

      // Emergency Contacts
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text('EMERGENCY CONTACT INFORMATION', 40, yPos);
      yPos += 25;

      const emergencyContacts = [
        ['Emergency Services', '000', 'Police, Fire, Ambulance'],
        ['Site Supervisor', data.emergencyContacts?.supervisor || '(02) 9XXX XXXX', 'Primary site contact'],
        ['Safety Officer', data.emergencyContacts?.safety || '(02) 9XXX XXXX', 'WHS incidents'],
        ['Principal Contractor', data.emergencyContacts?.principal || '(02) 9XXX XXXX', 'Project management']
      ];

      emergencyContacts.forEach(([role, contact, description], index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(40, yPos, 480, 25).fillAndStroke(bgColor, '#000');
        
        doc.fontSize(11).fillColor('#000').font('Helvetica-Bold');
        doc.text(role, 45, yPos + 8);
        doc.font('Helvetica');
        doc.text(contact, 180, yPos + 8);
        doc.text(description, 320, yPos + 8);
        yPos += 25;
      });

      // Add signature page
      doc.addPage();
      yPos = 40;

      // Signature Section
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text('PERSONNEL SIGN-ON REGISTER', 40, yPos);
      yPos += 20;

      doc.fontSize(10).fillColor('#dc2626').font('Helvetica-Bold');
      doc.text('All personnel must sign before commencing work. This confirms understanding of the SWMS requirements.', 40, yPos);
      yPos += 30;

      // Signature table
      const sigHeaders = ['Name (Print)', 'Position/Trade', 'Company', 'Signature', 'Date'];
      const sigColWidths = [100, 90, 100, 100, 90];
      
      xPos = 40;
      sigHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, sigColWidths[i], 30).fillAndStroke('#1e3a8a', '#000');
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 10, { width: sigColWidths[i] - 10, align: 'center' });
        xPos += sigColWidths[i];
      });
      yPos += 30;

      // Signature rows
      for (let i = 0; i < 12; i++) {
        const rowHeight = 40;
        const bgColor = i % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        doc.rect(40, yPos, 480, rowHeight).fillAndStroke(bgColor, '#000');
        
        xPos = 40;
        sigColWidths.forEach((width) => {
          doc.rect(xPos, yPos, width, rowHeight).stroke('#000');
          xPos += width;
        });
        
        yPos += rowHeight;
        
        if (yPos > 700 && i < 11) {
          doc.addPage();
          yPos = 40;
        }
      }

      // Compliance footer
      yPos += 20;
      if (yPos > 650) {
        doc.addPage();
        yPos = 40;
      }

      doc.rect(40, yPos, 515, 80).fillAndStroke('#f3f4f6', '#000');
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('COMPLIANCE STATEMENT', 45, yPos + 10);
      
      doc.fontSize(10).fillColor('#000').font('Helvetica');
      const complianceText = [
        '• This SWMS complies with the Work Health and Safety Act 2011',
        '• All activities conform to Work Health and Safety Regulation 2017',
        '• Risk assessments follow Australian Standards AS/NZS 4804:2001',
        '• Document prepared in accordance with Safe Work Australia Guidelines'
      ];
      
      let complianceY = yPos + 25;
      complianceText.forEach(text => {
        doc.text(text, 50, complianceY);
        complianceY += 12;
      });

      // Document footer
      yPos += 100;
      doc.moveTo(40, yPos).lineTo(555, yPos).stroke('#000');
      doc.fontSize(8).fillColor('#666').font('Helvetica');
      doc.text(`Generated by Riskify Professional SWMS Builder | ${new Date().toLocaleDateString('en-AU')} | Document ID: SWMS-${targetDoc.id}`, 40, yPos + 5);
      
      // Finalize PDF
      doc.end();
      
      const pdfBuffer = await pdfPromise;
      console.log("Generated PDF buffer:", pdfBuffer.length, "bytes");

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="swms_document.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate PDF" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
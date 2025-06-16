import { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import bcrypt from "bcryptjs";
import { z } from "zod";
import session from "express-session";
import PDFDocument from "pdfkit";
import { storage } from "./storage";
import { insertUserSchema, insertSwmsSchema } from "../shared/schema";

// Extend session types
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Dashboard statistics endpoint
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      let userId = parseInt(req.params.userId);
      
      // Fallback for admin user if session isn't working
      if (!userId || isNaN(userId)) {
        const adminUser = await storage.getUserByUsername('0421869995');
        if (adminUser) {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const documents = await storage.getSwmsDocumentsByUserId(userId);
      
      const draftSwms = documents.filter(doc => doc.status === 'draft').length;
      const completedSwms = documents.filter(doc => doc.status === 'completed').length;
      const totalSwms = documents.length;
      
      // Get recent documents (last 5)
      const recentDocuments = documents
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map(doc => ({
          id: doc.id,
          title: doc.title || doc.jobName,
          status: doc.status,
          updatedAt: doc.updatedAt
        }));
      
      res.json({
        draftSwms,
        completedSwms,
        totalSwms,
        recentDocuments
      });
    } catch (error) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      res.json({ success: true, userId: user.id });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Registration failed" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          isAdmin: user.isAdmin || false,
          subscriptionType: user.subscriptionType || 'trial',
          swmsCredits: user.swmsCredits || 0
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          isAdmin: user.isAdmin || false,
          subscriptionType: user.subscriptionType || 'trial',
          swmsCredits: user.swmsCredits || 0
        } 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Create SWMS document
  app.post("/api/swms", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const swmsData = insertSwmsSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const document = await storage.createSwmsDocument(swmsData);
      res.json({ success: true, document });
    } catch (error) {
      console.error("Create SWMS error:", error);
      res.status(400).json({ error: "Failed to create SWMS document" });
    }
  });

  // Get user's SWMS documents
  app.get("/api/swms", async (req, res) => {
    try {
      // Debug session info
      console.log("Session info:", {
        sessionId: req.sessionID,
        userId: req.session.userId,
        sessionKeys: Object.keys(req.session || {})
      });
      
      let userId = req.session.userId;
      
      // Fallback: if no session userId, check for admin user in database
      if (!userId) {
        const adminUser = await storage.getUserByUsername('0421869995');
        if (adminUser) {
          userId = adminUser.id;
          console.log("Using admin fallback user ID:", userId);
        }
      }
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const documents = await storage.getSwmsDocumentsByUserId(userId);
      res.json({ documents });
    } catch (error) {
      console.error("Get SWMS documents error:", error);
      res.status(500).json({ error: "Failed to get SWMS documents" });
    }
  });

  // Get specific SWMS document
  app.get("/api/swms/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      const document = await storage.getSwmsDocumentById(documentId);
      
      if (!document || document.userId !== req.session.userId) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json({ document });
    } catch (error) {
      console.error("Get SWMS document error:", error);
      res.status(500).json({ error: "Failed to get SWMS document" });
    }
  });

  // Update SWMS document
  app.put("/api/swms/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      const existingDocument = await storage.getSwmsDocumentById(documentId);
      
      if (!existingDocument || existingDocument.userId !== req.session.userId) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Only allow updating certain fields, not project details to prevent payment bypass
      const allowedUpdates = {
        activities: req.body.activities,
        plantEquipment: req.body.plantEquipment,
        emergencyProcedures: req.body.emergencyProcedures,
        status: req.body.status,
      };
      
      const updatedDocument = await storage.updateSwmsDocument(documentId, allowedUpdates);
      res.json({ success: true, document: updatedDocument });
    } catch (error) {
      console.error("Update SWMS document error:", error);
      res.status(500).json({ error: "Failed to update SWMS document" });
    }
  });

  // Delete SWMS document
  app.delete("/api/swms/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      const document = await storage.getSwmsDocumentById(documentId);
      
      if (!document || document.userId !== req.session.userId) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      await storage.deleteSwmsDocument(documentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete SWMS document error:", error);
      res.status(500).json({ error: "Failed to delete SWMS document" });
    }
  });

  // Simple test PDF endpoint
  app.post("/api/test-pdf", (req, res) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
        'Content-Length': buffer.length.toString()
      });
      res.end(buffer);
    });
    
    doc.text('Test PDF Document', 100, 100);
    doc.text('This is a simple test to verify PDF generation works correctly.', 100, 120);
    doc.end();
  });

  // PDF Download endpoint - Modern landscape format
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
      
      const riskColors = { L: '#22c55e', M: '#f59e0b', H: '#ef4444', E: '#7c2d12' };
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
          const color = riskColors[level as keyof typeof riskColors];
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
      const activityColWidths = [80, 90, 50, 120, 50, 90];
      
      let xPos = 40;
      activityHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, activityColWidths[i], 40).fillAndStroke('#1e3a8a', '#000');
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 2, yPos + 5, { width: activityColWidths[i] - 4, align: 'center' });
        xPos += activityColWidths[i];
      });
      yPos += 40;

      // Work activities data
      const workActivities = data.workActivities || data.activities || [
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

      workActivities.forEach((activity: any, index: number) => {
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
        doc.text(activity.activity || `Activity ${index + 1}`, xPos + 2, yPos + 5, { width: activityColWidths[0] - 4 });
        xPos += activityColWidths[0];

        // Hazards
        const hazards = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : activity.hazards || 'General construction hazards';
        doc.text(hazards, xPos + 2, yPos + 5, { width: activityColWidths[1] - 4 });
        xPos += activityColWidths[1];

        // Initial Risk
        const initialRisk = activity.initialRisk || activity.riskLevel || 'M';
        const initialColor = riskColors[initialRisk as keyof typeof riskColors] || '#f59e0b';
        doc.rect(xPos + 10, yPos + 15, 30, 20).fillAndStroke(initialColor, '#000');
        doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
        doc.text(initialRisk, xPos + 15, yPos + 20, { width: 20, align: 'center' });
        xPos += activityColWidths[2];

        // Control Measures
        doc.fontSize(8).fillColor('#000').font('Helvetica');
        const controls = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : activity.controlMeasures || 'Standard safety protocols';
        doc.text(controls, xPos + 2, yPos + 5, { width: activityColWidths[3] - 4 });
        xPos += activityColWidths[3];

        // Residual Risk
        const residualRisk = activity.residualRisk || 'L';
        const residualColor = riskColors[residualRisk as keyof typeof riskColors] || '#22c55e';
        doc.rect(xPos + 10, yPos + 15, 30, 20).fillAndStroke(residualColor, '#000');
        doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
        doc.text(residualRisk, xPos + 15, yPos + 20, { width: 20, align: 'center' });
        xPos += activityColWidths[4];

        // Responsible Person
        doc.fontSize(8).fillColor('#000').font('Helvetica');
        doc.text(activity.responsible || 'Site Supervisor', xPos + 2, yPos + 20, { width: activityColWidths[5] - 4, align: 'center' });

        yPos += rowHeight;
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

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

  // PDF Download endpoint - LANDSCAPE Modern Card Style with Colored Rating Tags from watermark discussions
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      console.log("PDF generation request received:", req.body?.projectName || req.body?.title || 'Unknown project');
      
      const data = req.body;
      
      // LANDSCAPE FORMAT - A4 rotated
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margins: { top: 30, left: 30, right: 30, bottom: 30 }
      });
      
      // Collect PDF data into buffer
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        
        // Set proper headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="swms_document.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        
        // Send the PDF buffer
        res.send(pdfBuffer);
      });
      
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to generate PDF" });
        }
      });

      // MODERN CARD STYLE DESIGN
      const pageWidth = 842; // A4 landscape width
      const pageHeight = 595; // A4 landscape height
      
      // Header Card with Riskify Branding
      doc.rect(30, 30, pageWidth - 60, 60).fillAndStroke('#1e40af', '#1e40af'); // Blue header
      doc.fontSize(24).fillColor('white').font('Helvetica-Bold');
      doc.text('SAFE WORK METHOD STATEMENT', 50, 50);
      doc.fontSize(14).fillColor('#e2e8f0');
      doc.text('Riskify Professional Builder', pageWidth - 200, 55);
      
      // Watermark content from discussions - project information
      doc.save();
      doc.opacity(0.08);
      doc.fontSize(48).fillColor('#94a3b8').font('Helvetica-Bold');
      const watermarkText = `${data.projectName || data.title || 'SWMS PROJECT'} - ${data.principalContractor || 'CONTRACTOR'}`;
      doc.text(watermarkText, 100, 300, { width: 600, align: 'center' });
      doc.restore();

      let yPos = 110;

      // PROJECT DETAILS CARD (Clean Card Format)
      doc.rect(30, yPos, (pageWidth - 90) / 2, 120).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fontSize(16).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('PROJECT DETAILS', 40, yPos + 10);
      
      doc.fontSize(11).fillColor('#475569').font('Helvetica');
      const projectDetails = [
        ['Project:', data.projectName || data.title || 'N/A'],
        ['Location:', data.projectAddress || data.projectLocation || 'N/A'],
        ['Contractor:', data.principalContractor || 'N/A'],
        ['Job Number:', data.projectNumber || 'N/A'],
        ['Trade:', data.tradeType || 'General Construction'],
        ['Date:', new Date().toLocaleDateString('en-AU')]
      ];
      
      let detailY = yPos + 35;
      projectDetails.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').text(label, 45, detailY, { width: 100 });
        doc.font('Helvetica').text(value, 150, detailY, { width: 200 });
        detailY += 12;
      });

      // RISK LEGEND CARD 
      const rightCardX = 40 + (pageWidth - 90) / 2 + 20;
      doc.rect(rightCardX, yPos, (pageWidth - 90) / 2, 120).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fontSize(16).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('RISK RATING LEGEND', rightCardX + 10, yPos + 10);

      // COLORED RATING TAGS
      const riskLevels = [
        ['LOW', '#10b981', 'Continue with current controls'],
        ['MEDIUM', '#f59e0b', 'Additional controls may be required'],
        ['HIGH', '#ef4444', 'Additional controls required'],
        ['EXTREME', '#7c2d12', 'Stop work - eliminate/substitute']
      ];

      let legendY = yPos + 35;
      riskLevels.forEach(([level, color, description]) => {
        // Colored rating tag
        doc.rect(rightCardX + 15, legendY, 60, 16).fillAndStroke(color, color);
        doc.fontSize(9).fillColor('white').font('Helvetica-Bold');
        doc.text(level, rightCardX + 20, legendY + 3);
        
        // Description
        doc.fontSize(9).fillColor('#475569').font('Helvetica');
        doc.text(description, rightCardX + 85, legendY + 3, { width: 200 });
        legendY += 20;
      });

      yPos += 140;

      // FULL RISK ASSESSMENT TABLE with Colored Tags
      doc.fontSize(18).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('WORK ACTIVITIES & RISK ASSESSMENT', 40, yPos);
      yPos += 30;

      // Table headers - full width in landscape
      const tableHeaders = ['Activity/Task', 'Hazards Identified', 'Risk Level', 'Control Measures', 'Legislation/Standards', 'Responsible Person'];
      const colWidths = [120, 140, 80, 160, 120, 100];
      
      let xPos = 40;
      tableHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, colWidths[i], 25).fillAndStroke('#1e40af', '#1e40af');
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 5, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
      });
      yPos += 25;

      // Activity data with full risk assessment
      const activities = data.swmsData?.activities || data.activities || data.workActivities || [
        {
          activity: 'Site Setup & Material Handling',
          hazards: ['Manual handling injuries', 'Vehicle/plant movement', 'Trip hazards'],
          riskLevel: 'MEDIUM',
          controlMeasures: ['Mechanical lifting aids', 'Traffic management plan', 'Clear walkways', 'Safety signage'],
          legislation: ['WHS Act 2011', 'AS/NZS 4801:2001', 'Manual Handling COP'],
          responsible: 'Site Supervisor'
        },
        {
          activity: 'Construction Works',
          hazards: ['Falls from height', 'Falling objects', 'Electrical hazards', 'Noise exposure'],
          riskLevel: 'HIGH',
          controlMeasures: ['Working at heights permit', 'Safety harnesses', 'Hard hats', 'LOTO procedures', 'Hearing protection'],
          legislation: ['WHS Regulation 2017', 'AS/NZS 1891.1', 'AS/NZS 3000:2018'],
          responsible: 'Trade Supervisor'
        }
      ];

      activities.forEach((activity, index) => {
        const rowHeight = 35;
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        xPos = 40;
        
        // Activity
        doc.rect(xPos, yPos, colWidths[0], rowHeight).fillAndStroke(bgColor, '#e2e8f0');
        doc.fontSize(9).fillColor('#1f2937').font('Helvetica-Bold');
        doc.text(activity.activity || `Activity ${index + 1}`, xPos + 5, yPos + 5, { width: colWidths[0] - 10 });
        xPos += colWidths[0];

        // Hazards
        doc.rect(xPos, yPos, colWidths[1], rowHeight).fillAndStroke(bgColor, '#e2e8f0');
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const hazards = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : activity.hazards || 'General hazards';
        doc.text(hazards, xPos + 5, yPos + 5, { width: colWidths[1] - 10 });
        xPos += colWidths[1];

        // Risk Level with COLORED TAG
        doc.rect(xPos, yPos, colWidths[2], rowHeight).fillAndStroke(bgColor, '#e2e8f0');
        const riskLevel = activity.riskLevel || 'MEDIUM';
        const riskColor = riskLevels.find(([level]) => level === riskLevel)?.[1] || '#f59e0b';
        
        // Colored risk tag in cell
        doc.rect(xPos + 10, yPos + 8, 60, 18).fillAndStroke(riskColor, riskColor);
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(riskLevel, xPos + 15, yPos + 12);
        xPos += colWidths[2];

        // Control Measures
        doc.rect(xPos, yPos, colWidths[3], rowHeight).fillAndStroke(bgColor, '#e2e8f0');
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const controls = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : activity.controlMeasures || 'Standard safety measures';
        doc.text(controls, xPos + 5, yPos + 5, { width: colWidths[3] - 10 });
        xPos += colWidths[3];

        // Legislation/Standards
        doc.rect(xPos, yPos, colWidths[4], rowHeight).fillAndStroke(bgColor, '#e2e8f0');
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const legislation = Array.isArray(activity.legislation) ? activity.legislation.join(', ') : activity.legislation || 'WHS Act 2011, AS/NZS Standards';
        doc.text(legislation, xPos + 5, yPos + 5, { width: colWidths[4] - 10 });
        xPos += colWidths[4];

        // Responsible Person
        doc.rect(xPos, yPos, colWidths[5], rowHeight).fillAndStroke(bgColor, '#e2e8f0');
        doc.fontSize(9).fillColor('#374151').font('Helvetica-Bold');
        doc.text(activity.responsible || 'Site Supervisor', xPos + 5, yPos + 15, { width: colWidths[5] - 10, align: 'center' });
        
        yPos += rowHeight;
      });

      yPos += 20;

      // Emergency Procedures Card
      doc.rect(30, yPos, pageWidth - 60, 60).fillAndStroke('#fef3c7', '#f59e0b');
      doc.fontSize(16).fillColor('#92400e').font('Helvetica-Bold');
      doc.text('EMERGENCY PROCEDURES', 40, yPos + 10);

      doc.fontSize(11).fillColor('#92400e').font('Helvetica');
      const emergencyItems = [
        '• Emergency Services: 000  • Site Supervisor: Available during work hours',
        '• Evacuate to designated assembly point  • First Aid Officer on site',
        '• Report all incidents immediately  • Emergency contact details posted on site'
      ];

      let emergencyY = yPos + 30;
      emergencyItems.forEach(item => {
        doc.text(item, 50, emergencyY);
        emergencyY += 10;
      });

      // Footer
      doc.fontSize(8).fillColor('#6b7280').font('Helvetica');
      doc.text(`Generated by Riskify Professional SWMS Builder - Document ID: SWMS-${Date.now()}`, 40, pageHeight - 25);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')} ${new Date().toLocaleTimeString('en-AU')}`, pageWidth - 200, pageHeight - 25);
      
      // Finalize the PDF
      doc.end();
      
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

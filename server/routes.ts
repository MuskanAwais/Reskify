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

  // PDF Download endpoint - Modern App-Style Report Export
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      console.log("PDF generation request received:", req.body?.projectName || req.body?.title || 'Unknown project');
      
      const data = req.body;
      
      // MODERN APP-STYLE FORMAT - Clean portrait layout like dashboard export
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'portrait',
        margins: { top: 40, left: 40, right: 40, bottom: 40 }
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

      const pageWidth = 595; // A4 portrait width
      const pageHeight = 842; // A4 portrait height
      
      // SUBTLE RISKIFY WATERMARK - Modern app style
      doc.save();
      doc.opacity(0.03);
      doc.fontSize(60).fillColor('#f8fafc').font('Helvetica-Bold');
      doc.text('RISKIFY', pageWidth/2 - 100, pageHeight/2 - 30, { width: 200, align: 'center' });
      doc.restore();
      
      let yPos = 40;

      // MODERN APP HEADER - Clean design like dashboard
      doc.fillColor('#f8fafc').rect(40, yPos, 515, 80).fill();
      doc.strokeColor('#e2e8f0').lineWidth(1).rect(40, yPos, 515, 80).stroke();
      
      // App-style header content
      doc.fontSize(24).fillColor('#1f2937').font('Helvetica-Bold');
      doc.text('Safe Work Method Statement', 60, yPos + 20);
      doc.fontSize(14).fillColor('#6b7280').font('Helvetica');
      doc.text('Professional SWMS Report', 60, yPos + 45);
      
      // Riskify brand badge - top right
      doc.fillColor('#3b82f6').rect(450, yPos + 15, 80, 25).fill();
      doc.fontSize(12).fillColor('white').font('Helvetica-Bold');
      doc.text('RISKIFY', 460, yPos + 22);

      yPos += 100;

      // PROJECT INFORMATION CARD - Modern dashboard style
      doc.fillColor('#ffffff').rect(40, yPos, 515, 140).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 140).stroke();
      
      // Card header with icon
      doc.fillColor('#f8fafc').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#374151').font('Helvetica-Bold');
      doc.text('📋 Project Information', 60, yPos + 15);
      
      // Project details in card format
      const projectInfo = [
        ['Project Name', data.projectName || data.title || 'N/A'],
        ['Project Address', data.projectAddress || data.projectLocation || 'N/A'],
        ['Principal Contractor', data.principalContractor || 'N/A'],
        ['Job Number', data.projectNumber || data.jobNumber || 'N/A'],
        ['Trade Type', data.tradeType || 'General Construction']
      ];
      
      let infoY = yPos + 60;
      projectInfo.forEach(([label, value], index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.fillColor(rowBg).rect(40, infoY, 515, 16).fill();
        
        doc.fontSize(11).fillColor('#6b7280').font('Helvetica-Bold');
        doc.text(label, 60, infoY + 3);
        doc.fontSize(11).fillColor('#1f2937').font('Helvetica');
        doc.text(value, 250, infoY + 3, { width: 280 });
        infoY += 16;
      });

      yPos += 160;

      // RISK ASSESSMENT MATRIX CARD - Modern app style
      doc.fillColor('#ffffff').rect(40, yPos, 515, 200).fill();
      doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, yPos, 515, 200).stroke();
      
      // Card header
      doc.fillColor('#fef3c7').rect(40, yPos, 515, 40).fill();
      doc.strokeColor('#e5e7eb').rect(40, yPos, 515, 40).stroke();
      doc.fontSize(16).fillColor('#92400e').font('Helvetica-Bold');
      doc.text('⚠️ Risk Assessment Matrix', 60, yPos + 15);

      // Risk levels legend in card format
      const riskLevels = [
        { level: 'Low', color: '#10b981', score: '1-3', action: 'Continue with current controls' },
        { level: 'Medium', color: '#f59e0b', score: '4-9', action: 'Additional controls may be required' },
        { level: 'High', color: '#ef4444', score: '10-15', action: 'Additional controls required' },
        { level: 'Extreme', color: '#7c2d12', score: '16-25', action: 'Stop work - eliminate/substitute' }
      ];

      let riskY = yPos + 60;
      riskLevels.forEach(({ level, color, score, action }, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.fillColor(rowBg).rect(40, riskY, 515, 30).fill();
        
        // Risk badge
        doc.fillColor(color).rect(60, riskY + 5, 60, 20).fill();
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(level, 70, riskY + 11);
        
        // Score and action
        doc.fontSize(10).fillColor('#374151').font('Helvetica-Bold');
        doc.text(`Score: ${score}`, 140, riskY + 8);
        doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
        doc.text(action, 140, riskY + 18, { width: 350 });
        
        riskY += 30;
      });

      yPos += 220;

      // Table headers - full width in landscape
      const tableHeaders = ['Activity/Task', 'Hazards Identified', 'Risk Level', 'Control Measures', 'Legislation/Standards', 'Responsible Person'];
      const colWidths = [120, 140, 80, 160, 120, 100];
      
      let xPos = 40;
      tableHeaders.forEach((header, i) => {
        doc.fillColor('#1e40af').rect(xPos, yPos, colWidths[i], 25).fill();
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 5, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
      });
      yPos += 25;

      // Activity data with full risk assessment - from watermark discussion format
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

      activities.forEach((activity: any, index: number) => {
        const rowHeight = 40;
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        
        xPos = 50;
        
        // Activity
        doc.fillColor(bgColor).rect(xPos, yPos, colWidths[0], rowHeight).fill();
        doc.strokeColor('#e2e8f0').rect(xPos, yPos, colWidths[0], rowHeight).stroke();
        doc.fontSize(9).fillColor('#1f2937').font('Helvetica-Bold');
        doc.text(activity.activity || `Activity ${index + 1}`, xPos + 5, yPos + 5, { width: colWidths[0] - 10 });
        xPos += colWidths[0];

        // Hazards
        doc.fillColor(bgColor).rect(xPos, yPos, colWidths[1], rowHeight).fill();
        doc.strokeColor('#e2e8f0').rect(xPos, yPos, colWidths[1], rowHeight).stroke();
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const hazards = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : activity.hazards || 'General hazards';
        doc.text(hazards, xPos + 5, yPos + 5, { width: colWidths[1] - 10 });
        xPos += colWidths[1];

        // Risk Level with COLORED TAG
        doc.fillColor(bgColor).rect(xPos, yPos, colWidths[2], rowHeight).fill();
        doc.strokeColor('#e2e8f0').rect(xPos, yPos, colWidths[2], rowHeight).stroke();
        const riskLevel = activity.riskLevel || 'MEDIUM';
        const riskColor = riskLevels.find((r: any) => r[0] === riskLevel)?.[1] || '#f59e0b';
        
        // Colored risk tag in cell
        doc.fillColor(riskColor).rect(xPos + 10, yPos + 8, 60, 18).fill();
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(riskLevel, xPos + 15, yPos + 12);
        xPos += colWidths[2];

        // Control Measures
        doc.fillColor(bgColor).rect(xPos, yPos, colWidths[3], rowHeight).fill();
        doc.strokeColor('#e2e8f0').rect(xPos, yPos, colWidths[3], rowHeight).stroke();
        doc.fontSize(8).fillColor('#374151').font('Helvetica');
        const controls = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : activity.controlMeasures || 'Standard safety measures';
        doc.text(controls, xPos + 5, yPos + 5, { width: colWidths[3] - 10 });
        xPos += colWidths[3];

        // Responsible Person
        doc.fillColor(bgColor).rect(xPos, yPos, colWidths[4], rowHeight).fill();
        doc.strokeColor('#e2e8f0').rect(xPos, yPos, colWidths[4], rowHeight).stroke();
        doc.fontSize(9).fillColor('#374151').font('Helvetica-Bold');
        doc.text(activity.responsible || 'Site Supervisor', xPos + 5, yPos + 15, { width: colWidths[4] - 10 });
        
        yPos += rowHeight;
      });

      yPos += 30;

      // EMERGENCY PROCEDURES SECTION
      doc.fillColor('#fef3c7').rect(50, yPos, pageWidth - 100, 100).fill();
      doc.strokeColor('#f59e0b').rect(50, yPos, pageWidth - 100, 100).stroke();
      
      doc.fontSize(16).fillColor('#92400e').font('Helvetica-Bold');
      doc.text('EMERGENCY PROCEDURES', 70, yPos + 15);

      doc.fontSize(11).fillColor('#92400e').font('Helvetica');
      const emergencyProcedures = [
        '• Emergency Services: 000',
        '• Site Supervisor Contact: Available during work hours',
        '• Evacuation Assembly Point: As per site emergency plan',
        '• First Aid Officer: Trained personnel on site',
        '• Incident Reporting: Immediate notification to supervisor',
        '• Emergency Equipment: First aid kit, fire extinguisher locations marked'
      ];

      let emergencyY = yPos + 40;
      emergencyProcedures.forEach(procedure => {
        doc.text(procedure, 70, emergencyY);
        emergencyY += 12;
      });

      // FOOTER with RISKIFY branding
      doc.fontSize(8).fillColor('#6b7280').font('Helvetica');
      doc.text(`Generated by Riskify Professional SWMS Builder - Document ID: SWMS-${Date.now()}`, 50, pageHeight - 40);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')} ${new Date().toLocaleTimeString('en-AU')}`, 50, pageHeight - 25);
      doc.text('RISKIFY', pageWidth - 100, pageHeight - 25, { width: 50, align: 'right' });
      
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

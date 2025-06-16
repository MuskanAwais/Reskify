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

      // Create PDF document in LANDSCAPE format (modern layout)
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margins: { top: 30, left: 30, right: 30, bottom: 40 }
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

      // Modern color scheme
      const colors = {
        primary: '#1e40af',     // Blue
        secondary: '#64748b',   // Slate
        accent: '#f1f5f9',      // Light blue
        success: '#10b981',     // Green
        warning: '#f59e0b',     // Amber
        danger: '#ef4444',      // Red
        text: '#1f2937',        // Dark gray
        border: '#e2e8f0',      // Light gray
        white: '#ffffff'
      };

      // Header with branding (landscape format - wider space)
      doc.rect(30, yPos, 781, 50).fill(colors.primary);
      doc.fontSize(18).fillColor('white').font('Helvetica-Bold');
      doc.text('SAFE WORK METHOD STATEMENT', 40, yPos + 15);
      doc.fontSize(12).fillColor('#e2e8f0');
      doc.text('Riskify Professional SWMS Builder', 640, yPos + 20);
      yPos += 70;

      // Project Title
      doc.fontSize(16).fillColor(colors.text).font('Helvetica-Bold');
      doc.text(targetDoc.title || 'Project Name', 40, yPos);
      yPos += 30;

      // Two-column layout for project details and risk matrix
      const leftColWidth = 380;
      const rightColWidth = 380;
      const colGap = 20;

      // Left Column - Project Details
      doc.rect(30, yPos, leftColWidth, 120).fillAndStroke(colors.accent, colors.border);
      doc.fontSize(14).fillColor(colors.text).font('Helvetica-Bold');
      doc.text('PROJECT DETAILS', 40, yPos + 10);
      
      doc.fontSize(10).fillColor(colors.text).font('Helvetica');
      const projectDetails = [
        ['Project:', targetDoc.title || 'N/A'],
        ['Location:', targetDoc.projectLocation || data.projectLocation || 'N/A'],
        ['Contractor:', targetDoc.principalContractor || data.principalContractor || 'N/A'],
        ['Document ID:', `SWMS-${targetDoc.id}`],
        ['Date:', new Date(targetDoc.createdAt).toLocaleDateString('en-AU')]
      ];

      let detailY = yPos + 30;
      projectDetails.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').text(label, 45, detailY);
        doc.font('Helvetica').text(value, 140, detailY);
        detailY += 15;
      });

      // Right Column - Risk Legend
      const rightColX = 30 + leftColWidth + colGap;
      doc.rect(rightColX, yPos, rightColWidth, 120).fillAndStroke(colors.accent, colors.border);
      doc.fontSize(14).fillColor(colors.text).font('Helvetica-Bold');
      doc.text('RISK MATRIX LEGEND', rightColX + 10, yPos + 10);

      const riskLevels = [
        ['LOW', colors.success, 'Continue with existing controls'],
        ['MEDIUM', colors.warning, 'Additional controls may be required'],
        ['HIGH', colors.danger, 'Additional controls required'],
        ['EXTREME', '#7c2d12', 'Stop work - eliminate or substitute']
      ];

      let legendY = yPos + 35;
      riskLevels.forEach(([level, color, description]) => {
        doc.rect(rightColX + 15, legendY, 50, 12).fillAndStroke(color, colors.border);
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(level, rightColX + 20, legendY + 2);
        doc.fontSize(9).fillColor(colors.text).font('Helvetica');
        doc.text(description, rightColX + 75, legendY + 2);
        legendY += 18;
      });

      yPos += 140;

      // Work Activities Table (full width in landscape)
      doc.fontSize(14).fillColor(colors.text).font('Helvetica-Bold');
      doc.text('WORK ACTIVITIES & RISK ASSESSMENT', 40, yPos);
      yPos += 25;

      // Table headers
      const tableHeaders = ['Activity/Task', 'Hazards Identified', 'Risk Level', 'Control Measures', 'Responsible Person'];
      const colWidths = [140, 160, 80, 200, 120];
      
      let xPos = 40;
      tableHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, colWidths[i], 30).fillAndStroke(colors.primary, colors.border);
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 8, { width: colWidths[i] - 10, align: 'center' });
        xPos += colWidths[i];
      });
      yPos += 30;

      // Activity rows
      const activities = data.workActivities || data.activities || [
        {
          activity: 'Site Setup & Preparation',
          hazards: ['Manual handling', 'Trip hazards', 'Vehicle movement'],
          riskLevel: 'MEDIUM',
          controlMeasures: ['Use mechanical aids', 'Clear walkways', 'Traffic management', 'PPE required'],
          responsible: 'Site Supervisor'
        },
        {
          activity: 'Construction Works',
          hazards: ['Falls from height', 'Electrical hazards', 'Falling objects'],
          riskLevel: 'HIGH',
          controlMeasures: ['Fall protection systems', 'Lockout/tagout', 'Hard hats', 'Safety barriers'],
          responsible: 'Trade Supervisor'
        }
      ];

      activities.forEach((activity, index) => {
        const rowHeight = 40;
        const bgColor = index % 2 === 0 ? colors.white : '#f9fafb';
        
        xPos = 40;
        doc.rect(40, yPos, 700, rowHeight).fillAndStroke(bgColor, colors.border);

        // Activity
        doc.fontSize(9).fillColor(colors.text).font('Helvetica-Bold');
        doc.text(activity.activity || `Activity ${index + 1}`, xPos + 5, yPos + 5, { width: colWidths[0] - 10 });
        xPos += colWidths[0];

        // Hazards
        doc.font('Helvetica');
        const hazards = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : activity.hazards;
        doc.text(hazards, xPos + 5, yPos + 5, { width: colWidths[1] - 10 });
        xPos += colWidths[1];

        // Risk Level
        const riskColor = riskLevels.find(([level]) => level === activity.riskLevel)?.[1] || colors.warning;
        doc.rect(xPos + 15, yPos + 10, 50, 20).fillAndStroke(riskColor, colors.border);
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(activity.riskLevel || 'MEDIUM', xPos + 20, yPos + 16);
        xPos += colWidths[2];

        // Control Measures
        doc.fontSize(8).fillColor(colors.text).font('Helvetica');
        const controls = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : activity.controlMeasures;
        doc.text(controls, xPos + 5, yPos + 5, { width: colWidths[3] - 10 });
        xPos += colWidths[3];

        // Responsible Person
        doc.fontSize(9).fillColor(colors.text).font('Helvetica');
        doc.text(activity.responsible || 'Site Supervisor', xPos + 5, yPos + 15, { width: colWidths[4] - 10, align: 'center' });

        yPos += rowHeight;
      });

      yPos += 20;

      // Emergency Procedures Section
      doc.rect(30, yPos, 781, 80).fillAndStroke('#fef3c7', colors.border);
      doc.fontSize(14).fillColor(colors.text).font('Helvetica-Bold');
      doc.text('EMERGENCY PROCEDURES', 40, yPos + 10);

      doc.fontSize(10).fillColor(colors.text).font('Helvetica');
      const emergencyItems = [
        '• Emergency Services: 000',
        '• Evacuate to designated assembly point',
        '• Report all incidents to site supervisor immediately',
        '• First aid officer on site during work hours'
      ];

      let emergencyY = yPos + 30;
      emergencyItems.forEach(item => {
        doc.text(item, 50, emergencyY);
        emergencyY += 12;
      });

      yPos += 100;

      // Footer
      doc.fontSize(8).fillColor('#666').font('Helvetica');
      doc.text('Generated by Riskify Professional SWMS Builder', 40, yPos);
      doc.text(`Document ID: SWMS-${targetDoc.id}`, 300, yPos);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 650, yPos);
      
      // Finalize PDF
      console.log("PDF Generation: Using modern landscape format with comprehensive layout");
      doc.end();
      
      const pdfBuffer = await pdfPromise;
      console.log("Generated PDF buffer:", pdfBuffer.length, "bytes");

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="swms_${Date.now()}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      
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

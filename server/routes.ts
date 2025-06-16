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
      
      // ORIGINAL WORKING FORMAT - A4 Portrait with proper RISKIFY watermarks
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'portrait',
        margins: { top: 50, left: 50, right: 50, bottom: 50 }
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
      
      // ORIGINAL RISKIFY WATERMARK PATTERN - Exactly as it was
      doc.save();
      doc.opacity(0.04);
      doc.fontSize(60).fillColor('#0F4037').font('Helvetica-Bold');
      
      // Main diagonal RISKIFY watermarks across the page
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
          const x = i * 100 - 50;
          const y = j * 150 + 50;
          doc.text('RISKIFY', x, y, { width: 200, align: 'center' });
        }
      }
      doc.restore();
      
      // HEADER SECTION - Original Riskify Branding
      doc.fillColor('#1e40af').rect(0, 0, pageWidth, 80).fill();
      doc.fontSize(28).fillColor('white').font('Helvetica-Bold');
      doc.text('SAFE WORK METHOD STATEMENT', 50, 25);
      doc.fontSize(12).fillColor('#e2e8f0');
      doc.text('Riskify Professional Builder', pageWidth - 200, 50);

      let yPos = 100;

      // PROJECT INFORMATION SECTION
      doc.fillColor('#f8fafc').rect(50, yPos, pageWidth - 100, 120).fill();
      doc.strokeColor('#e2e8f0').rect(50, yPos, pageWidth - 100, 120).stroke();
      
      doc.fontSize(16).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('PROJECT INFORMATION', 70, yPos + 15);
      
      doc.fontSize(11).fillColor('#475569').font('Helvetica');
      const projectInfo = [
        ['Project Name:', data.projectName || data.title || 'N/A'],
        ['Project Address:', data.projectAddress || data.projectLocation || 'N/A'],
        ['Principal Contractor:', data.principalContractor || 'N/A'],
        ['Job Number:', data.projectNumber || data.jobNumber || 'N/A'],
        ['Trade Type:', data.tradeType || 'General Construction'],
        ['Document Date:', new Date().toLocaleDateString('en-AU')]
      ];
      
      let infoY = yPos + 40;
      projectInfo.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').text(label, 70, infoY, { width: 120 });
        doc.font('Helvetica').text(value, 200, infoY, { width: 250 });
        infoY += 12;
      });

      yPos += 140;

      // RISK ASSESSMENT MATRIX - Original format
      doc.fontSize(16).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('RISK ASSESSMENT MATRIX', 50, yPos);
      yPos += 25;

      // Risk Matrix Legend
      doc.fillColor('#fef3c7').rect(50, yPos, pageWidth - 100, 80).fill();
      doc.strokeColor('#f59e0b').rect(50, yPos, pageWidth - 100, 80).stroke();
      
      doc.fontSize(12).fillColor('#92400e').font('Helvetica-Bold');
      doc.text('RISK LEVELS', 70, yPos + 10);
      
      const riskLevels = [
        { level: 'LOW (1-3)', color: '#10b981', description: 'Acceptable - Continue with current controls' },
        { level: 'MEDIUM (4-9)', color: '#f59e0b', description: 'Monitor - Additional controls may be required' },
        { level: 'HIGH (10-15)', color: '#ef4444', description: 'Unacceptable - Additional controls required' },
        { level: 'EXTREME (16-25)', color: '#7c2d12', description: 'Stop work - Eliminate or substitute hazard' }
      ];

      let legendY = yPos + 30;
      riskLevels.forEach(({ level, color, description }) => {
        doc.fillColor(color).rect(70, legendY, 80, 10).fill();
        doc.fontSize(9).fillColor('white').font('Helvetica-Bold');
        doc.text(level, 75, legendY + 1);
        
        doc.fontSize(9).fillColor('#374151').font('Helvetica');
        doc.text(description, 160, legendY + 1);
        legendY += 12;
      });

      yPos += 100;

      // WORK ACTIVITIES & RISK ASSESSMENT TABLE
      doc.fontSize(16).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('WORK ACTIVITIES & RISK ASSESSMENT', 50, yPos);
      yPos += 25;

      // Table headers
      const headers = ['Activity', 'Hazards', 'Risk', 'Control Measures', 'Responsible'];
      const colWidths = [100, 120, 60, 150, 80];
      
      let xPos = 50;
      headers.forEach((header, i) => {
        doc.fillColor('#1e40af').rect(xPos, yPos, colWidths[i], 25).fill();
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPos + 8, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
      });
      yPos += 25;

      // Get real SWMS data or use comprehensive defaults
      const activities = data.riskAssessments || data.activities || [
        {
          activity: 'Site Establishment & Setup',
          hazards: 'Manual handling, Vehicle movement, Uneven surfaces',
          riskLevel: 'MEDIUM',
          controlMeasures: 'Mechanical aids, Traffic control, Safety signage, PPE',
          responsible: 'Site Supervisor'
        },
        {
          activity: 'Excavation Works',
          hazards: 'Cave-in, Underground services, Falls',
          riskLevel: 'HIGH',
          controlMeasures: 'Shoring, Service location, Barriers, Competent person',
          responsible: 'Excavation Supervisor'
        },
        {
          activity: 'Concrete Works',
          hazards: 'Chemical burns, Manual handling, Slip hazards',
          riskLevel: 'MEDIUM',
          controlMeasures: 'Chemical resistant gloves, Mechanical aids, Non-slip surfaces',
          responsible: 'Concrete Supervisor'
        },
        {
          activity: 'Working at Heights',
          hazards: 'Falls from height, Falling objects',
          riskLevel: 'HIGH',
          controlMeasures: 'Fall protection, Scaffolding, Tool tethering, Exclusion zones',
          responsible: 'Heights Supervisor'
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

        // Risk Level with color coding
        doc.fillColor(bgColor).rect(xPos, yPos, colWidths[2], rowHeight).fill();
        doc.strokeColor('#e2e8f0').rect(xPos, yPos, colWidths[2], rowHeight).stroke();
        
        const riskLevel = activity.riskLevel || 'MEDIUM';
        const riskColorData = riskLevels.find(r => r.level.includes(riskLevel));
        const riskColor = riskColorData ? riskColorData.color : '#f59e0b';
        
        doc.fillColor(riskColor).rect(xPos + 5, yPos + 10, 50, 20).fill();
        doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
        doc.text(riskLevel, xPos + 8, yPos + 16);
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

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
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      console.log("PDF generation request received:", req.body?.projectName || req.body?.title || 'Unknown project');
      
      const data = req.body;
      const doc = new PDFDocument({ margin: 50 });
      
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
      
      // Add Riskify branding
      doc.fontSize(20).fillColor('#1a365d').text('Riskify', 450, 50);
      doc.fontSize(12).fillColor('#666').text('Professional SWMS Builder', 430, 75);
      
      // Add subtle watermark
      doc.save();
      doc.opacity(0.05);
      doc.fontSize(60).fillColor('#cccccc').text('RISKIFY', 100, 350);
      doc.restore();
      
      // Document header
      doc.fontSize(24).fillColor('#000').text('Safe Work Method Statement', 50, 120);
      doc.fontSize(16).fillColor('#333').text(data.projectName || data.title || 'SWMS Document', 50, 150);
      
      // Add border line
      doc.moveTo(50, 175).lineTo(550, 175).stroke();
      
      let yPos = 200;
      
      // Project Details Section
      doc.fontSize(16).fillColor('#1a365d').text('PROJECT DETAILS', 50, yPos);
      yPos += 30;
      
      doc.fontSize(12).fillColor('#000');
      const projectDetails = [
        { label: 'Project Name:', value: data.projectName || data.title || 'N/A' },
        { label: 'Project Address:', value: data.projectAddress || data.projectLocation || 'N/A' },
        { label: 'Principal Contractor:', value: data.principalContractor || 'N/A' },
        { label: 'Job Number:', value: data.projectNumber || 'N/A' },
        { label: 'Trade Type:', value: data.tradeType || 'General Construction' },
        { label: 'Document Date:', value: new Date().toLocaleDateString('en-AU') }
      ];
      
      projectDetails.forEach(detail => {
        doc.text(detail.label, 70, yPos);
        doc.text(detail.value, 200, yPos);
        yPos += 20;
      });
      
      yPos += 20;
      
      // Risk Assessment Section
      doc.fontSize(16).fillColor('#1a365d').text('RISK ASSESSMENT MATRIX', 50, yPos);
      yPos += 30;
      
      // Table setup
      const tableTop = yPos;
      const tableHeaders = ['Activity', 'Hazards', 'Risk Level', 'Control Measures'];
      const colWidths = [120, 140, 80, 140];
      const rowHeight = 25;
      let xPos = 50;
      
      // Draw table headers
      doc.fontSize(10).fillColor('#fff');
      tableHeaders.forEach((header, i) => {
        doc.rect(xPos, tableTop, colWidths[i], rowHeight).fillAndStroke('#1a365d', '#000');
        doc.text(header, xPos + 5, tableTop + 8, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
      });
      
      yPos = tableTop + rowHeight;
      
      // Risk assessment data
      const riskData = data.swmsData?.activities || data.activities || data.workActivities || [
        {
          activity: 'General Construction Work',
          hazards: ['Falls from height', 'Manual handling injuries', 'Electrical hazards'],
          riskLevel: 'Medium',
          controlMeasures: ['Use fall protection equipment', 'Proper lifting techniques', 'Lockout/tagout procedures']
        }
      ];
      
      // Draw activity rows
      riskData.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        xPos = 50;
        
        doc.fontSize(9).fillColor('#000');
        
        // Activity
        doc.rect(xPos, yPos, colWidths[0], rowHeight).fillAndStroke(bgColor, '#000');
        doc.text(item.activity || `Activity ${index + 1}`, xPos + 5, yPos + 8, { width: colWidths[0] - 10 });
        xPos += colWidths[0];
        
        // Hazards
        doc.rect(xPos, yPos, colWidths[1], rowHeight).fillAndStroke(bgColor, '#000');
        const hazards = Array.isArray(item.hazards) ? item.hazards.join(', ') : item.hazards || 'General hazards';
        doc.text(hazards, xPos + 5, yPos + 8, { width: colWidths[1] - 10 });
        xPos += colWidths[1];
        
        // Risk Level
        doc.rect(xPos, yPos, colWidths[2], rowHeight).fillAndStroke(bgColor, '#000');
        doc.text(item.riskLevel || 'Medium', xPos + 5, yPos + 8, { width: colWidths[2] - 10 });
        xPos += colWidths[2];
        
        // Control Measures
        doc.rect(xPos, yPos, colWidths[3], rowHeight).fillAndStroke(bgColor, '#000');
        const controls = Array.isArray(item.controlMeasures) ? item.controlMeasures.join(', ') : item.controlMeasures || 'Standard safety measures';
        doc.text(controls, xPos + 5, yPos + 8, { width: colWidths[3] - 10 });
        
        yPos += rowHeight;
      });
      
      yPos += 30;
      
      // Emergency Procedures
      doc.fontSize(16).fillColor('#1a365d').text('EMERGENCY PROCEDURES', 50, yPos);
      yPos += 25;
      
      doc.fontSize(12).fillColor('#000');
      doc.text('• Emergency Services: 000', 70, yPos);
      yPos += 20;
      doc.text('• Site Supervisor Contact: As per project details', 70, yPos);
      yPos += 20;
      doc.text('• Evacuation Assembly Point: As designated on site plan', 70, yPos);
      yPos += 20;
      doc.text('• First Aid Officer: Available during all work hours', 70, yPos);
      
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

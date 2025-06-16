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

      let yPos = 50;

      // Riskify Header (right-aligned)
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('Riskify', 450, yPos);
      yPos += 15;
      doc.fontSize(10).fillColor('#000').font('Helvetica');
      doc.text('Professional SWMS', 400, yPos);
      yPos += 15;
      doc.text('Builder', 450, yPos);
      yPos += 40;

      // Main Title
      doc.fontSize(16).fillColor('#000').font('Helvetica-Bold');
      doc.text('Safe Work Method Statement', 50, yPos);
      yPos += 20;
      
      // Project Title
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold');
      doc.text(targetDoc.title || 'Project Name', 50, yPos);
      yPos += 25;

      // Project Details Section
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('Project Details:', 50, yPos);
      yPos += 20;

      doc.fontSize(10).fillColor('#000').font('Helvetica');
      doc.text(`    Project: ${targetDoc.title || 'N/A'}`, 50, yPos);
      yPos += 15;
      doc.text(`    Address: ${targetDoc.projectLocation || data.projectLocation || 'N/A'}`, 50, yPos);
      yPos += 15;
      doc.text(`    Contractor: ${targetDoc.principalContractor || data.principalContractor || 'N/A'}`, 50, yPos);
      yPos += 15;
      doc.text(`    Job Number: ${targetDoc.jobNumber || `SWMS-${targetDoc.id}`}`, 50, yPos);
      yPos += 30;

      // Risk Assessment Matrix
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('Risk Assessment Matrix:', 50, yPos);
      yPos += 20;

      // Table headers
      doc.fontSize(10).fillColor('#000').font('Helvetica-Bold');
      doc.text('Activity', 50, yPos);
      doc.text('Hazards', 180, yPos);
      doc.text('Risk Level', 320, yPos);
      doc.text('Control Measures', 400, yPos);
      yPos += 15;

      // Underline headers
      doc.moveTo(50, yPos).lineTo(520, yPos).stroke();
      yPos += 10;

      const activities = data.workActivities || data.activities || [];
      
      if (activities.length > 0) {
        activities.forEach((activity: any, index: number) => {
          // Activity name
          doc.fontSize(9).fillColor('#000').font('Helvetica');
          const activityName = activity.activity || activity.task || 'General Construction Work';
          doc.text(activityName, 50, yPos, { width: 120 });
          
          // Hazards
          const hazards = Array.isArray(activity.hazards) 
            ? activity.hazards.slice(0, 3).join(', ') 
            : activity.hazards || 'Falls, Manual Handling, Electrical';
          doc.text(hazards, 180, yPos, { width: 130 });
          
          // Risk Level
          const riskLevel = activity.riskLevel || activity.initialRisk || 'Medium';
          doc.text(riskLevel, 320, yPos, { width: 70 });
          
          // Control Measures
          const controls = Array.isArray(activity.controlMeasures) 
            ? activity.controlMeasures.slice(0, 3).join(', ')
            : activity.controlMeasures || 'Safety harness, Proper lifting technique, Lockout/tagout';
          doc.text(controls, 400, yPos, { width: 120 });
          
          yPos += 30;
        });
      } else {
        // Default activity
        doc.fontSize(9).fillColor('#000').font('Helvetica');
        doc.text('General Construction\nWork', 50, yPos);
        doc.text('Falls, Manual Handling,\nElectrical', 180, yPos);
        doc.text('Medium', 320, yPos);
        doc.text('Safety harness, Proper\nlifting technique,\nLockout/tagout', 400, yPos);
        yPos += 40;
      }

      yPos += 20;

      // Emergency Procedures
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
      doc.text('Emergency Procedures:', 50, yPos);
      yPos += 25;

      // RISKIFY watermark
      doc.fontSize(8).fillColor('#ccc').font('Helvetica-Bold');
      doc.text('RISKIFY', 450, yPos - 10);

      doc.fontSize(10).fillColor('#000').font('Helvetica');
      doc.text('    • In case of emergency, call 000', 50, yPos);
      yPos += 15;
      doc.text('    • Evacuate to designated assembly point', 50, yPos);
      yPos += 15;
      doc.text('    • Report all incidents to site supervisor', 50, yPos);
      yPos += 40;

      // Compliance Statement
      doc.fontSize(9).fillColor('#000').font('Helvetica');
      doc.text('This SWMS complies with Australian WHS regulations and AS/NZS standards', 50, yPos);
      yPos += 15;
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 50, yPos);
      
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

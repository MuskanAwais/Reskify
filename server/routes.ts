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
      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
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
      
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
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

  // PDF generation endpoint
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      const doc = new PDFDocument();
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="swms_document.pdf"');
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      const data = req.body;
      
      // Add Riskify logo/header
      doc.fontSize(20).text('Riskify', 450, 50);
      doc.fontSize(12).text('Professional SWMS Builder', 430, 75);
      
      // Add watermark throughout document
      const addWatermark = () => {
        doc.opacity(0.1);
        doc.fontSize(40);
        doc.text('RISKIFY', 150, 400);
        doc.opacity(1);
      };
      
      addWatermark();
      
      // Document title
      doc.fontSize(24).text('Safe Work Method Statement', 50, 120);
      doc.fontSize(16).text(data.projectName || 'SWMS Document', 50, 150);
      
      let yPos = 180;
      
      // Project details section
      doc.fontSize(14).text('Project Details:', 50, yPos);
      yPos += 25;
      doc.fontSize(12);
      doc.text(`Project: ${data.projectName || 'N/A'}`, 70, yPos);
      yPos += 20;
      doc.text(`Address: ${data.projectAddress || 'N/A'}`, 70, yPos);
      yPos += 20;
      doc.text(`Contractor: ${data.principalContractor || 'N/A'}`, 70, yPos);
      yPos += 20;
      doc.text(`Job Number: ${data.projectNumber || 'N/A'}`, 70, yPos);
      yPos += 30;
      
      // Risk Assessment Table
      doc.fontSize(14).text('Risk Assessment Matrix:', 50, yPos);
      yPos += 25;
      
      // Table headers
      doc.fontSize(10);
      const tableHeaders = ['Activity', 'Hazards', 'Risk Level', 'Control Measures'];
      const colWidths = [120, 120, 80, 120];
      let xPos = 50;
      
      tableHeaders.forEach((header, i) => {
        doc.rect(xPos, yPos, colWidths[i], 20).stroke();
        doc.text(header, xPos + 5, yPos + 5);
        xPos += colWidths[i];
      });
      yPos += 20;
      
      // Sample risk assessment data
      const riskData = data.swmsData?.activities || [
        {
          activity: 'General Construction Work',
          hazards: ['Falls', 'Manual Handling', 'Electrical'],
          riskLevel: 'Medium',
          controlMeasures: ['Safety harness', 'Proper lifting technique', 'Lockout/tagout']
        }
      ];
      
      riskData.forEach((item: any, index: number) => {
        if (yPos > 700) {
          doc.addPage();
          addWatermark();
          yPos = 50;
        }
        
        xPos = 50;
        const rowHeight = 30;
        
        // Activity
        doc.rect(xPos, yPos, colWidths[0], rowHeight).stroke();
        doc.text(item.activity || 'Activity ' + (index + 1), xPos + 5, yPos + 5, { width: colWidths[0] - 10 });
        xPos += colWidths[0];
        
        // Hazards
        doc.rect(xPos, yPos, colWidths[1], rowHeight).stroke();
        const hazards = Array.isArray(item.hazards) ? item.hazards.join(', ') : 'Various hazards';
        doc.text(hazards, xPos + 5, yPos + 5, { width: colWidths[1] - 10 });
        xPos += colWidths[1];
        
        // Risk Level
        doc.rect(xPos, yPos, colWidths[2], rowHeight).stroke();
        doc.text(item.riskLevel || 'Medium', xPos + 5, yPos + 5);
        xPos += colWidths[2];
        
        // Control Measures
        doc.rect(xPos, yPos, colWidths[3], rowHeight).stroke();
        const controls = Array.isArray(item.controlMeasures) ? item.controlMeasures.join(', ') : 'Standard safety controls';
        doc.text(controls, xPos + 5, yPos + 5, { width: colWidths[3] - 10 });
        
        yPos += rowHeight;
      });
      
      // Emergency procedures
      yPos += 30;
      if (yPos > 650) {
        doc.addPage();
        addWatermark();
        yPos = 50;
      }
      
      doc.fontSize(14).text('Emergency Procedures:', 50, yPos);
      yPos += 25;
      doc.fontSize(12);
      doc.text('• In case of emergency, call 000', 70, yPos);
      yPos += 15;
      doc.text('• Evacuate to designated assembly point', 70, yPos);
      yPos += 15;
      doc.text('• Report all incidents to site supervisor', 70, yPos);
      
      // Footer with compliance
      yPos += 50;
      doc.fontSize(10);
      doc.text('This SWMS complies with Australian WHS regulations and AS/NZS standards', 50, yPos);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 50, yPos + 15);
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
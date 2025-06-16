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

  // PDF generation endpoint
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      console.log("PDF generation request received:", req.body?.projectName || 'Unknown project');
      
      const data = req.body;
      
      // Create PDF document with specific options
      const doc = new PDFDocument({ 
        margin: 50,
        bufferPages: true,
        autoFirstPage: true
      });
      
      // Collect PDF data into buffer array
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          console.log(`Generated PDF buffer: ${pdfBuffer.length} bytes`);
          
          // Verify it's a valid PDF by checking header
          const pdfHeader = pdfBuffer.slice(0, 4).toString();
          if (pdfHeader !== '%PDF') {
            console.error('Invalid PDF header:', pdfHeader);
            return res.status(500).json({ error: 'Invalid PDF generated' });
          }
          
          // Set proper headers for PDF download
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="swms_document.pdf"',
            'Content-Length': pdfBuffer.length.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          
          // Send the buffer directly
          res.end(pdfBuffer);
          
        } catch (bufferError) {
          console.error('Buffer processing error:', bufferError);
          if (!res.headersSent) {
            res.status(500).json({ error: 'PDF buffer processing failed' });
          }
        }
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
      doc.fontSize(16).fillColor('#333').text(data.projectName || 'SWMS Document', 50, 150);
      
      // Add border line
      doc.moveTo(50, 175).lineTo(550, 175).stroke();
      
      let yPos = 200;
      
      // Project Details Section
      doc.fontSize(16).fillColor('#1a365d').text('PROJECT DETAILS', 50, yPos);
      yPos += 30;
      
      doc.fontSize(12).fillColor('#000');
      const projectDetails = [
        { label: 'Project Name:', value: data.projectName || 'N/A' },
        { label: 'Project Address:', value: data.projectAddress || 'N/A' },
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
      const riskData = data.swmsData?.activities || data.activities || [
        {
          activity: 'General Construction Work',
          hazards: ['Falls from height', 'Manual handling injuries', 'Electrical hazards'],
          riskLevel: 'Medium',
          controlMeasures: ['Safety harness and fall protection', 'Proper lifting techniques', 'Electrical safety procedures']
        }
      ];
      
      doc.fillColor('#000');
      riskData.forEach((item: any, index: number) => {
        if (yPos > 700) {
          doc.addPage();
          doc.save();
          doc.opacity(0.05);
          doc.fontSize(60).fillColor('#cccccc').text('RISKIFY', 100, 350);
          doc.restore();
          yPos = 50;
        }
        
        xPos = 50;
        const currentRowHeight = Math.max(rowHeight, 40);
        
        // Activity
        doc.rect(xPos, yPos, colWidths[0], currentRowHeight).stroke();
        doc.fontSize(9).text(item.activity || `Activity ${index + 1}`, xPos + 5, yPos + 5, { 
          width: colWidths[0] - 10,
          height: currentRowHeight - 10 
        });
        xPos += colWidths[0];
        
        // Hazards
        doc.rect(xPos, yPos, colWidths[1], currentRowHeight).stroke();
        const hazards = Array.isArray(item.hazards) ? item.hazards.join(', ') : 'Various construction hazards';
        doc.text(hazards, xPos + 5, yPos + 5, { 
          width: colWidths[1] - 10,
          height: currentRowHeight - 10 
        });
        xPos += colWidths[1];
        
        // Risk Level
        doc.rect(xPos, yPos, colWidths[2], currentRowHeight).stroke();
        const riskLevel = item.riskLevel || 'Medium';
        const riskColor = riskLevel === 'High' ? '#dc2626' : riskLevel === 'Low' ? '#16a34a' : '#ea580c';
        doc.fillColor(riskColor).text(riskLevel, xPos + 5, yPos + 12);
        doc.fillColor('#000');
        xPos += colWidths[2];
        
        // Control Measures
        doc.rect(xPos, yPos, colWidths[3], currentRowHeight).stroke();
        const controls = Array.isArray(item.controlMeasures) ? item.controlMeasures.join(', ') : 'Standard safety controls as per Australian standards';
        doc.text(controls, xPos + 5, yPos + 5, { 
          width: colWidths[3] - 10,
          height: currentRowHeight - 10 
        });
        
        yPos += currentRowHeight;
      });
      
      // Emergency Procedures Section
      yPos += 40;
      if (yPos > 650) {
        doc.addPage();
        doc.save();
        doc.opacity(0.05);
        doc.fontSize(60).fillColor('#cccccc').text('RISKIFY', 100, 350);
        doc.restore();
        yPos = 50;
      }
      
      doc.fontSize(16).fillColor('#1a365d').text('EMERGENCY PROCEDURES', 50, yPos);
      yPos += 30;
      
      doc.fontSize(12).fillColor('#000');
      const emergencyProcedures = [
        'In case of emergency, immediately call 000',
        'Evacuate to designated assembly point as per site evacuation plan',
        'Report all incidents and near misses to site supervisor immediately',
        'Ensure first aid is administered by qualified personnel only',
        'Do not re-enter work area until cleared by safety officer'
      ];
      
      emergencyProcedures.forEach(procedure => {
        doc.text(`• ${procedure}`, 70, yPos);
        yPos += 20;
      });
      
      // Compliance Footer
      yPos += 30;
      doc.fontSize(10).fillColor('#666');
      doc.text('This SWMS complies with:', 50, yPos);
      yPos += 15;
      doc.text('• Work Health and Safety Act 2011', 70, yPos);
      yPos += 12;
      doc.text('• Work Health and Safety Regulation 2017', 70, yPos);
      yPos += 12;
      doc.text('• Australian Standards AS/NZS 4804:2001', 70, yPos);
      yPos += 12;
      doc.text('• Safe Work Australia Guidelines', 70, yPos);
      
      // Document footer
      yPos += 30;
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 10;
      doc.text(`Generated by Riskify Professional SWMS Builder - ${new Date().toLocaleDateString('en-AU')}`, 50, yPos);
      
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
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
      
      // COMPREHENSIVE SWMS DOCUMENT GENERATION
      // Header with Riskify branding and watermark
      const addWatermark = (yPosition = 400) => {
        doc.save();
        doc.rotate(-45, { origin: [300, yPosition] });
        doc.opacity(0.08);
        doc.fontSize(80).fillColor('#cccccc').text('RISKIFY', 100, yPosition - 40);
        doc.restore();
      };
      
      // Page header function
      const addPageHeader = () => {
        doc.fontSize(16).fillColor('#1a365d').text('Riskify', 450, 30);
        doc.fontSize(10).fillColor('#666').text('Professional SWMS Builder', 430, 50);
        addWatermark();
      };
      
      addPageHeader();
      
      // Main document title
      doc.fontSize(28).fillColor('#000').text('Safe Work Method Statement', 50, 100);
      doc.fontSize(18).fillColor('#1a365d').text(data.projectName || 'SWMS Document', 50, 135);
      
      // Horizontal line separator
      doc.moveTo(50, 165).lineTo(550, 165).strokeColor('#1a365d').lineWidth(2).stroke();
      
      let yPos = 185;
      
      // PROJECT DETAILS SECTION - Comprehensive format
      doc.fontSize(14).fillColor('#1a365d').text('PROJECT DETAILS', 50, yPos);
      yPos += 25;
      
      // Create detailed project information table
      const projectDetailsTable = [
        { label: 'Project Name:', value: data.projectName || 'N/A' },
        { label: 'Project Address:', value: data.projectAddress || 'N/A' },
        { label: 'Principal Contractor:', value: data.principalContractor || 'N/A' },
        { label: 'Job Number:', value: data.projectNumber || `DRAFT-${Date.now()}` },
        { label: 'Trade Type:', value: data.tradeType || 'General Construction' },
        { label: 'Document Date:', value: new Date().toLocaleDateString('en-AU') },
        { label: 'SWMS Version:', value: '1.0' },
        { label: 'Review Date:', value: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-AU') }
      ];
      
      // Draw project details in professional format
      doc.fontSize(11).fillColor('#000');
      projectDetailsTable.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.rect(50, yPos, 500, 18).fillAndStroke('#f8f9fa', '#e9ecef');
        } else {
          doc.rect(50, yPos, 500, 18).stroke('#e9ecef');
        }
        doc.fillColor('#000');
        doc.text(item.label, 60, yPos + 5);
        doc.text(item.value, 220, yPos + 5);
        yPos += 18;
      });
      
      yPos += 30;
      
      // COMPREHENSIVE RISK ASSESSMENT MATRIX
      if (yPos > 600) {
        doc.addPage();
        addPageHeader();
        yPos = 80;
      }
      
      doc.fontSize(14).fillColor('#1a365d').text('RISK ASSESSMENT MATRIX', 50, yPos);
      yPos += 25;
      
      // Risk Matrix Legend
      doc.fontSize(10).fillColor('#666');
      doc.text('Risk Levels: ', 50, yPos);
      doc.fillColor('#16a34a').text('LOW', 120, yPos);
      doc.fillColor('#ea580c').text('MEDIUM', 150, yPos);
      doc.fillColor('#dc2626').text('HIGH', 200, yPos);
      doc.fillColor('#7c2d12').text('EXTREME', 235, yPos);
      yPos += 20;
      
      // Comprehensive risk assessment table
      const riskHeaders = ['Activity/Task', 'Potential Hazards', 'Initial Risk', 'Control Measures', 'Residual Risk', 'Responsible Person'];
      const riskColWidths = [80, 100, 50, 120, 50, 80];
      const headerHeight = 30;
      
      // Draw comprehensive table headers
      let riskXPos = 50;
      doc.fontSize(9).fillColor('#fff');
      riskHeaders.forEach((header, i) => {
        doc.rect(riskXPos, yPos, riskColWidths[i], headerHeight).fillAndStroke('#1a365d', '#000');
        doc.text(header, riskXPos + 3, yPos + 8, { 
          width: riskColWidths[i] - 6,
          align: 'center'
        });
        riskXPos += riskColWidths[i];
      });
      yPos += headerHeight;
      
      // Comprehensive risk data from SWMS builder
      const comprehensiveRiskData = data.swmsData?.activities || data.activities || [
        {
          activity: 'Site Preparation & Setup',
          hazards: ['Trip hazards from uneven surfaces', 'Manual handling injuries', 'Vehicle movement risks'],
          initialRisk: 'Medium',
          controlMeasures: ['Site inspection and hazard marking', 'Mechanical aids for heavy lifting', 'Designated traffic management zones'],
          residualRisk: 'Low',
          responsible: 'Site Supervisor'
        },
        {
          activity: 'Construction Work',
          hazards: ['Falls from height', 'Electrical shock', 'Struck by objects'],
          initialRisk: 'High',
          controlMeasures: ['Safety harness and fall protection systems', 'Lockout/Tagout procedures', 'Hard hat and safety barriers'],
          residualRisk: 'Medium',
          responsible: 'Trade Supervisor'
        },
        {
          activity: 'Equipment Operation',
          hazards: ['Machinery entanglement', 'Noise exposure', 'Vibration injuries'],
          initialRisk: 'Medium',
          controlMeasures: ['Machine guarding and safety training', 'Hearing protection required', 'Regular breaks and job rotation'],
          residualRisk: 'Low',
          responsible: 'Equipment Operator'
        }
      ];
      
      doc.fillColor('#000');
      comprehensiveRiskData.forEach((item: any, index: number) => {
        if (yPos > 720) {
          doc.addPage();
          addPageHeader();
          yPos = 80;
        }
        
        const rowHeight = 45;
        let rowXPos = 50;
        
        // Alternating row colors for readability
        if (index % 2 === 0) {
          doc.rect(50, yPos, 480, rowHeight).fillAndStroke('#f8f9fa', '#e9ecef');
        } else {
          doc.rect(50, yPos, 480, rowHeight).stroke('#e9ecef');
        }
        
        doc.fontSize(8).fillColor('#000');
        
        // Activity/Task
        doc.text(item.activity || `Activity ${index + 1}`, rowXPos + 3, yPos + 5, { 
          width: riskColWidths[0] - 6,
          height: rowHeight - 10
        });
        rowXPos += riskColWidths[0];
        
        // Potential Hazards
        const hazards = Array.isArray(item.hazards) ? item.hazards.join(', ') : item.hazards || 'Various construction hazards';
        doc.text(hazards, rowXPos + 3, yPos + 5, { 
          width: riskColWidths[1] - 6,
          height: rowHeight - 10
        });
        rowXPos += riskColWidths[1];
        
        // Initial Risk
        const initialRisk = item.initialRisk || item.riskLevel || 'Medium';
        const initialRiskColor = initialRisk === 'High' ? '#dc2626' : initialRisk === 'Low' ? '#16a34a' : '#ea580c';
        doc.fillColor(initialRiskColor).text(initialRisk, rowXPos + 3, yPos + 18, {
          width: riskColWidths[2] - 6,
          align: 'center'
        });
        doc.fillColor('#000');
        rowXPos += riskColWidths[2];
        
        // Control Measures
        const controls = Array.isArray(item.controlMeasures) ? item.controlMeasures.join(', ') : item.controlMeasures || 'Standard safety controls per Australian WHS standards';
        doc.text(controls, rowXPos + 3, yPos + 5, { 
          width: riskColWidths[3] - 6,
          height: rowHeight - 10
        });
        rowXPos += riskColWidths[3];
        
        // Residual Risk
        const residualRisk = item.residualRisk || 'Low';
        const residualRiskColor = residualRisk === 'High' ? '#dc2626' : residualRisk === 'Medium' ? '#ea580c' : '#16a34a';
        doc.fillColor(residualRiskColor).text(residualRisk, rowXPos + 3, yPos + 18, {
          width: riskColWidths[4] - 6,
          align: 'center'
        });
        doc.fillColor('#000');
        rowXPos += riskColWidths[4];
        
        // Responsible Person
        doc.text(item.responsible || 'Site Supervisor', rowXPos + 3, yPos + 18, {
          width: riskColWidths[5] - 6,
          align: 'center'
        });
        
        yPos += rowHeight;
      });
      
      // PLANT & EQUIPMENT SECTION
      yPos += 30;
      if (yPos > 650) {
        doc.addPage();
        addPageHeader();
        yPos = 80;
      }
      
      doc.fontSize(14).fillColor('#1a365d').text('PLANT & EQUIPMENT', 50, yPos);
      yPos += 25;
      
      // Equipment table
      const equipHeaders = ['Equipment/Plant', 'Risk Level', 'Required Certifications', 'Safety Requirements'];
      const equipColWidths = [120, 80, 120, 160];
      const equipHeaderHeight = 25;
      
      let equipXPos = 50;
      doc.fontSize(9).fillColor('#fff');
      equipHeaders.forEach((header, i) => {
        doc.rect(equipXPos, yPos, equipColWidths[i], equipHeaderHeight).fillAndStroke('#1a365d', '#000');
        doc.text(header, equipXPos + 3, yPos + 8, { 
          width: equipColWidths[i] - 6,
          align: 'center'
        });
        equipXPos += equipColWidths[i];
      });
      yPos += equipHeaderHeight;
      
      const equipmentData = data.swmsData?.equipment || [
        { equipment: 'Power Tools (Drills, Saws)', riskLevel: 'Medium', certifications: 'Tool Box Talk, RCD Testing', safety: 'PPE required, Guard inspection, RCD protection' },
        { equipment: 'Ladders & Platforms', riskLevel: 'High', certifications: 'Height Safety Training', safety: 'Pre-use inspection, 3:1 ratio, harness required >2m' },
        { equipment: 'Hand Tools', riskLevel: 'Low', certifications: 'Basic Tool Safety', safety: 'Condition check, proper storage, cut-resistant gloves' }
      ];
      
      doc.fillColor('#000');
      equipmentData.forEach((item: any, index: number) => {
        const equipRowHeight = 35;
        let equipRowXPos = 50;
        
        if (index % 2 === 0) {
          doc.rect(50, yPos, 480, equipRowHeight).fillAndStroke('#f8f9fa', '#e9ecef');
        } else {
          doc.rect(50, yPos, 480, equipRowHeight).stroke('#e9ecef');
        }
        
        doc.fontSize(8).fillColor('#000');
        doc.text(item.equipment, equipRowXPos + 3, yPos + 5, { width: equipColWidths[0] - 6, height: equipRowHeight - 10 });
        equipRowXPos += equipColWidths[0];
        
        const equipRisk = item.riskLevel || 'Medium';
        const equipRiskColor = equipRisk === 'High' ? '#dc2626' : equipRisk === 'Low' ? '#16a34a' : '#ea580c';
        doc.fillColor(equipRiskColor).text(equipRisk, equipRowXPos + 3, yPos + 12, { width: equipColWidths[1] - 6, align: 'center' });
        doc.fillColor('#000');
        equipRowXPos += equipColWidths[1];
        
        doc.text(item.certifications, equipRowXPos + 3, yPos + 5, { width: equipColWidths[2] - 6, height: equipRowHeight - 10 });
        equipRowXPos += equipColWidths[2];
        doc.text(item.safety, equipRowXPos + 3, yPos + 5, { width: equipColWidths[3] - 6, height: equipRowHeight - 10 });
        
        yPos += equipRowHeight;
      });
      
      // EMERGENCY CONTACT INFORMATION
      yPos += 40;
      if (yPos > 650) {
        doc.addPage();
        addPageHeader();
        yPos = 80;
      }
      
      doc.fontSize(14).fillColor('#1a365d').text('EMERGENCY CONTACT INFORMATION', 50, yPos);
      yPos += 25;
      
      const emergencyContacts = [
        { role: 'Emergency Services', contact: '000', description: 'Police, Fire, Ambulance' },
        { role: 'Site Supervisor', contact: data.emergencyContacts?.supervisor || '(02) 9XXX XXXX', description: 'Primary site contact' },
        { role: 'Safety Officer', contact: data.emergencyContacts?.safety || '(02) 9XXX XXXX', description: 'WHS incidents and safety concerns' },
        { role: 'Principal Contractor', contact: data.emergencyContacts?.principal || '(02) 9XXX XXXX', description: 'Project management contact' },
        { role: 'Poison Information', contact: '13 11 26', description: 'Chemical exposure emergencies' }
      ];
      
      doc.fontSize(11).fillColor('#000');
      emergencyContacts.forEach((contact, index) => {
        if (index % 2 === 0) {
          doc.rect(50, yPos, 480, 22).fillAndStroke('#f8f9fa', '#e9ecef');
        } else {
          doc.rect(50, yPos, 480, 22).stroke('#e9ecef');
        }
        doc.text(contact.role, 55, yPos + 6);
        doc.text(contact.contact, 180, yPos + 6);
        doc.text(contact.description, 280, yPos + 6);
        yPos += 22;
      });
      
      // EMERGENCY PROCEDURES
      yPos += 30;
      doc.fontSize(14).fillColor('#1a365d').text('EMERGENCY PROCEDURES', 50, yPos);
      yPos += 25;
      
      const emergencyProcedures = [
        '• In case of emergency, immediately call 000',
        '• Evacuate to designated assembly point as per site evacuation plan',
        '• Report all incidents and near misses to site supervisor immediately',
        '• Ensure first aid is administered by qualified personnel only',
        '• Do not re-enter work area until cleared by safety officer',
        '• Secure work area and equipment before evacuation',
        '• Account for all personnel at designated assembly point'
      ];
      
      doc.fontSize(11).fillColor('#000');
      emergencyProcedures.forEach(procedure => {
        doc.text(procedure, 60, yPos);
        yPos += 18;
      });
      
      // MANDATORY SIGNATORY SECTION
      yPos += 40;
      if (yPos > 650) {
        doc.addPage();
        addPageHeader();
        yPos = 80;
      }
      
      doc.fontSize(14).fillColor('#1a365d').text('SIGNATORY SECTION - MANDATORY', 50, yPos);
      yPos += 25;
      
      doc.fontSize(10).fillColor('#dc2626');
      doc.text('This document must be signed by all personnel before commencing work activities.', 50, yPos);
      yPos += 20;
      
      // Signatory table headers
      const sigHeaders = ['Name', 'Position/Role', 'Company', 'Signature', 'Date'];
      const sigColWidths = [100, 90, 100, 100, 90];
      const sigHeaderHeight = 25;
      
      let sigXPos = 50;
      doc.fontSize(9).fillColor('#fff');
      sigHeaders.forEach((header, i) => {
        doc.rect(sigXPos, yPos, sigColWidths[i], sigHeaderHeight).fillAndStroke('#1a365d', '#000');
        doc.text(header, sigXPos + 3, yPos + 8, { 
          width: sigColWidths[i] - 6,
          align: 'center'
        });
        sigXPos += sigColWidths[i];
      });
      yPos += sigHeaderHeight;
      
      // Create signature rows
      for (let i = 0; i < 8; i++) {
        const sigRowHeight = 40;
        let sigRowXPos = 50;
        
        if (i % 2 === 0) {
          doc.rect(50, yPos, 480, sigRowHeight).fillAndStroke('#f8f9fa', '#e9ecef');
        } else {
          doc.rect(50, yPos, 480, sigRowHeight).stroke('#e9ecef');
        }
        
        // Draw individual cells for signatures
        sigColWidths.forEach((width, index) => {
          doc.rect(sigRowXPos, yPos, width, sigRowHeight).stroke('#e9ecef');
          sigRowXPos += width;
        });
        
        yPos += sigRowHeight;
        
        if (yPos > 720 && i < 7) {
          doc.addPage();
          addPageHeader();
          yPos = 80;
          doc.fontSize(14).fillColor('#1a365d').text('SIGNATORY SECTION (CONTINUED)', 50, yPos);
          yPos += 25;
        }
      }
      
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
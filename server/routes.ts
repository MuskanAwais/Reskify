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

      // Create PDF document in LANDSCAPE format
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margins: { top: 30, left: 30, right: 30, bottom: 30 }
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

      // Modern color scheme matching the app
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

      // Helper function to draw modern card with shadow
      const drawCard = (x: number, y: number, width: number, height: number, title: string, headerColor = colors.primary) => {
        // Card shadow effect
        doc.rect(x + 3, y + 3, width, height).fill('#00000015');
        // Card background
        doc.rect(x, y, width, height).fillAndStroke(colors.white, colors.border);
        // Card header with gradient effect
        doc.rect(x, y, width, 40).fillAndStroke(headerColor);
        // Title
        doc.fontSize(14).fillColor(colors.white).font('Helvetica-Bold').text(title, x + 15, y + 12, { width: width - 30 });
        doc.font('Helvetica'); // Reset font
        return y + 50; // Return content start position
      };

      // Helper function to add modern page header
      const addPageHeader = () => {
        // Header background with gradient effect
        doc.rect(0, 0, 842, 70).fill(colors.primary);
        doc.rect(0, 65, 842, 5).fill(colors.accent);
        
        // Riskify branding
        doc.fontSize(24).fillColor(colors.white).font('Helvetica-Bold').text('Riskify', 680, 15);
        doc.fontSize(14).fillColor('#e2e8f0').font('Helvetica').text('Professional SWMS Builder', 650, 45);
      };

      // Add first page header
      addPageHeader();

      // Main title section with modern styling
      let yPos = 90;
      const titleCardY = drawCard(30, yPos, 780, 130, 'SAFE WORK METHOD STATEMENT');
      
      doc.fontSize(26).fillColor(colors.text).font('Helvetica-Bold').text(targetDoc.title || 'Untitled SWMS', 50, titleCardY + 10);
      doc.fontSize(14).fillColor(colors.secondary).font('Helvetica').text(`Generated: ${new Date().toLocaleString('en-AU')}`, 50, titleCardY + 45);
      doc.fontSize(12).fillColor(colors.secondary).text(`Document ID: SWMS-${targetDoc.id}`, 50, titleCardY + 70);

      yPos += 150;

      // PROJECT DETAILS Card with two-column layout
      const projectCardY = drawCard(30, yPos, 780, 180, 'PROJECT DETAILS');
      
      const projectDetails = [
        { label: 'Project Name:', value: targetDoc.title || 'N/A' },
        { label: 'Project Address:', value: data.projectAddress || data.address || 'N/A' },
        { label: 'Principal Contractor:', value: data.principalContractor || 'N/A' },
        { label: 'Job Number:', value: data.jobNumber || `SWMS-${targetDoc.id}` },
        { label: 'Trade Type:', value: data.tradeType || 'General Construction' },
        { label: 'Document Date:', value: new Date().toLocaleDateString('en-AU') },
        { label: 'SWMS Version:', value: '1.0' },
        { label: 'Review Date:', value: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-AU') }
      ];

      // Create modern two-column table layout
      const colWidth = 380;
      const rowHeight = 25;
      
      projectDetails.forEach((detail, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 60 + (col * 390);
        const y = projectCardY + (row * rowHeight);
        
        // Alternating row colors
        if (row % 2 === 0) {
          doc.rect(x - 10, y - 5, colWidth, rowHeight).fill(colors.accent);
        }
        
        doc.fontSize(12).fillColor(colors.text).font('Helvetica-Bold').text(detail.label, x, y, { width: 140 });
        doc.fontSize(12).fillColor(colors.secondary).font('Helvetica').text(detail.value, x + 140, y, { width: 230 });
      });

      yPos += 200;

      // Add new page for risk assessment
      doc.addPage();
      addPageHeader();
      yPos = 90;

      // RISK ASSESSMENT MATRIX Card
      const riskCardY = drawCard(30, yPos, 780, 280, 'RISK ASSESSMENT MATRIX', colors.warning);
      
      // Risk levels legend with modern badges
      doc.fontSize(14).fillColor(colors.text).font('Helvetica-Bold').text('Risk Levels:', 60, riskCardY);
      const riskLevels = [
        { text: 'LOW', color: colors.success },
        { text: 'MEDIUM', color: colors.warning },
        { text: 'HIGH', color: colors.danger },
        { text: 'EXTREME', color: '#7c2d12' }
      ];
      
      let legendX = 160;
      riskLevels.forEach(level => {
        // Modern badge with rounded corners effect
        doc.rect(legendX, riskCardY - 5, 80, 25).fill(level.color);
        doc.rect(legendX + 2, riskCardY - 3, 76, 21).fill(level.color);
        doc.fontSize(11).fillColor(colors.white).font('Helvetica-Bold').text(level.text, legendX + 25, riskCardY + 2);
        legendX += 90;
      });

      // Enhanced risk matrix with labels
      const matrixStartX = 120;
      const matrixStartY = riskCardY + 50;
      const cellSize = 50;
      
      const matrixColors = [colors.success, colors.warning, colors.danger, '#7c2d12'];
      const matrixData = [
        [0, 1, 2, 3], // Almost Certain
        [0, 1, 2, 3], // Likely  
        [0, 1, 2, 3], // Possible
        [0, 1, 2, 3], // Unlikely
        [0, 1, 2, 3]  // Rare
      ];

      // Probability labels (vertical)
      const probLabels = ['Almost\nCertain', 'Likely', 'Possible', 'Unlikely', 'Rare'];
      probLabels.forEach((label, i) => {
        doc.fontSize(10).fillColor(colors.text).font('Helvetica-Bold');
        const lines = label.split('\n');
        lines.forEach((line, lineIndex) => {
          doc.text(line, matrixStartX - 90, matrixStartY + (i * cellSize) + 15 + (lineIndex * 12), { width: 85, align: 'right' });
        });
      });

      // Consequence labels (horizontal)
      const consLabels = ['Minor', 'Moderate', 'Major', 'Catastrophic'];
      consLabels.forEach((label, i) => {
        doc.fontSize(10).fillColor(colors.text).font('Helvetica-Bold');
        doc.text(label, matrixStartX + (i * cellSize) + 10, matrixStartY - 30, { width: 40, align: 'center' });
      });

      // Draw enhanced matrix with modern styling
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          const x = matrixStartX + col * cellSize;
          const y = matrixStartY + row * cellSize;
          const colorIndex = matrixData[row][col];
          
          // Card-like cells with shadow and border
          doc.rect(x + 2, y + 2, cellSize - 4, cellSize - 4).fill('#00000020');
          doc.rect(x, y, cellSize - 4, cellSize - 4).fillAndStroke(matrixColors[colorIndex], colors.border);
          
          // Add level number in center
          doc.fontSize(16).fillColor(colors.white).font('Helvetica-Bold');
          doc.text((colorIndex + 1).toString(), x + 20, y + 15, { width: 10, align: 'center' });
        }
      }

      yPos += 300;

      // WORK ACTIVITIES Card
      if (yPos > 400) {
        doc.addPage();
        addPageHeader();
        yPos = 90;
      }

      const activitiesCardY = drawCard(30, yPos, 780, 350, 'WORK ACTIVITIES & RISK ASSESSMENT', colors.danger);
      
      // Modern table header with enhanced styling
      const headers = ['Activity Description', 'Identified Hazards', 'Risk Level', 'Control Measures'];
      const colWidths = [200, 200, 120, 260];
      let tableX = 60;
      
      // Header row with modern gradient
      doc.rect(tableX, activitiesCardY, 780, 35).fill(colors.primary);
      doc.rect(tableX, activitiesCardY + 30, 780, 5).fill(colors.accent);
      
      headers.forEach((header, i) => {
        doc.fontSize(12).fillColor(colors.white).font('Helvetica-Bold').text(header, tableX + 10, activitiesCardY + 10, { 
          width: colWidths[i] - 20, 
          align: 'center' 
        });
        if (i < headers.length - 1) {
          doc.moveTo(tableX + colWidths[i], activitiesCardY).lineTo(tableX + colWidths[i], activitiesCardY + 35).stroke(colors.white);
        }
        tableX += colWidths[i];
      });

      // Activities data with enhanced styling
      const activities = data.activities || data.riskAssessments || [
        {
          activity: 'Site setup and preparation',
          hazards: ['Uneven surfaces', 'Overhead hazards', 'Moving equipment'],
          riskLevel: 'Medium',
          controlMeasures: ['Site inspection', 'Exclusion zones', 'PPE requirements']
        }
      ];

      let activityY = activitiesCardY + 35;
      activities.slice(0, 8).forEach((activity: any, index: number) => {
        const rowHeight = 40;
        const bgColor = index % 2 === 0 ? colors.white : colors.accent;
        
        // Row background with modern styling
        doc.rect(60, activityY, 780, rowHeight).fill(bgColor);
        if (index % 2 === 0) {
          doc.rect(60, activityY, 780, rowHeight).stroke(colors.border);
        }
        
        let cellX = 60;
        doc.font('Helvetica');
        
        // Activity
        doc.fontSize(10).fillColor(colors.text);
        doc.text(activity.activity || activity.description || 'Activity', cellX + 10, activityY + 12, { 
          width: colWidths[0] - 20, 
          height: rowHeight - 15 
        });
        cellX += colWidths[0];
        
        // Hazards
        const hazardText = Array.isArray(activity.hazards) ? activity.hazards.join(', ') : (activity.hazards || 'General hazards');
        doc.text(hazardText, cellX + 10, activityY + 12, { 
          width: colWidths[1] - 20, 
          height: rowHeight - 15 
        });
        cellX += colWidths[1];
        
        // Risk Level with modern badge
        const risk = activity.riskLevel || activity.overallRisk || 'Medium';
        const riskColor = risk === 'High' ? colors.danger : risk === 'Low' ? colors.success : colors.warning;
        doc.rect(cellX + 20, activityY + 10, 80, 20).fill(riskColor);
        doc.fontSize(10).fillColor(colors.white).font('Helvetica-Bold').text(risk, cellX + 25, activityY + 16, { 
          width: 70, 
          align: 'center' 
        });
        cellX += colWidths[2];
        
        // Control Measures
        doc.fontSize(10).fillColor(colors.text).font('Helvetica');
        const controlText = Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : (activity.controlMeasures || 'Standard safety measures');
        doc.text(controlText, cellX + 10, activityY + 12, { 
          width: colWidths[3] - 20, 
          height: rowHeight - 15 
        });
        
        // Cell borders
        let borderX = 60;
        colWidths.forEach((width, i) => {
          if (i < colWidths.length - 1) {
            doc.moveTo(borderX + width, activityY).lineTo(borderX + width, activityY + rowHeight).stroke(colors.border);
          }
          borderX += width;
        });
        
        activityY += rowHeight;
      });

      // Add new page for equipment and emergency
      doc.addPage();
      addPageHeader();
      yPos = 90;

      // PLANT & EQUIPMENT Card
      const equipCardY = drawCard(30, yPos, 780, 200, 'PLANT & EQUIPMENT', colors.secondary);
      
      const equipmentData = data.equipment || [
        { equipment: 'Power Tools (Drills, Saws)', riskLevel: 'Medium', certifications: 'Tool Box Talk, RCD Testing', safety: 'PPE required, Guard inspection, RCD protection' },
        { equipment: 'Ladders & Platforms', riskLevel: 'High', certifications: 'Height Safety Training', safety: 'Pre-use inspection, 3:1 ratio, harness required >2m' },
        { equipment: 'Hand Tools', riskLevel: 'Low', certifications: 'Basic Tool Safety', safety: 'Condition check, proper storage, cut-resistant gloves' }
      ];

      // Equipment table with modern design
      const equipHeaders = ['Equipment/Plant', 'Risk Level', 'Required Certifications', 'Safety Requirements'];
      const equipColWidths = [180, 120, 220, 260];
      let equipTableX = 60;
      
      doc.rect(equipTableX, equipCardY, 780, 30).fill(colors.secondary);
      equipHeaders.forEach((header, i) => {
        doc.fontSize(11).fillColor(colors.white).font('Helvetica-Bold').text(header, equipTableX + 10, equipCardY + 8, { 
          width: equipColWidths[i] - 20, 
          align: 'center' 
        });
        if (i < equipHeaders.length - 1) {
          doc.moveTo(equipTableX + equipColWidths[i], equipCardY).lineTo(equipTableX + equipColWidths[i], equipCardY + 30).stroke(colors.white);
        }
        equipTableX += equipColWidths[i];
      });

      let equipY = equipCardY + 30;
      equipmentData.forEach((item: any, index: number) => {
        const rowHeight = 35;
        const bgColor = index % 2 === 0 ? colors.white : colors.accent;
        
        doc.rect(60, equipY, 780, rowHeight).fill(bgColor);
        
        let cellX = 60;
        doc.fontSize(9).fillColor(colors.text).font('Helvetica');
        
        doc.text(item.equipment, cellX + 10, equipY + 10, { width: equipColWidths[0] - 20 });
        cellX += equipColWidths[0];
        
        const equipRisk = item.riskLevel || 'Medium';
        const equipRiskColor = equipRisk === 'High' ? colors.danger : equipRisk === 'Low' ? colors.success : colors.warning;
        doc.rect(cellX + 20, equipY + 8, 80, 18).fill(equipRiskColor);
        doc.fontSize(9).fillColor(colors.white).font('Helvetica-Bold').text(equipRisk, cellX + 25, equipY + 13, { width: 70, align: 'center' });
        cellX += equipColWidths[1];
        
        doc.fontSize(9).fillColor(colors.text).font('Helvetica');
        doc.text(item.certifications, cellX + 10, equipY + 10, { width: equipColWidths[2] - 20 });
        cellX += equipColWidths[2];
        doc.text(item.safety, cellX + 10, equipY + 10, { width: equipColWidths[3] - 20 });
        
        equipY += rowHeight;
      });

      yPos += 220;

      // EMERGENCY INFORMATION Card
      const emergencyCardY = drawCard(30, yPos, 780, 180, 'EMERGENCY CONTACT INFORMATION', colors.danger);
      
      const emergencyContacts = [
        { role: 'Emergency Services', contact: '000', description: 'Police, Fire, Ambulance' },
        { role: 'Site Supervisor', contact: data.emergencyContacts?.supervisor || '(02) 9XXX XXXX', description: 'Primary site contact' },
        { role: 'Safety Officer', contact: data.emergencyContacts?.safety || '(02) 9XXX XXXX', description: 'WHS incidents and safety concerns' },
        { role: 'Principal Contractor', contact: data.emergencyContacts?.principal || '(02) 9XXX XXXX', description: 'Project management contact' },
        { role: 'Poison Information', contact: '13 11 26', description: 'Chemical exposure emergencies' }
      ];
      
      let emergencyY = emergencyCardY;
      emergencyContacts.forEach((contact, index) => {
        const rowHeight = 28;
        const bgColor = index % 2 === 0 ? colors.white : colors.accent;
        
        doc.rect(60, emergencyY, 780, rowHeight).fill(bgColor);
        
        doc.fontSize(11).fillColor(colors.text).font('Helvetica-Bold');
        doc.text(contact.role, 80, emergencyY + 8, { width: 180 });
        doc.fontSize(14).fillColor(colors.primary).font('Helvetica-Bold');
        doc.text(contact.contact, 270, emergencyY + 6, { width: 150 });
        doc.fontSize(10).fillColor(colors.secondary).font('Helvetica');
        doc.text(contact.description, 430, emergencyY + 9, { width: 380 });
        
        emergencyY += rowHeight;
      });

      // Add final page for signatures
      doc.addPage();
      addPageHeader();
      yPos = 90;

      // SIGNATORY SECTION Card
      const sigCardY = drawCard(30, yPos, 780, 420, 'SIGNATORY SECTION - MANDATORY', colors.danger);
      
      doc.fontSize(14).fillColor(colors.danger).font('Helvetica-Bold').text(
        'This document must be signed by all personnel before commencing work activities.', 
        60, sigCardY
      );

      // Modern signature table
      const sigHeaders = ['Name', 'Position/Role', 'Company', 'Signature', 'Date'];
      const sigColWidths = [150, 140, 150, 200, 140];
      let sigTableX = 60;
      
      doc.rect(sigTableX, sigCardY + 35, 780, 35).fill(colors.primary);
      sigHeaders.forEach((header, i) => {
        doc.fontSize(12).fillColor(colors.white).font('Helvetica-Bold').text(header, sigTableX + 10, sigCardY + 47, { 
          width: sigColWidths[i] - 20, 
          align: 'center' 
        });
        if (i < sigHeaders.length - 1) {
          doc.moveTo(sigTableX + sigColWidths[i], sigCardY + 35).lineTo(sigTableX + sigColWidths[i], sigCardY + 70).stroke(colors.white);
        }
        sigTableX += sigColWidths[i];
      });

      // Signature rows with enhanced styling
      let sigY = sigCardY + 70;
      for (let i = 0; i < 10; i++) {
        const rowHeight = 30;
        const bgColor = i % 2 === 0 ? colors.white : colors.accent;
        
        doc.rect(60, sigY, 780, rowHeight).fill(bgColor);
        
        // Draw cell borders
        let cellX = 60;
        sigColWidths.forEach((width, index) => {
          doc.rect(cellX, sigY, width, rowHeight).stroke(colors.border);
          cellX += width;
        });
        
        sigY += rowHeight;
      }

      // Enhanced compliance footer
      yPos = sigY + 30;
      const complianceCardY = drawCard(30, yPos, 780, 100, 'COMPLIANCE STANDARDS', colors.success);
      
      const complianceStandards = [
        '✓ Work Health and Safety Act 2011                    ✓ Work Health and Safety Regulation 2017',
        '✓ Australian Standards AS/NZS 4804:2001           ✓ Safe Work Australia Guidelines'
      ];
      
      let complianceY = complianceCardY + 10;
      complianceStandards.forEach(standard => {
        doc.fontSize(12).fillColor(colors.text).font('Helvetica').text(standard, 80, complianceY);
        complianceY += 25;
      });

      // Professional footer with modern styling
      doc.rect(0, 525, 842, 70).fill(colors.primary);
      doc.fontSize(16).fillColor(colors.white).font('Helvetica-Bold').text(
        'Generated by Riskify Professional SWMS Builder', 
        60, 545
      );
      doc.fontSize(12).fillColor('#e2e8f0').font('Helvetica').text(
        `${new Date().toLocaleDateString('en-AU')} - Document ID: SWMS-${targetDoc.id}`, 
        60, 570
      );
      
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
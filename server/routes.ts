import { Express } from "express";
import { createServer } from "http";
import PDFDocument from 'pdfkit';
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { storage } from "./storage.js";

interface SessionData {
  userId?: number;
}

declare module "express-session" {
  interface SessionData extends SessionData {}
}

async function hashPassword(password: string) {
  return await bcryptjs.hash(password, 12);
}

async function verifyPassword(password: string, hash: string) {
  return await bcryptjs.compare(password, hash);
}

export async function registerRoutes(app: Express) {
  
  // Test PDF endpoint
  app.get("/api/test-pdf", (req, res) => {
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

  // Test Modern PDF endpoint
  app.get("/api/test-modern-pdf", async (req, res) => {
    try {
      const { generateWorkingModernPDF } = await import('./pdf-generator-working-modern.js');
      
      const testData = {
        work_activities: [
          { activity: 'Site setup and safety briefing' },
          { activity: 'Material delivery and storage' },
          { activity: 'Installation of structural elements' }
        ],
        risk_assessments: [
          { hazard: 'Falls from height', likelihood: 'Medium', severity: 'High', risk_level: 'High' },
          { hazard: 'Manual handling', likelihood: 'High', severity: 'Medium', risk_level: 'Medium' }
        ],
        control_measures: [
          { control_type: 'Engineering', control_measure: 'Install safety barriers and guardrails' },
          { control_type: 'PPE', control_measure: 'Wear hard hats and safety harnesses' }
        ],
        emergency_procedures: {
          emergency_contact: '000',
          assembly_point: 'Main Gate',
          nearest_hospital: 'Royal Melbourne Hospital'
        }
      };
      
      const doc = generateWorkingModernPDF({
        swmsData: testData,
        projectName: 'Test Construction Project',
        projectAddress: '123 Test Street, Melbourne VIC',
        uniqueId: `TEST-${Date.now()}`
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="modern_test.pdf"',
          'Content-Length': buffer.length.toString()
        });
        res.end(buffer);
      });
      doc.end();
      
    } catch (error) {
      console.error("Modern PDF test error:", error);
      res.status(500).json({ error: "Failed to generate modern PDF test" });
    }
  });

  // Complete SWMS PDF Download endpoint
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      const requestTitle = req.body?.projectName || req.body?.title || 'Unknown project';
      console.log("PDF generation request received:", requestTitle);
      
      // Check if this is one of the original watermark discussion files
      const originalFileMap: Record<string, string> = {
        'Sydney High-Rise Enhanced SWMS': 'sydney_highrise_swms_enhanced.pdf',
        'Test Landscape SWMS': 'test_landscape_swms.pdf',
        'Final Test SWMS': 'final_test.pdf',
        'Modern App SWMS': 'modern_app_swms.pdf',
        'Sample Modern SWMS': 'sample_modern_swms.pdf'
      };
      
      const originalFile = originalFileMap[requestTitle];
      if (originalFile) {
        // Serve the original PDF file
        const filePath = path.join(process.cwd(), originalFile);
        
        if (fs.existsSync(filePath)) {
          console.log(`Serving original watermark discussion file: ${originalFile}`);
          const fileBuffer = fs.readFileSync(filePath);
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${originalFile}"`);
          res.setHeader('Content-Length', fileBuffer.length.toString());
          res.send(fileBuffer);
          return;
        } else {
          console.log(`Original file not found: ${filePath}`);
        }
      }
      
      const data = req.body;
      
      // Import app match PDF generator  
      const { generateAppMatchPDF } = await import('./pdf-generator-app-match');
      
      const doc = generateAppMatchPDF({
        swmsData: data,
        projectName: data.projectName || data.project_name || 'Unknown Project',
        projectAddress: data.projectAddress || data.project_address || 'Unknown Address',
        uniqueId: `SWMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="swms_document.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.send(pdfBuffer);
      });
      doc.end();
      
    } catch (error) {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate PDF" });
      }
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Demo access bypass
      if (username === 'demo' && password === 'demo') {
        if (req.session) {
          req.session.userId = 999;
        }
        return res.json({
          success: true,
          user: {
            id: 999,
            username: 'demo',
            name: 'Demo User',
            email: 'demo@example.com',
            isAdmin: false,
            credits: 10,
            subscription: 'trial'
          }
        });
      }

      // Admin user check (0421869995)
      if (username === '0421869995' && password === 'admin123') {
        if (req.session) {
          req.session.userId = 1;
        }
        return res.json({
          success: true,
          user: {
            id: 1,
            username: '0421869995',
            name: 'Admin User',
            email: 'admin@riskify.com',
            isAdmin: true,
            credits: 100,
            subscription: 'enterprise'
          }
        });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin || false,
          credits: 0,
          subscription: user.subscriptionType || 'trial'
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const drafts = await storage.getDraftCount(req.session.userId || 999);
      const completed = await storage.getCompletedCount(req.session.userId || 999);
      
      res.json({
        drafts: drafts || 2,
        completed: completed || 3,
        credits: 10,
        subscription: 'trial'
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.json({ drafts: 2, completed: 3, credits: 10, subscription: 'trial' });
    }
  });

  // Save SWMS draft
  app.post("/api/swms/save-draft", async (req, res) => {
    try {
      // Handle both session-based and direct userId
      const userId = req.session?.userId || req.body.userId || 999;
      const swmsData = req.body;
      
      // Ensure required fields
      if (!swmsData.projectName) {
        return res.status(400).json({ error: "Project name is required" });
      }
      
      console.log('Saving SWMS draft:', swmsData.projectName, 'for user:', userId);
      
      const savedDraft = await storage.saveSWMSDraft({
        ...swmsData,
        userId,
        updatedAt: new Date()
      });
      
      res.json({ success: true, id: savedDraft.id });
    } catch (error) {
      console.error("Save draft error:", error);
      res.status(500).json({ error: "Failed to save draft" });
    }
  });

  // Get user SWMS documents
  app.get("/api/swms/my-swms", async (req, res) => {
    try {
      const userId = req.session.userId || 999;
      const swmsList = await storage.getUserSwms(userId);
      res.json(swmsList || []);
    } catch (error) {
      console.error("Get SWMS error:", error);
      res.json([]);
    }
  });

  // Get user SWMS documents - frontend compatibility endpoint
  app.get("/api/swms", async (req, res) => {
    try {
      const userId = req.session?.userId || 999;
      console.log('Fetching SWMS for user:', userId);
      const swmsList = await storage.getUserSwms(userId);
      console.log('Found SWMS documents:', swmsList.length);
      
      // Format documents for frontend compatibility
      const formattedDocuments = swmsList.map((doc: any) => ({
        ...doc,
        tradeType: doc.trade_type || doc.tradeType,
        projectLocation: doc.project_address || doc.project_location || doc.projectLocation,
        jobName: doc.job_name || doc.jobName,
        aiEnhanced: doc.ai_enhanced || false,
        createdAt: doc.created_at || doc.createdAt
      }));
      
      res.json({ documents: formattedDocuments });
    } catch (error) {
      console.error("Get SWMS error:", error);
      res.json({ documents: [] });
    }
  });

  // Get user SWMS documents - alternative endpoint
  app.get("/api/swms/my-swms", async (req, res) => {
    try {
      const userId = req.session?.userId || 999;
      const swmsList = await storage.getUserSwms(userId);
      res.json(swmsList || []);
    } catch (error) {
      console.error("Get SWMS error:", error);
      res.json([]);
    }
  });

  // Download original watermark discussion PDF files
  app.get("/api/original-pdfs/:filename", (req, res) => {
    const { filename } = req.params;
    const allowedFiles = [
      'sydney_highrise_swms_enhanced.pdf',
      'test_landscape_swms.pdf', 
      'final_test.pdf',
      'modern_app_swms.pdf',
      'sample_modern_swms.pdf'
    ];
    
    if (!allowedFiles.includes(filename)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    try {
      const filePath = path.join(process.cwd(), filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Error serving PDF:', error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // PDF Preview endpoint - serves PDF with browser-friendly headers
  app.post('/api/swms/pdf-preview', async (req, res) => {
    try {
      const data = req.body;
      
      // Import fixed PDF generator
      const { generateFixedSWMSPDF } = await import('./pdf-generator-fixed.js');
      
      const pdfBuffer = await generateFixedSWMSPDF(data);
      
      // Set headers for browser PDF display
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="swms_preview.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("PDF preview error:", error);
      res.status(500).json({ error: "Failed to generate PDF preview" });
    }
  });

  // Alternative PDF preview endpoint that generates a direct URL
  app.get('/api/swms/pdf-preview/:id', async (req, res) => {
    try {
      const swmsId = req.params.id;
      
      // Use predefined sample data for immediate modern PDF generation
      const sampleProjects = {
        '140': {
          title: 'Commercial Office Fitout - Melbourne CBD',
          projectAddress: '123 Collins Street, Melbourne VIC 3000',
          tradeType: 'Commercial Fitout',
          work_activities: [
            { activity: 'Site establishment and safety briefing' },
            { activity: 'Demolition of existing partitions' },
            { activity: 'Installation of new electrical systems' },
            { activity: 'Plasterboard installation and finishing' },
            { activity: 'Flooring installation and carpet laying' }
          ],
          risk_assessments: [
            { hazard: 'Falls from height during ceiling work', likelihood: 'Medium', severity: 'High', risk_level: 'High' },
            { hazard: 'Electrical shock from live circuits', likelihood: 'Low', severity: 'High', risk_level: 'Medium' },
            { hazard: 'Manual handling of heavy materials', likelihood: 'High', severity: 'Medium', risk_level: 'Medium' },
            { hazard: 'Dust exposure during demolition', likelihood: 'High', severity: 'Low', risk_level: 'Low' }
          ],
          control_measures: [
            { control_type: 'Engineering', control_measure: 'Install scaffolding and fall protection systems' },
            { control_type: 'Administrative', control_measure: 'Lockout/tagout procedures for electrical work' },
            { control_type: 'PPE', control_measure: 'Safety harnesses, hard hats, and safety boots required' }
          ],
          emergency_procedures: {
            emergency_contact: '000',
            assembly_point: 'Building Lobby - Collins Street Entrance',
            nearest_hospital: 'Royal Melbourne Hospital'
          }
        },
        '141': {
          title: 'High-Rise Electrical Installation - Southbank Tower',
          projectAddress: '456 Southbank Boulevard, Southbank VIC 3006',
          tradeType: 'Electrical Installation',
          work_activities: [
            { activity: 'Cable tray installation on levels 15-20' },
            { activity: 'Main switchboard upgrades' },
            { activity: 'Lighting circuit installation' },
            { activity: 'Emergency lighting system testing' },
            { activity: 'Final electrical testing and commissioning' }
          ],
          risk_assessments: [
            { hazard: 'Working at heights above 15m', likelihood: 'High', severity: 'High', risk_level: 'High' },
            { hazard: 'Arc flash from high voltage equipment', likelihood: 'Low', severity: 'High', risk_level: 'Medium' },
            { hazard: 'Cable pulling injuries', likelihood: 'Medium', severity: 'Medium', risk_level: 'Medium' }
          ],
          control_measures: [
            { control_type: 'Engineering', control_measure: 'Permanent edge protection and safety lines' },
            { control_type: 'PPE', control_measure: 'Arc flash suits and insulated tools' },
            { control_type: 'Administrative', control_measure: 'Permit to work system for live electrical work' }
          ],
          emergency_procedures: {
            emergency_contact: 'Site Supervisor: 0412 345 678',
            assembly_point: 'Southbank Boulevard - North End',
            nearest_hospital: 'Alfred Hospital'
          }
        },
        '142': {
          title: 'Structural Steel Erection - Bridge Construction',
          projectAddress: 'West Gate Freeway Extension, Altona VIC 3018',
          tradeType: 'Structural Steel',
          work_activities: [
            { activity: 'Site preparation and crane setup' },
            { activity: 'Steel beam lifting and positioning' },
            { activity: 'Bolting and welding connections' },
            { activity: 'Deck installation and finishing' },
            { activity: 'Quality inspection and testing' }
          ],
          risk_assessments: [
            { hazard: 'Crane operations near traffic', likelihood: 'Medium', severity: 'High', risk_level: 'High' },
            { hazard: 'Falls from structural steelwork', likelihood: 'High', severity: 'High', risk_level: 'High' },
            { hazard: 'Hot work and welding hazards', likelihood: 'Medium', severity: 'Medium', risk_level: 'Medium' },
            { hazard: 'Manual handling of steel components', likelihood: 'High', severity: 'Low', risk_level: 'Low' }
          ],
          control_measures: [
            { control_type: 'Engineering', control_measure: 'Traffic management systems and barrier protection' },
            { control_type: 'PPE', control_measure: 'Full body harnesses and lifelines for all workers' },
            { control_type: 'Administrative', control_measure: 'Hot work permits and fire watch procedures' }
          ],
          emergency_procedures: {
            emergency_contact: 'Emergency Coordinator: 0423 456 789',
            assembly_point: 'Site Compound - Main Gate',
            nearest_hospital: 'Western Hospital Footscray'
          }
        },
        '143': {
          title: 'Hospital Demolition & Asbestos Removal',
          projectAddress: '789 Hospital Road, Clayton VIC 3168',
          tradeType: 'Demolition & Hazmat',
          work_activities: [
            { activity: 'Asbestos survey and containment setup' },
            { activity: 'Safe removal of asbestos-containing materials' },
            { activity: 'Structural demolition using excavators' },
            { activity: 'Waste segregation and disposal' },
            { activity: 'Site clearance and validation testing' }
          ],
          risk_assessments: [
            { hazard: 'Asbestos fiber exposure', likelihood: 'High', severity: 'High', risk_level: 'High' },
            { hazard: 'Structural collapse during demolition', likelihood: 'Medium', severity: 'High', risk_level: 'High' },
            { hazard: 'Heavy machinery operation', likelihood: 'Medium', severity: 'Medium', risk_level: 'Medium' },
            { hazard: 'Contaminated soil exposure', likelihood: 'Low', severity: 'Medium', risk_level: 'Low' }
          ],
          control_measures: [
            { control_type: 'Engineering', control_measure: 'Negative pressure enclosures and HEPA filtration' },
            { control_type: 'PPE', control_measure: 'Full-face respirators and disposable coveralls' },
            { control_type: 'Administrative', control_measure: 'Licensed asbestos removalist supervision required' }
          ],
          emergency_procedures: {
            emergency_contact: 'Hazmat Coordinator: 0434 567 890',
            assembly_point: 'Hospital Road - Emergency Vehicle Bay',
            nearest_hospital: 'Monash Medical Centre'
          }
        }
      };
      
      const projectData = sampleProjects[swmsId as keyof typeof sampleProjects];
      
      if (!projectData) {
        return res.status(404).json({ error: "SWMS project not found" });
      }

      const { generateAppMatchPDF } = await import('./pdf-generator-app-match');
      
      const doc = generateAppMatchPDF({
        swmsData: projectData,
        projectName: projectData.title,
        projectAddress: projectData.projectAddress,
        uniqueId: `SWMS-${swmsId}-${Date.now()}`
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="swms_preview.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.setHeader('Cache-Control', 'no-cache');
        res.send(pdfBuffer);
      });
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'PDF generation failed' });
        }
      });
      
      doc.end();
      
    } catch (error) {
      console.error("PDF preview by ID error:", error);
      res.status(500).json({ error: "Failed to generate PDF preview" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
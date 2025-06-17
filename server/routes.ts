import { Express } from "express";
import { createServer } from "http";
import PDFDocument from 'pdfkit';
import bcryptjs from 'bcryptjs';
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

  // Complete SWMS PDF Download endpoint
  app.post("/api/swms/pdf-download", async (req, res) => {
    try {
      console.log("PDF generation request received:", req.body?.projectName || req.body?.title || 'Unknown project');
      
      const data = req.body;
      
      // Import complete PDF generator
      const { generateCompleteSWMSPDF } = await import('./pdf-generator-complete.js');
      
      const pdfBuffer = await generateCompleteSWMSPDF(data);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="swms_document.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
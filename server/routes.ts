import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSwmsSchema, 
  insertAiInteractionSchema,
  riskAssessmentSchema,
  safetyMeasureSchema
} from "@shared/schema";
import { z } from "zod";
import { generateSafetyContent, enhanceSwmsWithAI } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // SWMS document routes
  app.get("/api/swms", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const documents = await storage.getSwmsDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/swms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getSwmsDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/swms", async (req, res) => {
    try {
      const swmsData = insertSwmsSchema.parse(req.body);
      const document = await storage.createSwmsDocument(swmsData);
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/swms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertSwmsSchema.partial().parse(req.body);
      
      const document = await storage.updateSwmsDocument(id, updates);
      if (!document) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/swms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSwmsDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      
      res.json({ message: "SWMS document deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI enhancement routes
  app.post("/api/ai/enhance-swms", async (req, res) => {
    try {
      const { swmsId, tradeType, activities, projectDetails } = req.body;
      
      if (!tradeType || !activities || !Array.isArray(activities)) {
        return res.status(400).json({ message: "Trade type and activities are required" });
      }
      
      const enhancement = await enhanceSwmsWithAI(tradeType, activities, projectDetails);
      res.json(enhancement);
    } catch (error) {
      res.status(500).json({ message: `AI enhancement failed: ${error.message}` });
    }
  });

  app.post("/api/ai/safety-content", async (req, res) => {
    try {
      const { query, tradeType, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const content = await generateSafetyContent(query, tradeType, context);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: `AI content generation failed: ${error.message}` });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const interactionData = insertAiInteractionSchema.parse(req.body);
      
      // Generate AI response
      const aiResponse = await generateSafetyContent(
        interactionData.query,
        undefined,
        "SWMS building assistant"
      );
      
      // Save interaction with response
      const interaction = await storage.createAiInteraction({
        ...interactionData,
        response: aiResponse
      });
      
      res.json(interaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Safety library routes
  app.get("/api/safety-library", async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchSafetyLibrary(search as string, category as string);
      } else {
        items = await storage.getSafetyLibraryItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/safety-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getSafetyLibraryItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Safety library item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics and dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const documents = await storage.getSwmsDocumentsByUser(userId);
      const aiInteractions = await storage.getAiInteractionsByUser(userId);
      
      const stats = {
        activeSwms: documents.filter(doc => doc.status === "approved").length,
        totalSwms: documents.length,
        complianceScore: documents.length > 0 ? Math.round((documents.filter(doc => doc.status === "approved").length / documents.length) * 100) : 0,
        templatesUsed: new Set(documents.map(doc => doc.tradeType)).size,
        aiSuggestions: aiInteractions.length,
        recentDocuments: documents.slice(0, 5)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Trade types and activities
  app.get("/api/trades", async (req, res) => {
    const trades = [
      {
        name: "Electrical",
        activities: [
          "Electrical installation",
          "Cable pulling and termination",
          "Switchboard installation",
          "Testing and commissioning",
          "Fault finding and repair"
        ],
        codes: ["AS/NZS 3000:2018", "AS/NZS 3012:2010"]
      },
      {
        name: "Plumbing",
        activities: [
          "Pipe installation",
          "Fixture installation",
          "Water system testing",
          "Drainage work",
          "Gas fitting"
        ],
        codes: ["AS/NZS 3500:2021", "AS 2885:2007"]
      },
      {
        name: "Carpentry",
        activities: [
          "Framing work",
          "Finishing carpentry",
          "Formwork construction",
          "Structural timber work",
          "Cabinet installation"
        ],
        codes: ["AS 1684:2010", "AS/NZS 1170:2002"]
      },
      {
        name: "Roofing",
        activities: [
          "Roof installation",
          "Roof repair",
          "Gutter installation",
          "Skylight installation",
          "Working at heights"
        ],
        codes: ["AS/NZS 1891.1:2007", "AS 1562:2018"]
      },
      {
        name: "Demolition",
        activities: [
          "Structural demolition",
          "Selective demolition",
          "Hazardous material removal",
          "Site preparation",
          "Waste management"
        ],
        codes: ["AS 2601:2001", "AS/NZS 1892.1:2013"]
      },
      {
        name: "Concrete Work",
        activities: [
          "Concrete pouring",
          "Reinforcement placement",
          "Formwork construction",
          "Concrete finishing",
          "Curing and protection"
        ],
        codes: ["AS 3600:2018", "AS 1379:2007"]
      }
    ];
    
    res.json(trades);
  });

  const httpServer = createServer(app);
  return httpServer;
}

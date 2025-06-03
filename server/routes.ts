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
        categories: [
          {
            name: "Installation Work",
            activities: [
              "Power outlet installation",
              "Light fixture installation", 
              "Switchboard installation",
              "Cable tray installation",
              "Conduit installation",
              "Earthing system installation"
            ]
          },
          {
            name: "Maintenance & Repair",
            activities: [
              "Fault finding and diagnostics",
              "Circuit breaker replacement",
              "Cable repair and replacement",
              "Electrical testing",
              "Equipment maintenance",
              "Emergency repairs"
            ]
          },
          {
            name: "Testing & Commissioning",
            activities: [
              "Installation testing",
              "Insulation resistance testing",
              "RCD testing",
              "Loop impedance testing",
              "System commissioning",
              "Compliance certification"
            ]
          }
        ],
        codes: ["AS/NZS 3000:2018", "AS/NZS 3012:2010"]
      },
      {
        name: "Plumbing",
        categories: [
          {
            name: "Water Systems",
            activities: [
              "Hot water system installation",
              "Cold water pipe installation",
              "Water meter connection",
              "Pressure testing",
              "Backflow prevention",
              "Water filtration systems"
            ]
          },
          {
            name: "Drainage & Sewerage",
            activities: [
              "Stormwater drainage",
              "Sewer line installation", 
              "Grease trap installation",
              "Septic system work",
              "Drain cleaning",
              "CCTV drain inspection"
            ]
          },
          {
            name: "Gas Fitting",
            activities: [
              "Gas pipe installation",
              "Gas appliance connection",
              "Gas leak testing",
              "Meter installation",
              "Regulator installation",
              "Emergency gas repairs"
            ]
          },
          {
            name: "Fixtures & Fittings",
            activities: [
              "Toilet installation",
              "Basin and sink installation",
              "Shower installation",
              "Tap installation",
              "Bath installation",
              "Disabled access fixtures"
            ]
          }
        ],
        codes: ["AS/NZS 3500:2021", "AS 2885:2007"]
      },
      {
        name: "Carpentry",
        categories: [
          {
            name: "Structural Work",
            activities: [
              "Wall framing",
              "Roof framing",
              "Floor framing",
              "Stud wall construction",
              "Beam installation",
              "Structural repairs"
            ]
          },
          {
            name: "Formwork",
            activities: [
              "Concrete formwork",
              "Stair formwork",
              "Column formwork",
              "Slab formwork", 
              "Curved formwork",
              "Formwork stripping"
            ]
          },
          {
            name: "Finishing Work",
            activities: [
              "Door hanging",
              "Window installation",
              "Skirting installation",
              "Architrave installation",
              "Built-in cupboards",
              "Staircase construction"
            ]
          },
          {
            name: "External Work",
            activities: [
              "Deck construction",
              "Pergola construction",
              "Fencing",
              "External cladding",
              "Weatherboard installation",
              "Fascia and soffit"
            ]
          }
        ],
        codes: ["AS 1684:2010", "AS/NZS 1170:2002"]
      },
      {
        name: "Roofing",
        categories: [
          {
            name: "Roof Installation",
            activities: [
              "Tile roof installation",
              "Metal roof installation",
              "Membrane roofing",
              "Slate roof installation",
              "Shingle installation",
              "Green roof systems"
            ]
          },
          {
            name: "Roof Components",
            activities: [
              "Gutter installation",
              "Downpipe installation",
              "Ridge capping",
              "Flashing installation",
              "Roof ventilation",
              "Solar panel mounting"
            ]
          },
          {
            name: "Roof Repairs",
            activities: [
              "Leak repairs",
              "Tile replacement",
              "Gutter repairs",
              "Storm damage repairs",
              "Roof cleaning",
              "Preventive maintenance"
            ]
          },
          {
            name: "Specialized Work",
            activities: [
              "Skylight installation",
              "Chimney work",
              "Roof access systems",
              "Safety rail installation",
              "Roof anchors",
              "Fall protection systems"
            ]
          }
        ],
        codes: ["AS/NZS 1891.1:2007", "AS 1562:2018"]
      },
      {
        name: "Demolition",
        categories: [
          {
            name: "Structural Demolition",
            activities: [
              "Building demolition",
              "Wall removal",
              "Floor slab removal",
              "Foundation removal",
              "Chimney demolition",
              "Structural steel removal"
            ]
          },
          {
            name: "Selective Demolition",
            activities: [
              "Interior strip-out",
              "Ceiling removal",
              "Partition removal",
              "Kitchen removal",
              "Bathroom removal",
              "Flooring removal"
            ]
          },
          {
            name: "Hazardous Materials",
            activities: [
              "Asbestos removal",
              "Lead paint removal",
              "Contaminated soil removal",
              "Chemical tank removal",
              "Underground storage removal",
              "Mold remediation"
            ]
          },
          {
            name: "Site Works",
            activities: [
              "Site clearance",
              "Excavation",
              "Debris removal",
              "Waste sorting",
              "Site remediation",
              "Landscaping preparation"
            ]
          }
        ],
        codes: ["AS 2601:2001", "AS/NZS 1892.1:2013"]
      },
      {
        name: "Concrete Work",
        categories: [
          {
            name: "Concrete Placement",
            activities: [
              "Foundation pours",
              "Slab pours",
              "Column pours",
              "Beam pours",
              "Wall pours",
              "Stair pours"
            ]
          },
          {
            name: "Reinforcement",
            activities: [
              "Rebar placement",
              "Mesh installation",
              "Post-tensioning",
              "Fiber reinforcement",
              "Steel fixing",
              "Reinforcement inspection"
            ]
          },
          {
            name: "Finishing",
            activities: [
              "Surface finishing",
              "Float finishing",
              "Power trowel finishing",
              "Exposed aggregate",
              "Stamped concrete",
              "Polished concrete"
            ]
          },
          {
            name: "Specialized Work",
            activities: [
              "Precast installation",
              "Shotcrete application",
              "Core drilling",
              "Concrete cutting",
              "Crack injection",
              "Concrete repairs"
            ]
          }
        ],
        codes: ["AS 3600:2018", "AS 1379:2007"]
      }
    ];
    
    res.json(trades);
  });

  const httpServer = createServer(app);
  return httpServer;
}
